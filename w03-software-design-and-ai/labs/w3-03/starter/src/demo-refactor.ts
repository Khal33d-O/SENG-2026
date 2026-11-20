// Familiar treasure-hunt rule used in Weeks 3.02-3.06 (board: board.ts).
// Public operation: evaluateMove(state, direction) -> { accepted, state, reason }. Pure: never mutates input.
import { BOARD, type Position } from './board.js';

export type Direction = 'north' | 'east' | 'south' | 'west';
export type Status = 'playing' | 'won' | 'lost';
export type Reason = 'ILLEGAL_ACTION' | 'INVALID_ACTION' | 'GAME_COMPLETE';
export interface State {
  position: Position;
  movesRemaining: number;
  score: number;
  collected: string[];
  status: Status;
}
export interface MoveResult { accepted: boolean; state: State; reason: Reason | null }

const STEPS: Record<Direction, Position> = {
  north: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  south: { x: 0, y: 1 },
  west: { x: -1, y: 0 },
};

export function initialState(): State {
  return { position: { ...BOARD.start }, movesRemaining: BOARD.initialMoves, score: 0, collected: [], status: 'playing' };
}

function isBlocked(position: Position): boolean {
  const outside = position.x < 0 || position.y < 0 || position.x >= BOARD.width || position.y >= BOARD.height;
  return outside || BOARD.walls.some((w) => w.x === position.x && w.y === position.y);
}

// Accepted-state construction: one move, first collection of t1 adds its value once, win before loss.
function acceptedMove(state: State, position: Position): MoveResult {
  const collected = [...state.collected];
  let score = state.score;
  for (const t of BOARD.treasures) {
    if (t.x === position.x && t.y === position.y && !collected.includes(t.id)) {
      collected.push(t.id);
      score += t.value;
    }
  }
  const movesRemaining = state.movesRemaining - 1;
  const allCollected = BOARD.treasures.every((t) => collected.includes(t.id));
  const atExit = position.x === BOARD.exit.x && position.y === BOARD.exit.y;
  const status: Status = atExit && allCollected ? 'won' : movesRemaining === 0 ? 'lost' : 'playing';
  return { accepted: true, state: { position, movesRemaining, score, collected, status }, reason: null };
}

export function evaluateMove(state: State, direction: Direction): MoveResult {
  if (state.status !== 'playing') return { accepted: false, state, reason: 'GAME_COMPLETE' };
  const step = Object.hasOwn(STEPS, direction) ? STEPS[direction] : undefined;
  if (!step) return { accepted: false, state, reason: 'INVALID_ACTION' };
  const position = { x: state.position.x + step.x, y: state.position.y + step.y };
  const blocked = isBlocked(position);
  if (blocked) return {
    accepted: false, state: structuredClone(state), reason: 'ILLEGAL_ACTION'
  };
  return acceptedMove(state, position);
}
