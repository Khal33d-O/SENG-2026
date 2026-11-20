# Source context

The full baseline source and the supplied candidate C diff. Board facts are in `board.ts` (reproduced below).
The candidate's explanation is in [`candidate-message.md`](candidate-message.md).

## `src/board.ts`

```ts
// Supplied board facts (the reference board, source/shared/fixtures/board-reference.json).
export interface Position { x: number; y: number }
export const BOARD = {
  id: 'reference',
  width: 3,
  height: 3,
  start: { x: 0, y: 0 },
  walls: [{ x: 1, y: 1 }],
  treasures: [{ id: 't1', x: 2, y: 0, value: 10 }],
  exit: { x: 2, y: 2 },
  initialMoves: 6,
} as const;
```

## Baseline `src/rules.ts` (known defect)

```ts
// Familiar treasure-hunt rule (board: board.ts).
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

export function evaluateMove(state: State, direction: Direction): MoveResult {
  if (state.status !== 'playing') return { accepted: false, state, reason: 'GAME_COMPLETE' };
  const step = typeof direction === 'string' && Object.hasOwn(STEPS, direction) ? STEPS[direction] : undefined;
  if (!step) return { accepted: false, state, reason: 'INVALID_ACTION' };
  const position = { x: state.position.x + step.x, y: state.position.y + step.y };
  const blocked = isBlocked(position);
  // Known Week 3 baseline defect: a rejected (blocked) action still spends one move.
  if (blocked) return {
    accepted: false, state: { ...state, movesRemaining: state.movesRemaining - 1 }, reason: 'ILLEGAL_ACTION'
  };

  // Accepted: one move, first collection of t1 adds its value once, win before zero-budget loss.
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
```

## Candidate C diff (also in [`candidate-C.diff`](candidate-C.diff))

```diff
--- baseline/src/rules.ts
+++ candidate-c/src/rules.ts
@@ -32,13 +32,12 @@
 
 export function evaluateMove(state: State, direction: Direction): MoveResult {
   if (state.status !== 'playing') return { accepted: false, state, reason: 'GAME_COMPLETE' };
-  const step = typeof direction === 'string' && Object.hasOwn(STEPS, direction) ? STEPS[direction] : undefined;
+  const step = Object.hasOwn(STEPS, direction) ? STEPS[direction] : undefined;
   if (!step) return { accepted: false, state, reason: 'INVALID_ACTION' };
   const position = { x: state.position.x + step.x, y: state.position.y + step.y };
   const blocked = isBlocked(position);
-  // Known Week 3 baseline defect: a rejected (blocked) action still spends one move.
   if (blocked) return {
-    accepted: false, state: { ...state, movesRemaining: state.movesRemaining - 1 }, reason: 'ILLEGAL_ACTION'
+    accepted: false, state, reason: 'ILLEGAL_ACTION'
   };
 
   // Accepted: one move, first collection of t1 adds its value once, win before zero-budget loss.
@@ -50,7 +49,8 @@
       score += t.value;
     }
   }
-  const movesRemaining = state.movesRemaining - 1;
+  const treasure = collected.length > state.collected.length;
+  const movesRemaining = state.movesRemaining - (treasure ? 0 : 1);
   const allCollected = BOARD.treasures.every((t) => collected.includes(t.id));
   const atExit = position.x === BOARD.exit.x && position.y === BOARD.exit.y;
   const status: Status = atExit && allCollected ? 'won' : movesRemaining === 0 ? 'lost' : 'playing';
```

SHA-256 of the TypeScript sources: baseline `54a3969f88f79a47`, candidate C `20d2a7100f2bd13d`,
corrected reference `e0b0143f36125260`.
