// Full checks (npm test). For every public case there are three tests:
//   fields    - the returned preview matches every expected field
//   original  - a reference held before the call still observes the
//               original values afterwards (no mutation of the caller's object)
//   identity  - the returned object is a fresh object (result !== initial)
// The tests inspect observations, not one preferred spelling of the algorithm.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cases, freshInitial } from "../cases.mjs";
import { calculate } from "../dist/calculate.js";

for (const c of cases) {
  test(`${c.name}: fields`, () => {
    const result = calculate(freshInitial(c), c.requested, c.points);
    assert.deepEqual(
      { score: result.score, actionsRemaining: result.actionsRemaining, completed: result.completed },
      c.expected,
      `${c.name} (requested ${c.requested}, points ${c.points}): preview fields differ`,
    );
  });

  test(`${c.name}: original`, () => {
    const initial = freshInitial(c);
    const held = initial; // the comparison panel's reference, taken before the call
    calculate(initial, c.requested, c.points);
    assert.deepEqual(
      { score: held.score, actionsRemaining: held.actionsRemaining, completed: held.completed },
      c.initial,
      `${c.name}: the original object was changed through the held reference`,
    );
  });

  test(`${c.name}: identity`, () => {
    const initial = freshInitial(c);
    const result = calculate(initial, c.requested, c.points);
    assert.ok(
      result !== initial,
      `${c.name}: result === initial is true; the preview must be a separate object`,
    );
  });
}
