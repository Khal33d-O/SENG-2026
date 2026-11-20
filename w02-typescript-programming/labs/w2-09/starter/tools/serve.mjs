// SUPPLIED web/collector process (learners do not edit it).  http://127.0.0.1:4179  (PORT overrides)
//
// * Serves the pages, styles and dist/ on 127.0.0.1.
// * Builds and starts the copied .NET board API (supplied-runtime/, net10.0) on PORT+1000 and forwards
//   GET /api/boards/* to it. Ctrl+C stops both. If the .NET SDK is unavailable (or W209_API=node),
//   it serves supplied-runtime/board-reference.json itself and says so (local fallback).
// * Local event collector: POST /api/events stores one record in process memory; GET /api/events lists
//   them. Stopping the server discards every row. Not Grafana, not BP telemetry.
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT ?? 4179);
const apiPort = port + 1000;
const host = "127.0.0.1";
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".map": "application/json; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
};

const events = []; // process memory only
let apiProcess = null;
let apiMode = "node-fallback";

async function startApi() {
  if (process.env.W209_API === "node") return;
  const out = join(root, ".runtime", "api");
  console.log("Building the supplied .NET API (first run can take a while)...");
  const build = spawnSync("dotnet", ["build", join(root, "supplied-runtime", "BoardApi.csproj"), "-o", out, "--nologo", "-v", "q"],
    { cwd: join(root, "supplied-runtime"), stdio: "inherit" });
  if (build.status !== 0) {
    console.warn("WARNING: .NET SDK build unavailable; using the local Node fallback for /api/boards/*.");
    return;
  }
  apiProcess = spawn("dotnet", [join(out, "BoardApi.dll")], {
    cwd: out, stdio: "ignore", env: { ...process.env, ASPNETCORE_URLS: `http://${host}:${apiPort}` },
  });
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(`http://${host}:${apiPort}/healthz`)).ok) { apiMode = "dotnet"; return; }
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 300));
  }
  console.warn("WARNING: the .NET API did not start; using the local Node fallback.");
  apiProcess.kill();
}

function send(res, status, body, type = TYPES[".json"]) {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}

function readBody(req) {
  return new Promise((ok, fail) => {
    let body = "";
    req.on("data", (c) => { body += c; if (body.length > 20_000) req.destroy(); });
    req.on("end", () => ok(body));
    req.on("error", fail);
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${host}`);
  try {
    if (url.pathname === "/api/events" && req.method === "POST") {
      const e = JSON.parse(await readBody(req));
      const ok = typeof e?.runId === "string" && Number.isInteger(e.sequence) && typeof e.action === "string" &&
        typeof e.source === "string" && typeof e.before === "object" && typeof e.after === "object";
      if (!ok) return send(res, 400, JSON.stringify({ code: "INVALID_EVENT" }));
      events.push({ receivedAt: new Date().toISOString(), runId: e.runId, sequence: e.sequence, action: e.action,
        source: e.source, before: e.before, after: e.after });
      return send(res, 201, JSON.stringify({ stored: true, count: events.length }));
    }
    if (url.pathname === "/api/events" && req.method === "GET") return send(res, 200, JSON.stringify({ events }));
    if (url.pathname.startsWith("/api/boards/") && req.method === "GET") {
      if (apiMode === "dotnet") {
        const r = await fetch(`http://${host}:${apiPort}${url.pathname}`);
        return send(res, r.status, await r.text());
      }
      if (url.pathname !== "/api/boards/reference") return send(res, 404, JSON.stringify({ code: "NOT_FOUND", message: "Board not found" }));
      return send(res, 200, await readFile(join(root, "supplied-runtime", "board-reference.json"), "utf8"));
    }
    if (url.pathname === "/healthz") return send(res, 200, "Healthy", "text/plain; charset=utf-8");
    let path = normalize(join(root, decodeURIComponent(url.pathname)));
    if (path !== root && !path.startsWith(root + sep)) return send(res, 403, "Forbidden", "text/plain");
    if ((await stat(path).catch(() => null))?.isDirectory()) path = join(path, "index.html");
    const body = await readFile(path);
    res.writeHead(200, { "Content-Type": TYPES[extname(path)] ?? "application/octet-stream", "Cache-Control": "no-store" });
    res.end(body);
  } catch {
    if (!res.headersSent) send(res, 404, "Not found", "text/plain; charset=utf-8");
  }
});

function stop() {
  apiProcess?.kill();
  server.close();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
server.on("error", (e) => {
  console.error(e.code === "EADDRINUSE" ? `Port ${port} is in use. Stop the old server or use PORT=4189 npm start.` : e);
  apiProcess?.kill();
  process.exit(1);
});

await startApi();
server.listen(port, host, () => {
  console.log(`Integrated application: http://${host}:${port}/   (demo.html?mode=working, practice.html, events.html)`);
  console.log(apiMode === "dotnet" ? `Reference API: supplied .NET API on internal port ${apiPort}` :
    "Reference API: local Node fallback serving supplied-runtime/board-reference.json");
  console.log("Event rows live in this process's memory. Ctrl+C stops the server, the API and discards rows.");
});
