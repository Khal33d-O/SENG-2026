// SUPPLIED launcher: node check.mjs MODE (the npm scripts are short names for it).
//
// Every mode: 1) checks the prepared tools, 2) deletes this copy's old dist/,
// 3) compiles src/ with tsc (noEmitOnError: a type error emits nothing),
// 4) prints BUILD PASS, and only then 5) runs the explicitly listed files.
// A failed build runs no tests and leaves no old output to confuse the observation.
import { spawnSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
process.chdir(here);

const COURSE_NODE = '22.23.2';
const COURSE_TS = '5.9.3';

const RULES = 'tests/rules.test.mjs';
const CONVERSION = 'tests/conversion.test.mjs';
const REGRESSION = 'tests/regression.test.mjs';
const PROBE = 'tests/probe.test.mjs';
const LEARNER = 'tests/learner.test.mjs';

// mode -> what runs after a successful build
const MODES = {
  baseline: { tests: [RULES, CONVERSION] },
  'demo-bare': { script: 'demos/bare-assertion.mjs' },
  'demo-named': { tests: [CONVERSION] },
  regression: { tests: [REGRESSION] },
  inspect: { script: 'inspect.mjs' },
  mine: { tests: [LEARNER] },
  probe: { tests: [PROBE] },
  focused: { tests: [PROBE], pattern: '^boundary probe' },
  boundary: { tests: [LEARNER], pattern: '^my boundary regression' },
  test: { tests: [RULES, CONVERSION, REGRESSION, PROBE, LEARNER] },
};

function stop(kind, message, code) {
  console.error(`${kind}: ${message}`);
  process.exit(code);
}

const mode = process.argv[2];
if (!Object.hasOwn(MODES, mode ?? '')) {
  stop('USAGE', `node check.mjs <${Object.keys(MODES).join('|')}>`, 2);
}

// 1) Environment. An environment stop is not a test result.
const [major] = process.versions.node.split('.').map(Number);
if (major < 22) {
  stop('ENVIRONMENT', `Node ${process.versions.node} found; this lab needs Node ${COURSE_NODE} (22 or later). Ask for the prepared environment.`, 2);
}
if (process.versions.node !== COURSE_NODE) {
  console.log(`NOTE: Node ${process.versions.node} (course pin ${COURSE_NODE}). Record this in your environment block.`);
}

// Prefer a local `npm ci` install; otherwise use the prepared tsc on PATH.
const localTsc = join(here, 'node_modules', 'typescript', 'bin', 'tsc');
const tsc = (args, stdio) =>
  existsSync(localTsc)
    ? spawnSync(process.execPath, [localTsc, ...args], { stdio })
    : spawnSync('tsc', args, { stdio, shell: true });

const version = tsc(['--version'], 'pipe');
const versionText = `${version.stdout ?? ''}`.trim();
if (version.error || version.status !== 0 || !versionText.startsWith('Version')) {
  stop('ENVIRONMENT', `TypeScript compiler not found (no tsc on PATH and no node_modules/typescript). Ask for the prepared environment or run npm ci.`, 2);
}
if (!versionText.startsWith('Version 5.9.')) {
  stop('ENVIRONMENT', `${versionText} found; this lab is pinned to TypeScript ${COURSE_TS}.`, 2);
}

// 2) + 3) Fresh build.
rmSync(join(here, 'dist'), { recursive: true, force: true });
const build = tsc(['-p', 'tsconfig.json'], 'inherit');
if (build.status !== 0) {
  stop('BUILD FAIL', 'src/ did not compile, so no tests were run and dist/ holds no output.', 1);
}
console.log(`BUILD PASS (${versionText}, Node ${process.versions.node}) - dist/ rebuilt from src/`);

// 4) Run the selected files.
const selected = MODES[mode];
let args;
if (selected.script) {
  console.log(`MODE ${mode}: node ${selected.script}`);
  args = [selected.script];
} else {
  const filter = selected.pattern ? [`--test-name-pattern=${selected.pattern}`] : [];
  console.log(`MODE ${mode}: ${selected.tests.join(' ')}${selected.pattern ? `  (focused: name matches /${selected.pattern}/)` : '  (full files)'}`);
  args = ['--test', '--test-reporter=spec', '--test-concurrency=1', ...filter, ...selected.tests];
}
const run = spawnSync(process.execPath, args, { stdio: 'inherit' });
process.exit(run.status ?? 1);
