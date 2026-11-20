// The twelve familiar rule tests (supplied: keep expectations, names and selection unchanged).
// Eleven tests replay the shared fixtures F01-F11 (all 13 files); the twelfth checks applyMove.
// The shared fixtures use the wire name `collected`; this package's GameState calls it
// `collectedTreasureIds`, so the two helpers below translate without changing any value.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { REFERENCE_BOARD, applyMove, evaluateMove, initialState } from "../dist/rules.js";

const load = (path) => JSON.parse(readFileSync(new URL(`../fixtures/${path}`, import.meta.url), "utf8"));

const fromFixture = (s) => ({
  position: { ...s.position },
  movesRemaining: s.movesRemaining,
  score: s.score,
  collectedTreasureIds: [...s.collected],
  status: s.status,
});
const toFixture = (s) => ({
  position: s.position,
  movesRemaining: s.movesRemaining,
  score: s.score,
  collected: s.collectedTreasureIds,
  status: s.status,
});

function replay(id) {
  const fixture = load(`treasure/${id}.json`);
  const input = fromFixture(fixture.state);
  const before = JSON.stringify(input);
  const result = evaluateMove(input, fixture.action.direction);
  assert.deepEqual(
    { accepted: result.accepted, reason: result.reason, state: toFixture(result.state) },
    fixture.expected,
    fixture.description,
  );
  assert.equal(JSON.stringify(input), before, "the rule must not mutate its input");
}

test("rules F01: initial state matches the reference board fixture", () => {
  assert.deepEqual(REFERENCE_BOARD, (({ id, name, ...rest }) => rest)(load("board-reference.json")));
  assert.deepEqual(toFixture(initialState()), load("treasure/F01.json").expected.state);
});
test("rules F02: East from the start is accepted and costs one move", () => replay("F02"));
test("rules F03: moving into the wall is rejected with state unchanged", () => replay("F03"));
test("rules F04: moving off the edge is rejected with state unchanged", () => replay("F04"));
test("rules F05: reaching the treasure scores ten and records it once", () => replay("F05"));
test("rules F06: reaching the exit holding the treasure wins", () => replay("F06"));
test("rules F07: a final-move win is checked before the zero-budget loss", () => replay("F07"));
test("rules F08: spending the last move without winning loses", () => replay("F08"));
test("rules F09: actions after a win or a loss are rejected", () => {
  replay("F09A");
  replay("F09B");
});
test("rules F10: unknown and missing directions are rejected as invalid", () => {
  replay("F10A");
  replay("F10B");
});
test("rules F11: reaching the exit without the treasure does not win", () => replay("F11"));
test("rules applyMove: returns the evaluated state and leaves its input unchanged", () => {
  const start = initialState();
  const moved = applyMove(start, "east");
  assert.deepEqual(moved, evaluateMove(start, "east").state);
  assert.deepEqual(start, initialState());
  assert.notEqual(applyMove(start, "north"), start, "a blocked move returns an unchanged copy");
});
