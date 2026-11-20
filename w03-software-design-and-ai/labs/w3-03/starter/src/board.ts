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
