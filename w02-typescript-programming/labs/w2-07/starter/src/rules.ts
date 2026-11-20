// SUPPLIED: the familiar treasure-hunt movement rules. Use this contract; do not
// change the implementation. It agrees with the shared course fixtures in
// fixtures/treasure (F01-F11) and with source/shared/contract/GAME-CONTRACT.md.
// Pure functions: no clock, randomness or I/O, and inputs are never mutated.

export type Direction = 'north' | 'east' | 'south' | 'west';
export type Status = 'playing' | 'won' | 'lost';
export type Reason = 'WALL' | 'EDGE' | 'INVALID_ACTION' | 'GAME_COMPLETE';

export interface Point {
  x: number;
  y: number;
}

export interface Treasure {
  id: string;
  x: number;
  y: number;
  value: number;
}

export interface Board {
  id: string;
  name: string;
  width: number;
  height: number;
  start: Point;
  walls: Point[];
  treasures: Treasure[];
  exit: Point;
  initialMoves: number;
}

export interface GameState {
  position: Point;
  movesRemaining: number;
  score: number;
  collected: string[];
  status: Status;
}

export interface MoveResult {
  accepted: boolean;
  reason: Reason | null;
  state: GameState;
}

// The reference board (same data as fixtures/board-reference.json).
export const REFERENCE_BOARD: Board = {
  id: 'reference',
  name: 'Reference treasure hunt',
  width: 3,
  height: 3,
  start: { x: 0, y: 0 },
  walls: [{ x: 1, y: 1 }],
  treasures: [{ id: 't1', x: 2, y: 0, value: 10 }],
  exit: { x: 2, y: 2 },
  initialMoves: 6,
};

const STEPS: Record<Direction, { dx: number; dy: number }> = {
  north: { dx: 0, dy: -1 },
  east: { dx: 1, dy: 0 },
  south: { dx: 0, dy: 1 },
  west: { dx: -1, dy: 0 },
};

function isDirection(value: unknown): value is Direction {
  return typeof value === 'string' && Object.hasOwn(STEPS, value);
}

function copyState(state: GameState): GameState {
  return {
    position: { x: state.position.x, y: state.position.y },
    movesRemaining: state.movesRemaining,
    score: state.score,
    collected: [...state.collected],
    status: state.status,
  };
}

function reject(state: GameState, reason: Reason): MoveResult {
  return { accepted: false, reason, state: copyState(state) };
}

// A fresh starting state for a board (the reference board by default).
export function initialState(board: Board = REFERENCE_BOARD): GameState {
  return {
    position: { x: board.start.x, y: board.start.y },
    movesRemaining: board.initialMoves,
    score: 0,
    collected: [],
    status: 'playing',
  };
}

// Evaluate one requested direction against a valid game state.
// Returns { accepted, reason, state }; a rejection returns an unchanged copy.
export function evaluateMove(
  state: GameState,
  direction: unknown,
  board: Board = REFERENCE_BOARD,
): MoveResult {
  if (state.status !== 'playing') return reject(state, 'GAME_COMPLETE');
  if (!isDirection(direction)) return reject(state, 'INVALID_ACTION');

  const { dx, dy } = STEPS[direction];
  const x = state.position.x + dx;
  const y = state.position.y + dy;
  if (x < 0 || y < 0 || x >= board.width || y >= board.height) return reject(state, 'EDGE');
  if (board.walls.some((wall) => wall.x === x && wall.y === y)) return reject(state, 'WALL');

  const next = copyState(state);
  next.position = { x, y };
  next.movesRemaining -= 1;
  for (const treasure of board.treasures) {
    if (treasure.x === x && treasure.y === y && !next.collected.includes(treasure.id)) {
      next.collected.push(treasure.id);
      next.score += treasure.value;
    }
  }
  const allCollected = board.treasures.every((treasure) => next.collected.includes(treasure.id));
  // A win on the exit is checked before the zero-budget loss (fixture F07).
  if (x === board.exit.x && y === board.exit.y && allCollected) next.status = 'won';
  else if (next.movesRemaining === 0) next.status = 'lost';
  return { accepted: true, reason: null, state: next };
}
