// Reference treasure-hunt rules shared by every week of the course.
// Pure functions: no DOM, clock, randomness or I/O, and inputs are never mutated.
// TypeScript (W2), C# (W4) and the .NET API (W5) must agree with these results
// on every fixture in ../fixtures/treasure.

export const DIRECTIONS = Object.freeze({
  north: { dx: 0, dy: -1 },
  east: { dx: 1, dy: 0 },
  south: { dx: 0, dy: 1 },
  west: { dx: -1, dy: 0 },
});

export function initialState(board) {
  return {
    position: { x: board.start.x, y: board.start.y },
    movesRemaining: board.initialMoves,
    score: 0,
    collected: [],
    status: "playing",
  };
}

function copy(state) {
  return {
    position: { x: state.position.x, y: state.position.y },
    movesRemaining: state.movesRemaining,
    score: state.score,
    collected: [...state.collected],
    status: state.status,
  };
}

function reject(state, reason) {
  return { accepted: false, reason, state: copy(state) };
}

export function evaluate(board, state, action) {
  if (state.status !== "playing") return reject(state, "GAME_COMPLETE");
  if (!action || action.type !== "move" || !Object.hasOwn(DIRECTIONS, action.direction ?? "")) {
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
  // Winning on the exit is checked before the zero-budget loss, so a final-move win counts.
  if (x === board.exit.x && y === board.exit.y && allCollected) next.status = "won";
  else if (next.movesRemaining === 0) next.status = "lost";
  return { accepted: true, reason: null, state: next };
}
