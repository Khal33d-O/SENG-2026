// Supplied static file server for the lab (no dependencies).
// Serves this project folder on 127.0.0.1. Port: the PORT environment variable, or 4311.
// It only delivers files; it never compiles TypeScript or rebuilds on save.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.env.PORT ?? 4311);
const host = "127.0.0.1";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
};

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${host}:${port}`);
  let path = decodeURIComponent(url.pathname);
  if (path.endsWith("/")) path += "index.html";

  // Resolve inside the project folder only.
  const filePath = normalize(join(projectRoot, path));
  if (!filePath.startsWith(normalize(projectRoot)) || filePath.includes(`${sep}node_modules${sep}`)) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" }).end("Forbidden\n");
    return;
  }

  try {
    if (!(await stat(filePath)).isFile()) throw new Error("not a file");
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
      // Ask the browser not to reuse old copies, so a reload requests the files again.
      "Cache-Control": "no-store",
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end(`Not found: ${path}\n`);
  }
  console.log(`${response.statusCode} ${request.method} ${url.pathname}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the other server (Ctrl+C) or choose another PORT.`);
  } else {
    console.error(error);
  }
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`Serving ${projectRoot} at http://${host}:${port}/ (Ctrl+C to stop; no automatic rebuild)`);
});
