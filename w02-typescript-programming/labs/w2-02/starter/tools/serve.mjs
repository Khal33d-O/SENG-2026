// Tiny dependency-free static server for the browser report (npm start).
// Serves this project folder on 127.0.0.1; PORT defaults to 4302.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = normalize(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT ?? 4302);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
  const file = normalize(join(root, path === "/" ? "index.html" : path));
  // Refuse anything outside the project folder or inside node_modules.
  if (!file.startsWith(root) || file.includes(`${sep}node_modules${sep}`)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  try {
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": types[extname(file)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end(`Not found: ${path}`);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`State preview report: http://127.0.0.1:${port}  (Ctrl+C to stop)`);
});
