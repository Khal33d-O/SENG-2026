// TypeScript reference engine for the treasure hunt (the Week 2 rules, unchanged in meaning).
// Pure functions: no DOM, clock, randomness or I/O, and inputs are never mutated.
// Only erasable TypeScript syntax is used, so Node 24 can run this file directly.

export type Direction = "north" | "east" | "south" | "west";
export type Status = "playing" | "won" | "lost";
export type Reason = "WALL" | "EDGE" | "INVALID_ACTION" | "GAME_COMPLETE";

export interface Position { x: number; y: number }
export interface Treasure { id: string; x: number; y: number; value: number }
export interface Board {
  id: string;
  name: string;
  width: number;
  height: number;
  start: Position;
  walls: Position[];
  treasures: Treasure[];
  exit: Position;
  initialMoves: number;
}
export interface GameState {
  position: Position;
  movesRemaining: number;
  score: number;
  collected: string[];
  status: Status;
}
export interface MoveAction { type?: string; direction?: string | null }
export interface MoveResult { accepted: boolean; reason: Reason | null; state: GameState }

// A lookup table rather than a switch: different structure, same observable behaviour as C#.
const DIRECTIONS: Record<Direction, { dx: number; dy: number }> = {
  north: { dx: 0, dy: -1 },
  east: { dx: 1, dy: 0 },
  south: { dx: 0, dy: 1 },
  west: { dx: -1, dy: 0 },
};

function isDirection(value: unknown): value is Direction {
  return typeof value === "string" && Object.hasOwn(DIRECTIONS, value);
}

export function initialState(board: Board): GameState {
  return {
    position: { x: board.start.x, y: board.start.y },
    movesRemaining: board.initialMoves,
    score: 0,
    collected: [],
    status: "playing",
  };
}

function copy(state: GameState): GameState {
  return {
    position: { x: state.position.x, y: state.position.y },
    movesRemaining: state.movesRemaining,
    score: state.score,
    collected: [...state.collected],
    status: state.status,
  };
}

function reject(state: GameState, reason: Reason): MoveResult {
  return { accepted: false, reason, state: copy(state) };
}

export function evaluate(board: Board, state: GameState, action: MoveAction | null): MoveResult {
  if (state.status !== "playing") return reject(state, "GAME_COMPLETE");
  if (!action || action.type !== "move" || !isDirection(action.direction)) {
    return reject(state, "INVALID_ACTION");
  }
  const { dx, dy } = DIRECTIONS[action.direction];
  const x = state.position.x + dx;
  const y = state.position.y + dy;
  if (x < 0 || y < 0 || x >= board.width || y >= board.height) return reject(state, "EDGE");
  if (board.walls.some((w) => w.x === x && w.y === y)) return reject(state, "WALL");

  const next = copy(state);
  next.position = { x, y };
  next.movesRemaining -= 1;
  for (const t of board.treasures) {
    if (t.x === x && t.y === y && !next.collected.includes(t.id)) {
      next.collected.push(t.id);
      next.score += t.value;
    }
  }
  const allCollected = board.treasures.every((t) => next.collected.includes(t.id));
  // Win on the exit is checked before the zero-budget loss, so a final-move win counts (F07).
  if (x === board.exit.x && y === board.exit.y && allCollected) next.status = "won";
  else if (next.movesRemaining === 0) next.status = "lost";
  return { accepted: true, reason: null, state: next };
}
