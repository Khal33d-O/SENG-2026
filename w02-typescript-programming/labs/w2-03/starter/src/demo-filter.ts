// Worked Example 2: the same rule as a typed filter callback.
// Run with: npm run demo:filter
import type { Tile } from './model.js';
import { ids } from './supplied.js';
import { demoTiles } from './demo-tiles.js';

export function affordableFilter(tiles: Tile[], budget: number): Tile[] {
  // filter visits each tile in order and collects those for which the
  // callback returns true. The inner return decides ONE tile; the outer
  // return gives the collected array to the caller.
  return tiles.filter((tile: Tile): boolean => {
    return tile.cost <= budget;
  });
}

const actual = affordableFilter(demoTiles, 3);
console.log('budget 3 ->', ids(actual));
console.log('budget 1 ->', ids(affordableFilter(demoTiles, 1)));
console.log('empty input ->', ids(affordableFilter([], 3)));
console.log('new container?', actual !== demoTiles, '| same amber object?', actual[0] === demoTiles[0]);
