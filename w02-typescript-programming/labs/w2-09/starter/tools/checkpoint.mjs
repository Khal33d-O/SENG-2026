// SUPPLIED preservation support.
//   node tools/checkpoint.mjs save        copy src/app.ts and ../evidence.md into a NEW backups/ directory
//   node tools/checkpoint.mjs connected   save first, then install ../checkpoint/app.ts (connected checkpoint)
// Each use creates a fresh directory; earlier backups are kept. If src/app.ts or ../evidence.md is
// missing, it stops BEFORE replacing any source.
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = { "app.ts": join(here, "src", "app.ts"), "evidence.md": join(here, "..", "evidence.md") };
const mode = process.argv[2];
if (!["save", "connected"].includes(mode)) {
  console.error("Usage: node tools/checkpoint.mjs save|connected");
  process.exit(2);
}
for (const [name, path] of Object.entries(files)) {
  if (!existsSync(path) || !statSync(path).isFile()) {
    console.error(`STOPPED: ${name} not found at ${path}. Nothing was copied or replaced.`);
    process.exit(1);
  }
}
const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
const dir = join(here, "backups", `attempt-${stamp}-${randomBytes(3).toString("hex")}`);
mkdirSync(dir, { recursive: true });
for (const [name, path] of Object.entries(files)) copyFileSync(path, join(dir, name));
console.log(`PRESERVED ${dir}`);
if (mode === "connected") {
  copyFileSync(join(here, "..", "checkpoint", "app.ts"), files["app.ts"]);
  console.log("CHECKPOINT src/app.ts now holds the connected checkpoint; the display mismatch is still unresolved.");
  console.log("Next: npm run build, reload, and explain what remains unresolved.");
}
