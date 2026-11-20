// YOUR SPECIFICATION (W3.03). Keep the two named purposes `relation:` and `progress:`.
// Replace each assert.fail with meaningful assertions BEFORE recording red. Do not use skip, todo, .only
// or a catch that suppresses the required failure. Expectations must come from the fixed specification
// (board: 3x3, start (0,0), wall (1,1), t1 at (2,0) worth 10, exit (2,2), six moves), not from the code.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { code, runPath } from './support.mjs';

test('relation: one independently rejected insertion after progress leaves the final public state unchanged', () => {
  void code; void runPath;
  assert.fail('Write your relation: an accepted path versus the same path with one rejected insertion (justify it from board data).');
});

test('progress: accepted movement and the unchanged cost of collecting treasure', () => {
  assert.fail('Write your independent accepted-progress observation with expectations derived from the specification.');
});
