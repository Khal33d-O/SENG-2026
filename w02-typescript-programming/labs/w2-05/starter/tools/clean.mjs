// Removes disposable generated output (dist/, test-results/, playwright-report/).
// Your src/controls.ts and evidence are never touched.
import { rm } from "node:fs/promises";

for (const folder of ["dist", "test-results", "playwright-report"]) {
  await rm(new URL(`../${folder}`, import.meta.url), { recursive: true, force: true });
  console.log(`removed ${folder}/`);
}
