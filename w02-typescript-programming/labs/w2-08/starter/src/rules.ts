// Familiar pure movement rule for the reference treasure hunt (supplied: preserve).
// No DOM, clock, randomness or I/O, and inputs are never mutated.
// The results agree with the shared fixtures copied into ../fixtures/treasure
// (tests/rules.test.mjs checks every one of them).

export type Direction = "north" | "east" | "south" | "west";
export type Status = "playing" | "won" | "lost";
export type RejectReason = "WALL" | "EDGE" | "INVALID_ACTION" | "GAME_COMPLETE";

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  position: Position;
  movesRemaining: number;
  score: number;
  collectedTreasureIds: string[];
  status: Status;
}

export interface MoveResult {
  accepted: boolean;
  reason: RejectReason | null;
  state: GameState;
}

export interface Treasure {
  id: string;
  x: number;
  y: number;
  value: number;
}

export interface Board {
  width: number;
  height: number;
  start: Position;
  walls: Position[];
  treasures: Treasure[];
  exit: Position;
  initialMoves: number;
}

// The reference board: 3 x 3, wall at (1,1), treasure t1 (10) at (2,0), exit (2,2), six moves.
export const REFERENCE_BOARD: Board = {
  width: 3,
  height: 3,
  start: { x: 0, y: 0 },
  walls: [{ x: 1, y: 1 }],
  treasures: [{ id: "t1", x: 2, y: 0, value: 10 }],
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
  return typeof value === "string" && Object.hasOwn(STEPS, value);
}

export function initialState(board: Board = REFERENCE_BOARD): GameState {
  return {
    position: { x: board.start.x, y: board.start.y },
    movesRemaining: board.initialMoves,
    score: 0,
    collectedTreasureIds: [],
    status: "playing",
  };
}

// The rule's own private copy: a rejected move returns an unchanged copy.
function copyForRule(state: GameState): GameState {
  return {
    position: { x: state.position.x, y: state.position.y },
    movesRemaining: state.movesRemaining,
    score: state.score,
    collectedTreasureIds: [...state.collectedTreasureIds],
    status: state.status,
  };
}

function reject(state: GameState, reason: RejectReason): MoveResult {
  return { accepted: false, reason, state: copyForRule(state) };
}

// Full evaluation: accepted flag, reason and the resulting state.
// `direction` is deliberately wider than Direction so an unknown or missing value can be rejected.
export function evaluateMove(
  state: GameState,
  direction: string | undefined,
  board: Board = REFERENCE_BOARD,
): MoveResult {
  if (state.status !== "playing") return reject(state, "GAME_COMPLETE");
  if (!isDirection(direction)) return reject(state, "INVALID_ACTION");

  const { dx, dy } = STEPS[direction];
  const x = state.position.x + dx;
  const y = state.position.y + dy;
  if (x < 0 || y < 0 || x >= board.width || y >= board.height) return reject(state, "EDGE");
  if (board.walls.some((wall) => wall.x === x && wall.y === y)) return reject(state, "WALL");

  const next = copyForRule(state);
  next.position = { x, y };
  next.movesRemaining -= 1;
  for (const treasure of board.treasures) {
    if (treasure.x === x && treasure.y === y && !next.collectedTreasureIds.includes(treasure.id)) {
      next.collectedTreasureIds.push(treasure.id);
      next.score += treasure.value;
    }
  }
  const allCollected = board.treasures.every((t) => next.collectedTreasureIds.includes(t.id));
  // Winning on the exit is checked before the zero-budget loss, so a final-move win counts.
  if (x === board.exit.x && y === board.exit.y && allCollected) next.status = "won";
  else if (next.movesRemaining === 0) next.status = "lost";
  return { accepted: true, reason: null, state: next };
}

// The movement rule used by every component: receives a state and a direction, returns a state.
// The caller must retain the returned value; the input is never changed.
export function applyMove(state: GameState, direction: Direction): GameState {
  return evaluateMove(state, direction).state;
}
