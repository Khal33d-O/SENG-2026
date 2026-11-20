// Rule module: legal actions and next state for the reference board.
// SEEDED DEFECT (Week 3 fixture): a rejected (blocked) action still spends one move.
// Intended after East, South: five moves. Supplied actual: four. Do not fix it in W3.01.
export type Direction = 'north' | 'east' | 'south' | 'west';
export interface State {
  position: { x: number; y: number };
  movesRemaining: number;
  score: number;
  collected: string[];
  status: 'playing' | 'won' | 'lost';
}

const STEPS: Record<Direction, { x: number; y: number }> = {
  north: { x: 0, y: -1 }, east: { x: 1, y: 0 }, south: { x: 0, y: 1 }, west: { x: -1, y: 0 },
};
const BOARD = { width: 3, height: 3, wall: { x: 1, y: 1 }, treasure: { id: 't1', x: 2, y: 0, value: 10 }, exit: { x: 2, y: 2 } };

export function initialState(): State {
  return { position: { x: 0, y: 0 }, movesRemaining: 6, score: 0, collected: [], status: 'playing' };
}

export function applyMove(state: State, direction: Direction): State {
  if (state.status !== 'playing') return structuredClone(state);
  const step = STEPS[direction];
  const x = state.position.x + step.x;
  const y = state.position.y + step.y;
  const blocked = x < 0 || y < 0 || x >= BOARD.width || y >= BOARD.height || (x === BOARD.wall.x && y === BOARD.wall.y);
  if (blocked) return { ...structuredClone(state), movesRemaining: state.movesRemaining - 1 }; // seeded defect
  const next = structuredClone(state);
  next.position = { x, y };
  next.movesRemaining -= 1;
  if (x === BOARD.treasure.x && y === BOARD.treasure.y && !next.collected.includes(BOARD.treasure.id)) {
    next.collected.push(BOARD.treasure.id);
    next.score += BOARD.treasure.value;
  }
  if (x === BOARD.exit.x && y === BOARD.exit.y && next.collected.includes(BOARD.treasure.id)) next.status = 'won';
  else if (next.movesRemaining === 0) next.status = 'lost';
  return next;
}
