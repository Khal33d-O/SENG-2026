// Supplied checkpoint for the guided threshold exercise ONLY.
// If you use it, preserve your own attempt first, copy this file over
// src/practice.ts and mark "checkpoint-supported" in evidence.md.
import type { Tile } from './model.js';

/** Returns the tiles whose cost is strictly greater than threshold, in input order. */
export function costly(tiles: Tile[], threshold: number): Tile[] {
  // One Boolean decision per tile: strictly greater than, so equality is excluded.
  return tiles.filter((tile: Tile): boolean => {
    return tile.cost > threshold;
  });
}
