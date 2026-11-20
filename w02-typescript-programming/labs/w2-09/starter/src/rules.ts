// SUPPLIED: the existing local rules for the fixed reference game (agree with fixtures F01-F11).
// Pure: no DOM, clock or network; inputs are never mutated.

export interface Point {
  readonly x: number;
  readonly y: number;
}

export type Direction = "north" | "east" | "south" | "west";
export type Status = "playing" | "won" | "lost";
export type Reason = "WALL" | "EDGE" | "INVALID_ACTION" | "GAME_COMPLETE";

/** The local definition. The wire field initialMoves is called initialMoveBudget here. */
export interface LocalBoard {
  readonly width: number;
  readonly height: number;
  readonly start: Point;
  readonly walls: readonly Point[];
  readonly treasures: readonly { readonly id: string; readonly x: number; readonly y: number; readonly value: number }[];
  readonly exit: Point;
  readonly initialMoveBudget: number;
}

export interface GameState {
  readonly position: Point;
  readonly movesRemaining: number;
  readonly score: number;
  readonly collected: readonly string[];
  readonly status: Status;
}

export interface RuleResult {
  readonly accepted: boolean;
  readonly reason: Reason | null;
  readonly state: GameState;
}

export const REFERENCE_BOARD: LocalBoard = {
  width: 3,
  height: 3,
  start: { x: 0, y: 0 },
  walls: [{ x: 1, y: 1 }],
  treasures: [{ id: "t1", x: 2, y: 0, value: 10 }],
  exit: { x: 2, y: 2 },
  initialMoveBudget: 6,
};

const STEPS: Readonly<Record<Direction, Point>> = {
  north: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  south: { x: 0, y: 1 },
  west: { x: -1, y: 0 },
};

export function initialState(board: LocalBoard = REFERENCE_BOARD): GameState {
  return { position: { ...board.start }, movesRemaining: board.initialMoveBudget, score: 0, collected: [], status: "playing" };
}

const copy = (s: GameState): GameState => ({ ...s, position: { ...s.position }, collected: [...s.collected] });
const reject = (s: GameState, reason: Reason): RuleResult => ({ accepted: false, reason, state: copy(s) });

/** { accepted, reason, state } as in the shared contract. */
export function evaluate(board: LocalBoard, state: GameState, action: { type: string; direction?: string }): RuleResult {
  if (state.status !== "playing") return reject(state, "GAME_COMPLETE");
  if (!action || action.type !== "move" || !Object.hasOwn(STEPS, action.direction ?? "")) return reject(state, "INVALID_ACTION");
  const step = STEPS[action.direction as Direction];
  const x = state.position.x + step.x;
  const y = state.position.y + step.y;
  if (x < 0 || y < 0 || x >= board.width || y >= board.height) return reject(state, "EDGE");
  if (board.walls.some((w) => w.x === x && w.y === y)) return reject(state, "WALL");
  const collected = [...state.collected];
  let score = state.score;
  for (const t of board.treasures) {
    if (t.x === x && t.y === y && !collected.includes(t.id)) {
      collected.push(t.id);
      score += t.value;
    }
  }
  const movesRemaining = state.movesRemaining - 1;
  const allCollected = board.treasures.every((t) => collected.includes(t.id));
  // A win on the exit is checked before the zero-budget loss (fixture F07).
  const status: Status = x === board.exit.x && y === board.exit.y && allCollected ? "won" : movesRemaining === 0 ? "lost" : "playing";
  return { accepted: true, reason: null, state: { position: { x, y }, movesRemaining, score, collected, status } };
}

/** applyMove(before, action): the returned state. A rejection preserves every field; it never throws. */
export function applyMove(before: GameState, action: Direction): GameState {
  return evaluate(REFERENCE_BOARD, before, { type: "move", direction: action }).state;
}
