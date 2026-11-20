// One-command runner for both W2.07 Worked Example 1 forms (after `npm run build`):
//   node test.mjs
// Runs the bare assertion script, then the named test file through Node's test runner.
import { spawnSync } from "node:child_process";

const steps = [
  ["bare assertion", ["demos/bare-assertion.mjs"]],
  ["named test", ["--test", "--test-reporter=spec", "tests/conversion.test.mjs"]],
];
let failed = false;
for (const [label, args] of steps) {
  console.log(`--- ${label}`);
  const run = spawnSync(process.execPath, args, { stdio: "inherit" });
  failed ||= run.status !== 0;
}
process.exit(failed ? 1 : 0);
