// Supplied Task 3 case commands.
//   npm run case:compile  saves src/main.ts to src/main.before-case.txt (never overwrites an
//                         existing backup), then installs the one-fault case as src/main.ts.
//   npm run case:restore  copies src/main.before-case.txt back to src/main.ts. The backup is kept.
import { copyFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const at = (relative) => fileURLToPath(new URL(`../${relative}`, import.meta.url));
const source = at("src/main.ts");
const backup = at("src/main.before-case.txt");
const faultCase = at("fixtures/compile-case/main.ts");

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const action = process.argv[2];

if (action === "compile") {
  if (await exists(backup)) {
    console.error("Refusing to overwrite src/main.before-case.txt: a backup already exists.");
    console.error("Preserve it under another name (for example src/main.before-case-1.txt), then retry.");
    process.exit(1);
  }
  await copyFile(source, backup);
  await copyFile(faultCase, source);
  console.log("Saved your src/main.ts as src/main.before-case.txt.");
  console.log("Installed the one-fault case in src/main.ts. Predict the build result, then run: npm run build");
} else if (action === "restore") {
  if (!(await exists(backup))) {
    console.error("No src/main.before-case.txt to restore. Run npm run case:compile first, or use checkpoint/main.ts.");
    process.exit(1);
  }
  await copyFile(backup, source);
  console.log("Restored src/main.ts from src/main.before-case.txt (backup kept). Now run: npm run build");
} else {
  console.error("Usage: node tools/case.mjs compile|restore");
  process.exit(1);
}
