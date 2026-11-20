// COMPLETE EXAMPLE (Worked Example 1, npm run demo:named). Do not edit.
// The same membership claim as demos/bare-assertion.mjs, now inside a named test.
// Note the import: dist/conversion.js, not the seeded dist/costly.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { costly } from '../dist/conversion.js';
import { demoTiles, ids } from '../fixtures.mjs';

test('converted assertion: excludes equality', () => {
    const tiles = demoTiles();
    const result = costly(tiles, 2);
    assert.deepEqual(ids(result), ['q']);
});
