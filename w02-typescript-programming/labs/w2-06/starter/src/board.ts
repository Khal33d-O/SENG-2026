// Supplied: the earlier local model of the fixed reference game.
// The local model names the starting allowance initialMoveBudget.
// (The wire data from the API names the same idea initialMoves; see adapter.ts.)

export interface Point {
  x: number;
  y: number;
}

export interface Treasure extends Point {
  id: string;
  value: number;
}

export interface LocalBoard {
  width: number;
  height: number;
  start: Point;
  walls: Point[];
  treasures: Treasure[];
  exit: Point;
  initialMoveBudget: number;
}

export type GameStatus = "playing" | "won" | "lost";

// A running session: the moves still available live in movesRemaining.
export interface GameState {
  position: Point;
  movesRemaining: number;
  score: number;
  collected: string[];
  status: GameStatus;
}

export type Direction = "north" | "east" | "south" | "west";

export type RejectReason = "WALL" | "EDGE" | "INVALID_ACTION" | "GAME_COMPLETE";

export interface RuleResult {
  accepted: boolean;
  reason: RejectReason | null;
  state: GameState;
}

// The fixed reference game (source/shared/fixtures/board-reference.json).
// Loading a remote definition never replaces this board.
export const REFERENCE_BOARD: LocalBoard = {
  width: 3,
  height: 3,
  start: { x: 0, y: 0 },
  walls: [{ x: 1, y: 1 }],
  treasures: [{ id: "t1", x: 2, y: 0, value: 10 }],
  exit: { x: 2, y: 2 },
  initialMoveBudget: 6,
};
