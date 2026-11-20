// SUPPLIED: five complete target-range examples (Worked Example 2). Run after building:
//   node --test tests/range.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateShot, initialRangeState } from "../dist/range.js";

test("range start: two rounds, score 0, no shots, active", () => {
  assert.deepEqual(initialRangeState(), { ammunition: 2, score: 0, shots: 0, status: "active" });
});

test("range miss: spends one round without scoring", () => {
  const result = evaluateShot(initialRangeState(), { type: "miss" });
  assert.deepEqual(result, { accepted: true, reason: null, state: { ammunition: 1, score: 0, shots: 1, status: "active" } });
});

test("range hit progress: spends one round and adds one point", () => {
  const result = evaluateShot(initialRangeState(), { type: "hit" });
  assert.deepEqual(result.state, { ammunition: 1, score: 1, shots: 1, status: "active" });
});

test("range completion: the second shot completes the round", () => {
  const first = evaluateShot(initialRangeState(), { type: "hit" }).state;
  const second = evaluateShot(first, { type: "miss" });
  assert.deepEqual(second.state, { ammunition: 0, score: 1, shots: 2, status: "complete" });
});

test("range no ammunition: a later shot is rejected and the completed state is unchanged", () => {
  const done = { ammunition: 0, score: 2, shots: 2, status: "complete" };
  const result = evaluateShot(done, { type: "hit" });
  assert.equal(result.accepted, false);
  assert.equal(result.reason, "GAME_COMPLETE");
  assert.deepEqual(result.state, done);
});
