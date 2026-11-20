// Worked Example 1: inspect a tile collection with an explicit loop.
// Run with: npm run demo:loop
import type { Tile } from './model.js';
import { ids } from './supplied.js';
import { demoTiles } from './demo-tiles.js';

export function affordableLoop(tiles: Tile[], budget: number): Tile[] {
  const result: Tile[] = []; // a NEW array, allocated before the loop
  for (let i = 0; i < tiles.length; i += 1) {
    const tile = tiles[i]; // one element per iteration
    if (tile.cost <= budget) result.push(tile); // equality is part of the rule
  }
  return result; // return after the loop, not inside it
}

console.log('budget 3 ->', ids(affordableLoop(demoTiles, 3)));
console.log('budget 1 ->', ids(affordableLoop(demoTiles, 1)), '(no candidate qualifies)');
console.log('empty input ->', ids(affordableLoop([], 3)), '(no candidate visited)');
console.log('input still has', demoTiles.length, 'tiles');
