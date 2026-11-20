// OWNED FILE: make the bounded rule correction here (and nowhere else in src/).
//
// Contract: return a NEW array holding the original tile objects whose cost is
// strictly greater than the caller's threshold. Preserve tile order. Do not
// change the input array or any tile. Empty input returns an empty array.
import type { Tile } from './tile.js';

export function costly(tiles: Tile[], threshold: number): Tile[] {
  return tiles.filter((tile: Tile): boolean => {
    return tile.cost >= threshold;
  });
}
