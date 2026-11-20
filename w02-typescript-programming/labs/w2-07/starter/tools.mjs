// SUPPLIED preservation support.
//
//   node tools.mjs save                    preserve the owned files, change nothing
//   node tools.mjs seed                    preserve, then install the original inclusive rule
//   node tools.mjs restore BACKUP_DIR      preserve current files, then restore source and tests
//   node tools.mjs checkpoint              preserve, then restore ONLY the demonstrated rule correction
//
// Every command creates a NEW backup under backups/ and prints its PRESERVED path.
// Earlier backups are never overwritten. If any owned file (including evidence.md)
// is missing or unreadable, the command stops before changing any source.
import { copyFileSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OWNED = ['src/costly.ts', 'tests/learner.test.mjs', 'tests/probe.test.mjs', 'evidence.md'];
const RESTORED_FROM_BACKUP = ['src/costly.ts', 'tests/learner.test.mjs', 'tests/probe.test.mjs'];

function fail(message) {
  console.error(`RECOVERY STOP: ${message}`);
  console.error('Nothing was changed. This is a preservation failure, not a rule regression.');
  process.exit(1);
}

function requireReadable(base, files) {
  for (const file of files) {
    const path = join(base, file);
    try {
      if (!statSync(path).isFile()) fail(`${path} is not a regular file.`);
      readFileSync(path);
    } catch (error) {
      if (error?.code) fail(`${path} cannot be read (${error.code}). Restore or save it first.`);
      throw error;
    }
  }
}

function stamp() {
  const d = new Date();
  const two = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${two(d.getMonth() + 1)}${two(d.getDate())}-${two(d.getHours())}${two(d.getMinutes())}${two(d.getSeconds())}`;
}

// Copy every owned file into a fresh, uniquely named backup directory.
function preserve(reason) {
  requireReadable(here, OWNED);
  const root = join(here, 'backups');
  mkdirSync(root, { recursive: true });
  const dir = join(root, `${reason}-${stamp()}-${randomBytes(3).toString('hex')}`);
  mkdirSync(dir); // not recursive: fails rather than reuse an existing directory
  for (const file of OWNED) {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    copyFileSync(join(here, file), join(dir, file));
  }
  writeFileSync(
    join(dir, 'MANIFEST.txt'),
    `reason: ${reason}\ncreated: ${new Date().toISOString()}\nfiles:\n${OWNED.map((f) => `  ${f}`).join('\n')}\n`,
  );
  console.log(`PRESERVED ${dir}`);
  return dir;
}

const [command, argument] = process.argv.slice(2);

switch (command) {
  case 'save': {
    preserve('save');
    console.log('SAVED: no source was changed.');
    break;
  }
  case 'seed': {
    preserve('seed');
    copyFileSync(join(here, 'checkpoints', 'costly.seed.ts'), join(here, 'src', 'costly.ts'));
    console.log('SEED INSTALLED: src/costly.ts now holds the original inclusive rule (tile.cost >= threshold).');
    console.log('Copy the PRESERVED path above into evidence.md, then run: npm run check:boundary');
    break;
  }
  case 'restore': {
    if (!argument) fail('usage: node tools.mjs restore BACKUP_DIRECTORY (use the PRESERVED path that was printed).');
    const source = resolve(argument);
    requireReadable(source, RESTORED_FROM_BACKUP);
    preserve('before-restore');
    for (const file of RESTORED_FROM_BACKUP) copyFileSync(join(source, file), join(here, file));
    console.log(`RESTORED ${RESTORED_FROM_BACKUP.join(', ')} from ${source}`);
    console.log('evidence.md was kept as it is now (its previous copy is in the new backup above).');
    console.log('Next: npm run check:boundary, then npm test');
    break;
  }
  case 'checkpoint': {
    preserve('checkpoint');
    copyFileSync(join(here, 'checkpoints', 'costly.corrected.ts'), join(here, 'src', 'costly.ts'));
    console.log('CHECKPOINT: restored only the demonstrated threshold correction in src/costly.ts.');
    console.log('Your learner tests, the probe and evidence.md are untouched. Run: npm run check:regression');
    console.log('Record the PRESERVED path and mark this as guided support in evidence.md.');
    break;
  }
  default:
    console.error('usage: node tools.mjs <save|seed|restore BACKUP_DIRECTORY|checkpoint>');
    process.exit(2);
}
