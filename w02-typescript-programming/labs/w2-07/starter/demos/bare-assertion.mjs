// COMPLETE EXAMPLE (Worked Example 1, npm run demo:bare).
// The familiar W2.03 bare assertion: no test name, no runner report.
// If the comparison disagreed, assert would throw and stop this script.
import assert from 'node:assert/strict';
import { costly } from '../dist/conversion.js';
import { demoTiles, ids } from '../fixtures.mjs';

const tiles = demoTiles();                 // setup
const result = costly(tiles, 2);           // action
assert.deepEqual(ids(result), ['q']);      // assertion

console.log('PASS bare assertion: costly(demoTiles(), 2) from dist/conversion.js returned ["q"] (equality excluded)');
