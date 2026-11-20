// SUPPLIED development server and proxy (teaching infrastructure; learners do not edit it).
//
//   http://127.0.0.1:4176  (PORT overrides)
//
// * Serves the page, demos, styles and dist/ on 127.0.0.1.
// * Starts the copied .NET board API (supplied-runtime/, net10.0) on an internal port and
//   forwards GET /api/boards/* to it. Stopping this server (Ctrl+C) stops that API process.
//   If the .NET SDK is unavailable, or W206_API=node is set, it serves
//   supplied-runtime/board-reference.json itself and says so (local fallback, same response).
// * Development-only response-condition selector: GET/POST /dev/response-condition changes the
//   response to later board requests (Unavailable, Malformed JSON, Missing treasure ID, ...).
//   It is NOT a production API feature.
// * GET /api/demo/message?case=valid|wrong-type for Worked Example 2.
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT ?? 4176);
const apiPort = port + 1000;
const host = "127.0.0.1";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const CONDITIONS = [
  "valid", "http", "malformed", "missing-id", "trial", "delayed-zero",
  "zero-budget", "negative-budget", "fractional-budget", "blocked-treasure", "blocked-later", "shared-axis",
];
let condition = "valid";

// ---- the supplied .NET API (or the clearly reported local fallback) ----
let apiProcess = null;
let apiMode = "node-fallback";

async function waitForApi(ms) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(`http://${host}:${apiPort}/healthz`);
      if (r.ok) return true;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

async function startApi() {
  if (process.env.W206_API === "node") return;
  const project = join(root, "supplied-runtime", "BoardApi.csproj");
  const out = join(root, ".runtime", "api");
  console.log("Building the supplied .NET API (first run can take a while)...");
  const build = spawnSync("dotnet", ["build", project, "-c", "Debug", "-o", out, "--nologo", "-v", "q"], {
    cwd: join(root, "supplied-runtime"), stdio: "inherit",
  });
  if (build.status !== 0) {
    console.warn("WARNING: the .NET SDK build failed or is unavailable; using the local Node fallback for /api/boards/*.");
    return;
  }
  apiProcess = spawn("dotnet", [join(out, "BoardApi.dll")], {
    cwd: out,
    env: { ...process.env, ASPNETCORE_URLS: `http://${host}:${apiPort}`, ASPNETCORE_ENVIRONMENT: "Development" },
    stdio: "ignore",
  });
  apiProcess.on("exit", () => { apiProcess = null; });
  if (await waitForApi(30_000)) {
    apiMode = "dotnet";
  } else {
    console.warn("WARNING: the .NET API did not start; using the local Node fallback for /api/boards/*.");
    apiProcess?.kill();
  }
}

async function referenceFromApi() {
  if (apiMode === "dotnet") {
    const r = await fetch(`http://${host}:${apiPort}/api/boards/reference`);
    return { status: r.status, text: await r.text() };
  }
  return { status: 200, text: await readFile(join(root, "supplied-runtime", "board-reference.json"), "utf8") };
}

// ---- response conditions ----
const json = (value) => JSON.stringify(value);

async function boardResponse() {
  const selected = condition;
  if (selected === "http") return { status: 503, text: json({ code: "UNAVAILABLE", message: "Board service unavailable" }) };
  if (selected === "malformed") return { status: 200, text: '{"id":"reference","width":3,' };
  if (selected === "delayed-zero") await new Promise((r) => setTimeout(r, 8000));
  const upstream = await referenceFromApi();
  if (selected === "valid" || upstream.status !== 200) return upstream;
  const board = JSON.parse(upstream.text);
  switch (selected) {
    case "missing-id": delete board.treasures[0].id; break;
    case "trial": {
      const trial = JSON.parse(await readFile(join(root, "trial-layout.json"), "utf8")); // read afresh
      board.walls = trial.walls;
      board.treasures = trial.treasures;
      break;
    }
    case "delayed-zero":
    case "zero-budget": board.initialMoves = 0; break;
    case "negative-budget": board.initialMoves = -2; break;
    case "fractional-budget": board.initialMoves = 2.5; break;
    case "blocked-treasure": board.treasures = [{ id: "t1", x: 1, y: 1, value: 10 }]; break;
    case "blocked-later":
      board.walls = [{ x: 0, y: 2 }, { x: 1, y: 1 }];
      board.treasures = [{ id: "t1", x: 2, y: 0, value: 10 }, { id: "t2", x: 1, y: 1, value: 5 }];
      break;
    case "shared-axis":
      board.treasures = [{ id: "t1", x: 1, y: 0, value: 10 }, { id: "t2", x: 2, y: 1, value: 5 }];
      break;
  }
  return { status: 200, text: json(board) };
}

function readBody(req) {
  return new Promise((ok, fail) => {
    let body = "";
    req.on("data", (c) => { body += c; if (body.length > 10_000) req.destroy(); });
    req.on("end", () => ok(body));
    req.on("error", fail);
  });
}

function send(res, status, text, type = TYPES[".json"]) {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(text);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${host}`);
  try {
    if (url.pathname === "/dev/response-condition") {
      if (req.method === "POST") {
        const wanted = JSON.parse((await readBody(req)) || "{}").condition;
        if (!CONDITIONS.includes(wanted)) return send(res, 400, json({ error: "unknown condition", conditions: CONDITIONS }));
        condition = wanted;
      }
      return send(res, 200, json({ selected: condition }));
    }
    if (url.pathname === "/api/demo/message") {
      const value = url.searchParams.get("case") === "wrong-type" ? { message: 42 } : { message: "Board service ready" };
      return send(res, 200, json(value));
    }
    if (url.pathname === "/api/boards/reference" && req.method === "GET") {
      const r = await boardResponse();
      return send(res, r.status, r.text);
    }
    if (url.pathname.startsWith("/api/boards/")) {
      return send(res, 404, json({ code: "NOT_FOUND", message: "Board not found" }));
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
  console.error(e.code === "EADDRINUSE" ? `Port ${port} is in use. Stop the old server or use PORT=4186 npm start.` : e);
  apiProcess?.kill();
  process.exit(1);
});

await startApi();
server.listen(port, host, () => {
  console.log(`Treasure hunt with checked board data: http://${host}:${port}/`);
  console.log(apiMode === "dotnet"
    ? `Board API: supplied .NET API on internal port ${apiPort} (forwarded through /api/boards/*)`
    : "Board API: local Node fallback serving supplied-runtime/board-reference.json (the .NET API was not started)");
  console.log("No automatic rebuild: run npm run build after an edit, then reload. Ctrl+C stops both processes.");
});
