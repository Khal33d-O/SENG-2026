// Supplied preservation support.
//   node tools.mjs save                 copy your owned files into a new unique backup
//   node tools.mjs checkpoint           save, then replace src/component.ts with the supported core checkpoint
//   node tools.mjs restore <BACKUP_DIR> save the current files, then copy that backup's files back
// Every command checks all required files are present regular files BEFORE creating a backup or
// changing source. Earlier backups are never overwritten.
import { copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { basename, dirname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const OWNED = ["src/component.ts", "src/practice.ts", "evidence.md"];
const CHECKPOINT = join(here, "checkpoints", "component.ts");

function stop(message) {
  console.log(`STOPPED: ${message} Nothing was saved or replaced.`);
  process.exit(1);
}

function requireRegularFiles(baseDir, files, describe) {
  for (const file of files) {
    const path = join(baseDir, file);
    if (!existsSync(path)) stop(`${describe} ${file} is missing.`);
    const info = lstatSync(path);
    if (!info.isFile() || info.isSymbolicLink()) stop(`${describe} ${file} is not a regular file.`);
  }
}

// Copies the owned files into backups/preserved-XXXXXX and returns the absolute directory.
function preserve() {
  requireRegularFiles(here, OWNED, "required file");
  mkdirSync(join(here, "backups"), { recursive: true });
  const dir = mkdtempSync(join(here, "backups", "preserved-"));
  for (const file of OWNED) copyFileSync(join(here, file), join(dir, basename(file)));
  console.log(`PRESERVED ${dir}`);
  return dir;
}

const [command, target] = process.argv.slice(2);

if (command === "save") {
  preserve();
} else if (command === "checkpoint") {
  if (!existsSync(CHECKPOINT)) stop("checkpoints/component.ts is missing.");
  preserve();
  copyFileSync(CHECKPOINT, join(here, "src", "component.ts"));
  console.log("CHECKPOINT src/component.ts now holds the completed core class with the ORIGINAL connection expression.");
  console.log("Your practice.ts and evidence.md were not changed. Run: npm run check:connection");
} else if (command === "restore") {
  if (!target) stop("give the backup directory: node tools.mjs restore BACKUP_DIRECTORY.");
  const from = resolve(target);
  requireRegularFiles(from, OWNED.map((f) => basename(f)), "backup file");
  preserve(); // keep whatever is current before replacing it
  for (const file of OWNED) copyFileSync(join(from, basename(file)), join(here, file));
  console.log(`RESTORED ${OWNED.join(", ")} from ${from}`);
} else {
  console.log("Usage: node tools.mjs save | checkpoint | restore BACKUP_DIRECTORY");
  process.exit(2);
}
