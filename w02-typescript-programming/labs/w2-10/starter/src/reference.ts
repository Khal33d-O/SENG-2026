// SUPPLIED: the reference board and small helpers used by the acceptance examples.
// `initialState()` and `applyMove()` are bound to the reference board so that a
// Given/When/Then example reads as ordinary TypeScript/Node assertions.

import {
  copyState,
  evaluate,
  initialState as ruleInitialState,
  type Board,
  type Direction,
  type GameState,
  type MoveResult,
} from "./rules.js";

/** The exact wire definition served by GET /api/boards/reference (note: initialMoves). */
export const referenceWire = {
  id: "reference",
  name: "Reference treasure hunt",
  width: 3,
  height: 3,
  start: { x: 0, y: 0 },
  walls: [{ x: 1, y: 1 }],
  treasures: [{ id: "t1", x: 2, y: 0, value: 10 }],
  exit: { x: 2, y: 2 },
  initialMoves: 6,
} as const;

/** The local rule definition (note: initialMoveBudget). */
export const referenceBoard: Board = {
  id: referenceWire.id,
  width: referenceWire.width,
  height: referenceWire.height,
  start: referenceWire.start,
  walls: referenceWire.walls,
  treasures: referenceWire.treasures,
  exit: referenceWire.exit,
  initialMoveBudget: referenceWire.initialMoves,
};

/** Given: the public start of the reference game. */
export function initialState(): GameState {
  return ruleInitialState(referenceBoard);
}

/** When: one move through the supplied rule, returning the full result. */
export function tryMove(state: GameState, direction: Direction): MoveResult {
  return evaluate(referenceBoard, state, { type: "move", direction });
}

/** When: one move through the supplied rule, returning only the next state. */
export function applyMove(state: GameState, direction: Direction): GameState {
  return tryMove(state, direction).state;
}

/**
 * A prepared seed for the isolated finish example: t1 is ALREADY collected.
 * It isolates the completion rule; it does not show that public play can build it.
 */
export const finalApproach: GameState = {
  position: { x: 2, y: 0 },
  movesRemaining: 4,
  score: 10,
  collected: ["t1"],
  status: "playing",
};

export function seed(state: GameState): GameState {
  return copyState(state);
}
