// Supplied helpers. Read their bodies, then use their contracts without
// rewriting them. None of them writes to its inputs.
import type { Board, Position, Tile } from './model.js';

/** true when the tile's zero-based coordinates lie inside both board dimensions. */
export function inside(tile: Tile, board: Board): boolean {
  return tile.x >= 0 && tile.x < board.width && tile.y >= 0 && tile.y < board.height;
}

/** Number of horizontal plus vertical steps between two positions. */
export function stepDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/** The tiles' string identifiers, in the same order as the array. */
export function ids(tiles: Tile[]): string[] {
  return tiles.map((tile: Tile): string => tile.id);
}
