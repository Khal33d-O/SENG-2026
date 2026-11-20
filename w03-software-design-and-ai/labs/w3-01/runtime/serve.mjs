// Tiny local static server for the W3.01 runtime fixtures (no dependencies).
// Usage from runtime/:  node serve.mjs before|after|challenge [port]     (default port 4301)
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const variant = process.argv[2];
const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, variant ?? '');
if (!variant || !existsSync(join(root, 'index.html'))) {
  console.error('usage: node serve.mjs before|after|challenge [port]');
  process.exit(2);
}
if (!existsSync(join(root, 'dist'))) console.warn(`warning: ${variant}/dist is missing - build first (npm run build:${variant})`);
const port = Number(process.argv[3] ?? 4301);
const types = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript', '.js': 'text/javascript' };
createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  const file = join(root, normalize(path === '/' ? '/index.html' : path));
  if (!file.startsWith(root + sep) || !existsSync(file)) { res.writeHead(404).end('not found'); return; }
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'text/plain', 'cache-control': 'no-store' }).end(readFileSync(file));
}).listen(port, '127.0.0.1', () => console.log(`W3.01 ${variant}: http://127.0.0.1:${port}  (Ctrl+C stops it)`));
