// Supplied script-selection commands for the handover page.
//   npm run page:current   handover.html requests dist/main.js     (the current program)
//   npm run page:previous  handover.html requests dist/previous.js (the supplied previous program)
// Only the existing src attribute of the module script changes; nothing else in the page.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const programs = { current: "dist/main.js", previous: "dist/previous.js" };
const choice = process.argv[2];

if (!(choice in programs)) {
  console.error("Usage: node tools/select-page.mjs current|previous");
  process.exit(1);
}

const pagePath = fileURLToPath(new URL("../handover.html", import.meta.url));
const html = await readFile(pagePath, "utf8");
const scriptPattern = /(<script type="module" src=")([^"]*)("><\/script>)/;
const match = html.match(scriptPattern);

if (!match) {
  console.error('handover.html: could not find <script type="module" src="..."></script>.');
  process.exit(1);
}

const before = match[2];
const after = programs[choice];
await writeFile(pagePath, html.replace(scriptPattern, `$1${after}$3`));
console.log(`handover.html now requests ${after} (it requested ${before}). Reload the page to observe the result.`);
