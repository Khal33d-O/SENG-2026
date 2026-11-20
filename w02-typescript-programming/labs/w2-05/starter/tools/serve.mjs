// SUPPLIED - a tiny dependency-free static server for this package.
// Serves the package folder on 127.0.0.1 (your own machine only). Honours PORT (default 4173).
// It does not rebuild: run `npm run build` after saving a source change, then reload.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT ?? 4173);
const host = "127.0.0.1";

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${host}`);
    let path = normalize(join(root, decodeURIComponent(url.pathname)));
    // Refuse anything outside the package folder.
    if (path !== root && !path.startsWith(root + sep)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    if ((await stat(path).catch(() => null))?.isDirectory()) path = join(path, "index.html");
    const body = await readFile(path);
    response.writeHead(200, {
      "Content-Type": types[extname(path)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the other server (Ctrl+C) or start with another PORT, e.g. PORT=4180 npm start`);
  } else {
    console.error(error.message);
  }
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`Serving ${root}`);
  console.log(`http://${host}:${port}`);
  console.log("Press Ctrl+C to stop.");
});
