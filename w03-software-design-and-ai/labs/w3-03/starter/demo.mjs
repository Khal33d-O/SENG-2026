// Complete worked example 1 (W3.03): the wall promise. Usage after a build:
//   node demo.mjs demo-red | demo-green | demo-refactor      (npm run demo:red / demo:green / demo:refactor)
import { test } from 'node:test';
import assert from 'node:assert/strict';

const variant = process.argv[2] ?? 'demo-red';
const code = await import(`./dist/${variant}.js`);

test(`wall rejection preserves the caller's state (${variant})`, () => {
  const state = code.evaluateMove(code.initialState(), 'east').state;
  const before = structuredClone(state);
  const result = code.evaluateMove(state, 'south');
  assert.equal(result.accepted, false, 'wall action is rejected');
  assert.deepEqual(result.state, before, 'wall rejection preserves public state');
  assert.deepEqual(state, before, 'caller input is preserved');
});
