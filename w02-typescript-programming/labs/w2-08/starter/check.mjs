// Supplied launcher: node check.mjs <mode>
// Removes this copy's old dist/, checks the prepared versions, compiles current src/ and only then
// runs the tests (or demonstration) that the mode names. A build failure executes no tests.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const COURSE_NODE = "22.23.2";
const COURSE_TS = "5.9.3";

const RULES = ["tests/rules.test.mjs"];
const BEFORE = ["tests/before.test.mjs", "tests/demo-class.test.mjs"];
const MINE = ["tests/component.test.mjs"];
const PRACTICE = ["tests/practice.test.mjs"];
const CONNECTION = ["tests/connection.test.mjs"];

const MODES = {
  baseline: { tests: [...RULES, ...BEFORE], about: "24 expected: 12 rule + 6 functions + 6 demo class" },
  practice: { tests: PRACTICE, about: "1 expected: the guided counter" },
  core: { tests: [...RULES, ...BEFORE, ...MINE], about: "30 expected: baseline + 6 for your class" },
  connection: { tests: CONNECTION, about: "2 expected: caller contract for functions and your class" },
  all: { tests: [...RULES, ...BEFORE, ...MINE, ...PRACTICE, ...CONNECTION], about: "33 expected: the complete suite" },
  refactor: { tests: BEFORE, about: "Worked Example 2: the six shared assertions for functions, then the demo class" },
  compare: { run: "dist/demo-compare.js", about: "Worked Example 1: functions and class each request East" },
  inspect: { run: "dist/inspect.js", about: "Prepared inspection of direct and stored-operation calls" },
};

const mode = process.argv[2];
if (!MODES[mode]) {
  console.error(`Usage: node check.mjs <${Object.keys(MODES).join("|")}>`);
  process.exit(2);
}

// 1. Remove this copy's old emitted output so stale JavaScript can never be tested.
rmSync(join(here, "dist"), { recursive: true, force: true });

// 2. Locate and check the prepared tools. A missing tool is an environment block, not a failed assertion.
const localTsc = join(here, "node_modules", "typescript", "lib", "tsc.js");
let tscCommand;
let tsVersion;
if (existsSync(localTsc)) {
  tscCommand = [process.execPath, [localTsc]];
  tsVersion = JSON.parse(readFileSync(join(here, "node_modules", "typescript", "package.json"), "utf8")).version;
} else {
  const probe = spawnSync("tsc", ["--version"], { encoding: "utf8", shell: true });
  if (probe.status !== 0) {
    console.log("ENVIRONMENT BLOCKED: no TypeScript compiler found (neither node_modules nor tsc on PATH).");
    console.log("Ask for the prepared environment, or run `npm ci` to install the pinned typescript 5.9.3.");
    process.exit(3);
  }
  tscCommand = ["tsc", []];
  tsVersion = probe.stdout.trim().replace(/^Version\s+/, "");
}
const nodeVersion = process.versions.node;
if (Number(nodeVersion.split(".")[0]) < 22) {
  console.log(`ENVIRONMENT BLOCKED: Node ${nodeVersion} is older than 22 (course pin ${COURSE_NODE}).`);
  process.exit(3);
}
const note = (actual, pin) => (actual === pin ? "" : ` (course pin ${pin})`);
console.log(`VERSIONS node ${nodeVersion}${note(nodeVersion, COURSE_NODE)} · typescript ${tsVersion}${note(tsVersion, COURSE_TS)}`);

// 3. Compile current source.
const [cmd, prefix] = tscCommand;
const build = spawnSync(cmd, [...prefix, "-p", "tsconfig.json"], {
  cwd: here,
  stdio: "inherit",
  shell: cmd === "tsc",
});
if (build.status !== 0) {
  console.log("BUILD FAILED: no tests were executed. Fix the compiler error in src/ (never edit dist/).");
  process.exit(1);
}
console.log(`BUILD PASS · mode ${mode}: ${MODES[mode].about}`);

// 4. Run the selected tests one file at a time (so the report reads in order), or the demonstration.
const args = MODES[mode].run
  ? [MODES[mode].run]
  : ["--test", "--test-reporter=spec", "--test-concurrency=1", ...MODES[mode].tests];
const run = spawnSync(process.execPath, args, { cwd: here, stdio: "inherit" });
process.exit(run.status ?? 1);
