// COMPLETE EXAMPLE (Worked Example 1). Do not edit.
// The familiar W2.03 rule: keep the tiles whose cost is strictly greater than
// the caller's threshold. This module is deliberately separate from the
// seeded src/costly.ts, so the conversion example always imports a correct rule.
import type { Tile } from './tile.js';

export function costly(tiles: Tile[], threshold: number): Tile[] {
  return tiles.filter((tile: Tile): boolean => {
    return tile.cost > threshold;
  });
}
