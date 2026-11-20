// SUPPLIED targeted inspection (npm run inspect, after a fresh build).
// Captures the input fields BEFORE the call, invokes the actual emitted rule
// once, then prints its output and the retained input. It never repeats the
// rule's comparison to work out an "expected" answer: that comes from the contract.
import { isDeepStrictEqual } from 'node:util';
import { costly } from './dist/costly.js';
import { demoTiles, ids, snapshot } from './fixtures.mjs';

const threshold = 2;
const tiles = demoTiles();
const before = snapshot(tiles); // independent before-image, not a reference

const describe = (list) => list.map((tile) => `${tile.id}:${tile.cost}`).join(', ');

console.log('INSPECT current rule: dist/costly.js (compiled from src/costly.ts)');
console.log(`  threshold passed:   ${threshold}`);
console.log(`  input costs before: ${describe(before)}`);

const result = costly(tiles, threshold); // the single actual call

console.log(`  actual IDs:         ${JSON.stringify(ids(result))}`);
console.log(`  input costs after:  ${describe(tiles)}`);
console.log(`  input unchanged:    ${isDeepStrictEqual(tiles, before)}`);
console.log(`  new result array:   ${result !== tiles}`);
