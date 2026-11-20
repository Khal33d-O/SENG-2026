// Supplied stage capture (W3.03). Usage from starter/:  node save-stage.mjs red | green | refactor
// Copies src/rules.ts and tests/claim.test.mjs into stages/<stage>/ with SHA-256 fingerprints.
// Refuses to overwrite an existing stage. Your evidence note must still record the run and assertion.
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const stage = process.argv[2];
if (!['red', 'green', 'refactor'].includes(stage)) {
  console.error('usage: node save-stage.mjs red|green|refactor');
  process.exit(2);
}
const dir = `stages/${stage}`;
if (existsSync(dir)) {
  console.error(`refusing to overwrite ${dir}: preserve it and use a new working copy for another full attempt`);
  process.exit(1);
}
const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const files = { 'rules.ts': 'src/rules.ts', 'claim.test.mjs': 'tests/claim.test.mjs' };
mkdirSync(dir, { recursive: true });
const manifest = { stage, savedAt: new Date().toISOString(), files: {} };
for (const [name, source] of Object.entries(files)) {
  copyFileSync(source, `${dir}/${name}`);
  manifest.files[name] = sha(source);
}
writeFileSync(`${dir}/manifest.json`, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`saved ${dir}: rules.ts ${manifest.files['rules.ts'].slice(0, 12)}  claim.test.mjs ${manifest.files['claim.test.mjs'].slice(0, 12)}`);
if (stage !== 'red' && existsSync('stages/red/manifest.json')) {
  const red = JSON.parse(readFileSync('stages/red/manifest.json', 'utf8'));
  const same = red.files['claim.test.mjs'] === manifest.files['claim.test.mjs'];
  console.log(same ? 'claim file bytes match the red stage' : 'WARNING: claim file differs from the red stage - record a new red stage before claiming the cycle');
}
