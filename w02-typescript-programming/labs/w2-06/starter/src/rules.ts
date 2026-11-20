// Supplied: the pure local rule (no DOM, no network, inputs never mutated).
// It agrees with the shared fixtures F01-F11 (see tests/rules.test.mjs).
import type { Direction, GameState, LocalBoard, RejectReason, RuleResult } from "./board.js";

const STEPS: Record<Direction, { dx: number; dy: number }> = {
  north: { dx: 0, dy: -1 },
  east: { dx: 1, dy: 0 },
  south: { dx: 0, dy: 1 },
  west: { dx: -1, dy: 0 },
};

export function initialState(board: LocalBoard): GameState {
  return {
    position: { x: board.start.x, y: board.start.y },
    movesRemaining: board.initialMoveBudget,
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

function reject(state: GameState, reason: RejectReason): RuleResult {
  return { accepted: false, reason, state: copy(state) };
}

function isDirection(value: unknown): value is Direction {
  return typeof value === "string" && Object.hasOwn(STEPS, value);
}

// action is unknown because the fixtures also send unknown or missing directions.
export function evaluate(board: LocalBoard, state: GameState, action: unknown): RuleResult {
  if (state.status !== "playing") return reject(state, "GAME_COMPLETE");
  if (typeof action !== "object" || action === null) return reject(state, "INVALID_ACTION");
  const { type, direction } = action as { type?: unknown; direction?: unknown };
  if (type !== "move" || !isDirection(direction)) return reject(state, "INVALID_ACTION");

  const step = STEPS[direction];
  const x = state.position.x + step.dx;
  const y = state.position.y + step.dy;
  if (x < 0 || y < 0 || x >= board.width || y >= board.height) return reject(state, "EDGE");
  // A movement target is compared with every wall.
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
  // A win on the exit is checked before the zero-budget loss (fixture F07).
  if (x === board.exit.x && y === board.exit.y && allCollected) next.status = "won";
  else if (next.movesRemaining === 0) next.status = "lost";
  return { accepted: true, reason: null, state: next };
}
