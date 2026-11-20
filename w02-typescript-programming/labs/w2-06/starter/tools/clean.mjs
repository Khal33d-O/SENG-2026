// Removes disposable generated output: dist/, .runtime/, supplied-runtime/bin|obj/, test-results/.
import { rm } from "node:fs/promises";
for (const dir of ["dist", ".runtime", "supplied-runtime/bin", "supplied-runtime/obj", "test-results", "playwright-report"]) {
  await rm(new URL(`../${dir}`, import.meta.url), { recursive: true, force: true });
}
console.log("Removed generated output. Source, trial-layout.json and evidence are kept.");
