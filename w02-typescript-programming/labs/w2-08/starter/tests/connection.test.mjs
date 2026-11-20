// The existing stored-operation caller contract (supplied: keep expectations, names and selection unchanged).
// Registration performs no movement and leaves calls at zero. Each later port.send(direction)
// increments calls once and moves the chosen component once. Different ports stay independent.
import { test } from "node:test";
import assert from "node:assert/strict";
import { initialState } from "../dist/rules.js";
import { createFunctionComponent } from "../dist/before.js";
import { GameComponent, connect } from "../dist/component.js";
import { EAST_OF_START } from "./shared.mjs";

const SOUTH_OF_START = () => ({
  position: { x: 0, y: 1 },
  movesRemaining: 5,
  score: 0,
  collectedTreasureIds: [],
  status: "playing",
});

function checkCaller(create) {
  const first = create(initialState());
  const second = create(initialState());
  const firstPort = connect(first);
  const secondPort = connect(second);

  // Registration is inactive.
  assert.equal(firstPort.calls, 0);
  assert.deepEqual(first.snapshot(), initialState(), "registration must not move the game");

  // A later send forwards its direction to the chosen component, once.
  firstPort.send("east");
  assert.equal(firstPort.calls, 1);
  assert.deepEqual(first.snapshot(), EAST_OF_START());

  // The other port is still connected to its own component.
  assert.equal(secondPort.calls, 0);
  assert.deepEqual(second.snapshot(), initialState());
  secondPort.send("south");
  assert.equal(secondPort.calls, 1);
  assert.deepEqual(second.snapshot(), SOUTH_OF_START());
  assert.deepEqual(first.snapshot(), EAST_OF_START());
}

test("connection functions: a later send moves the chosen component once", () => {
  checkCaller((seed) => createFunctionComponent(seed));
});

test("connection your class: a later send moves the chosen component once", () => {
  checkCaller((seed) => new GameComponent(seed));
});
