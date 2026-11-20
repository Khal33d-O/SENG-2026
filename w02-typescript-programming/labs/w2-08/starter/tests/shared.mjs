// The six shared component assertions (supplied: keep expectations, names and selection unchanged).
// Every implementation is checked against the same expected states; only the factory changes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../dist/rules.js";

// Known states used by more than one assertion.
export const START = () => initialState();
export const EAST_OF_START = () => ({
  position: { x: 1, y: 0 },
  movesRemaining: 5,
  score: 0,
  collectedTreasureIds: [],
  status: "playing",
});
export const TREASURE = () => ({
  position: { x: 2, y: 0 },
  movesRemaining: 4,
  score: 10,
  collectedTreasureIds: ["t1"],
  status: "playing",
});
const ABOVE_EXIT_HOLDING = () => ({
  position: { x: 2, y: 1 },
  movesRemaining: 3,
  score: 10,
  collectedTreasureIds: ["t1"],
  status: "playing",
});
const WON = () => ({
  position: { x: 2, y: 2 },
  movesRemaining: 2,
  score: 10,
  collectedTreasureIds: ["t1"],
  status: "won",
});

// label: names the implementation in each test name; create(seed) constructs it.
export function defineComponentSuite(label, create) {
  test(`${label}: an allowed East from the reference start reaches (1,0) with five moves`, () => {
    const game = create(START());
    game.move("east");
    assert.deepEqual(game.snapshot(), EAST_OF_START());
  });

  test(`${label}: a blocked move preserves the complete state`, () => {
    const game = create(EAST_OF_START());
    game.move("south"); // the wall at (1,1)
    assert.deepEqual(game.snapshot(), EAST_OF_START());
  });

  test(`${label}: the seed and returned snapshots are independent nested copies`, () => {
    const seed = START();
    const game = create(seed);
    seed.position.x = 2;
    seed.collectedTreasureIds.push("edited-seed");
    assert.deepEqual(game.snapshot(), START(), "editing the seed must not change owned state");

    const observed = game.snapshot();
    observed.position.y = 2;
    observed.collectedTreasureIds.push("edited-snapshot");
    observed.score = 99;
    assert.deepEqual(game.snapshot(), START(), "editing a snapshot must not change owned state");
  });

  test(`${label}: two initial states give independent components`, () => {
    const first = create(START());
    const second = create(EAST_OF_START());
    first.move("east");
    second.move("east");
    assert.deepEqual(first.snapshot(), EAST_OF_START());
    assert.deepEqual(second.snapshot(), TREASURE());
  });

  test(`${label}: completion is followed by an ignored action`, () => {
    const game = create(ABOVE_EXIT_HOLDING());
    game.move("south");
    assert.deepEqual(game.snapshot(), WON());
    game.move("west");
    assert.deepEqual(game.snapshot(), WON());
  });

  test(`${label}: a deferred direct receiver call updates the component`, async () => {
    const game = create(START());
    await new Promise((resolve) => {
      setTimeout(() => {
        game.move("east"); // still called on `game`, just later
        resolve();
      }, 0);
    });
    assert.deepEqual(game.snapshot(), EAST_OF_START());
  });
}
