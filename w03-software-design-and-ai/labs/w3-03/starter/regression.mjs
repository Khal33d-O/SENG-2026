// Inherited regression (supplied). Usage after a build:  node regression.mjs [rules|demo-green|demo-refactor|...]
// Four sequences with expectations from the earlier contract. They protect surrounding behaviour;
// they do not explain your new relation for you.
import { deepStrictEqual } from 'node:assert/strict';

const variant = process.argv[2] ?? 'rules';
const code = await import(`./dist/${variant}.js`);

function run(actions) {
  let state = code.initialState();
  const results = [];
  for (const direction of actions) {
    const result = code.evaluateMove(state, direction);
    results.push(result);
    state = result.state;
  }
  return { state, results };
}

const won = { position: { x: 2, y: 2 }, movesRemaining: 2, score: 10, collected: ['t1'], status: 'won' };
const sequences = [
  ['accepted movement to the exit', () => deepStrictEqual(run(['east', 'east', 'south', 'south']).state, won)],
  ['repeated wall rejection', () => {
    const { state, results } = run(['east', 'south', 'south']);
    deepStrictEqual(results.map((r) => r.accepted), [true, false, false]);
    deepStrictEqual(state, { position: { x: 1, y: 0 }, movesRemaining: 5, score: 0, collected: [], status: 'playing' });
  }],
  ['rejection after completion', () => {
    const { state, results } = run(['east', 'east', 'south', 'south', 'west']);
    deepStrictEqual([results[4].accepted, results[4].reason], [false, 'GAME_COMPLETE']);
    deepStrictEqual(state, won);
  }],
  ['out-of-bounds rejection before progress', () => {
    const { state, results } = run(['north', 'east']);
    deepStrictEqual(results.map((r) => r.accepted), [false, true]);
    deepStrictEqual(state, { position: { x: 1, y: 0 }, movesRemaining: 5, score: 0, collected: [], status: 'playing' });
  }],
];

let failed = 0;
for (const [name, check] of sequences) {
  try {
    check();
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`FAIL ${name}: ${error.message.split('\n')[0]}`);
  }
}
console.log(failed ? `${failed} of 4 regression sequences failed (${variant})` : `All 4 regression sequences pass (${variant})`);
process.exit(failed ? 1 : 0);
