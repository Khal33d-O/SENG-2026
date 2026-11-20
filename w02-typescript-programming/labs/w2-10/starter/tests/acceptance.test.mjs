// SUPPLIED: five isolated reference acceptance examples (Given / When / Then as ordinary assertions).
// Each example states its own setup. They establish results for those inputs only; they do not show
// that the public controls can construct the inputs (see npm run plan and the browser comparison).
import { test } from "node:test";
import assert from "node:assert/strict";
import { applyMove, finalApproach, initialState, seed, tryMove } from "../dist/reference.js";

test("acceptance start: the public start is (0,0), six moves, nothing collected, score 0, playing", () => {
  const before = initialState(); // Given (and Then: nothing has happened yet)
  assert.deepEqual(before, { position: { x: 0, y: 0 }, movesRemaining: 6, score: 0, collected: [], status: "playing" });
});

test("acceptance action: East from the start reaches (1,0) with five moves", () => {
  const before = initialState(); // Given
  const after = applyMove(before, 'east'); // When
  assert.equal(after.movesRemaining, 5); // Then
  assert.deepEqual(after.position, { x: 1, y: 0 });
});

test("acceptance progress: East, East collects t1 and raises score to ten (rule called directly)", () => {
  const before = initialState(); // Given
  const after = applyMove(applyMove(before, "east"), "east"); // When
  assert.deepEqual(after.collected, ["t1"]); // Then
  assert.equal(after.score, 10);
  assert.equal(after.status, "playing");
});

test("acceptance invalid: South into the wall after East preserves every field while playing", () => {
  const before = applyMove(initialState(), "east"); // Given: (1,0), five moves, playing
  const result = tryMove(before, "south"); // When: the target (1,1) is the wall
  assert.equal(result.accepted, false); // Then
  assert.equal(result.reason, "WALL");
  assert.deepEqual(result.state, before);
  assert.equal(result.state.status, "playing");
});

test("acceptance finish: from the PREPARED finalApproach seed, South, South wins at (2,2)", () => {
  const before = seed(finalApproach); // Given: a prepared seed that already holds t1
  const after = applyMove(applyMove(before, "south"), "south"); // When
  assert.deepEqual(after.position, { x: 2, y: 2 }); // Then
  assert.equal(after.status, "won");
  assert.equal(after.movesRemaining, 2);
});
