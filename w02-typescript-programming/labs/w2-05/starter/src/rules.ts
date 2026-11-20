// SUPPLIED - do not edit. The treasure-hunt rule engine for this lab.
//
// `evaluate` is a pure function: no DOM, clock, randomness or I/O, and it never
// mutates its inputs. It agrees with the course fixtures in ../fixtures/treasure
// (checked by tests/rules.test.mjs) and with source/shared/contract/GAME-CONTRACT.md.
//
// `applyMove` is the move rule the page calls. It also counts its calls so that
// "Read diagnostics" can show how many times a browser input reached the rule.

export type Direction = "north" | "east" | "south" | "west";
export type Status = "playing" | "won" | "lost";

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  position: Position;
  movesRemaining: number;
  score: number;
  collected: string[];
  status: Status;
}

export interface Treasure extends Position {
  id: string;
  value: number;
}

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

export type RejectReason = "WALL" | "EDGE" | "INVALID_ACTION" | "GAME_COMPLETE";

export interface MoveResult {
  accepted: boolean;
  reason: RejectReason | null;
  state: GameState;
}

// The same values as fixtures/board-reference.json.
export const referenceBoard: Board = {
  id: "reference",
  name: "Reference treasure hunt",
  width: 3,
  height: 3,
  start: { x: 0, y: 0 },
  walls: [{ x: 1, y: 1 }],
  treasures: [{ id: "t1", x: 2, y: 0, value: 10 }],
  exit: { x: 2, y: 2 },
  initialMoves: 6,
};

// x increases eastwards (rightwards); y increases southwards (downwards).
const steps: Record<Direction, Position> = {
  north: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  south: { x: 0, y: 1 },
  west: { x: -1, y: 0 },
};

function isDirection(value: unknown): value is Direction {
  return typeof value === "string" && Object.hasOwn(steps, value);
}

export function initialState(board: Board = referenceBoard): GameState {
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

function reject(state: GameState, reason: RejectReason): MoveResult {
  return { accepted: false, reason, state: copy(state) };
}

// The action is `unknown` because fixtures also check malformed actions.
export function evaluate(board: Board, state: GameState, action: unknown): MoveResult {
  if (state.status !== "playing") return reject(state, "GAME_COMPLETE");
  if (typeof action !== "object" || action === null) return reject(state, "INVALID_ACTION");
  const { type, direction } = action as { type?: unknown; direction?: unknown };
  if (type !== "move" || !isDirection(direction)) return reject(state, "INVALID_ACTION");

  const x = state.position.x + steps[direction].x;
  const y = state.position.y + steps[direction].y;
  if (x < 0 || y < 0 || x >= board.width || y >= board.height) return reject(state, "EDGE");
  if (board.walls.some((wall) => wall.x === x && wall.y === y)) return reject(state, "WALL");

  const next = copy(state);
  next.position = { x, y };
  next.movesRemaining -= 1;
  for (const treasure of board.treasures) {
    if (treasure.x === x && treasure.y === y && !next.collected.includes(treasure.id)) {
      next.collected.push(treasure.id);
      next.score += treasure.value;
    }
  }
  const allCollected = board.treasures.every((treasure) => next.collected.includes(treasure.id));
  // A win on the exit is checked before the zero-move loss, so a final-move win counts.
  if (x === board.exit.x && y === board.exit.y && allCollected) next.status = "won";
  else if (next.movesRemaining === 0) next.status = "lost";
  return { accepted: true, reason: null, state: next };
}

// ---- Diagnostics: how many times has a page input reached the move rule? ----
let moveRuleCalls = 0;

export function moveRuleCallCount(): number {
  return moveRuleCalls;
}

export function resetMoveRuleCallCount(): void {
  moveRuleCalls = 0;
}

// The move rule used by the page: returns the next state (or an unchanged copy
// when the move is blocked or the game is complete). Retain what it returns.
export function applyMove(state: GameState, direction: Direction): GameState {
  moveRuleCalls += 1;
  return evaluate(referenceBoard, state, { type: "move", direction }).state;
}

// The "Final approach" checkpoint: treasure collected, near the exit, two moves left.
export function finalApproachState(): GameState {
  return {
    position: { x: 2, y: 0 },
    movesRemaining: 2,
    score: 10,
    collected: ["t1"],
    status: "playing",
  };
}
