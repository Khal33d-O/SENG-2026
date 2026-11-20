// SUPPLIED complete demonstrated regression (Worked Example 2). Keep it unchanged
// for comparison. It fails against the seeded src/costly.ts and passes after the
// bounded correction, with the same test bytes both times.
import test from 'node:test';
import assert from 'node:assert/strict';
import { costly } from '../dist/costly.js';
import { demoTiles, ids, snapshot } from '../fixtures.mjs';

test('regression: equality is excluded at threshold two', () => {
    // Setup: fresh p (cost 2) and q (cost 4), plus an independent before-image.
    const tiles = demoTiles();
    const before = snapshot(tiles);

    // Action: one call to the rule under investigation.
    const result = costly(tiles, 2);

    // Assertions: membership first (the claim this regression protects) ...
    assert.deepEqual(ids(result), ['q'], 'cost equal to the threshold must be excluded');
    // ... then input preservation, a new result array and the retained original object.
    assert.deepEqual(tiles, before, 'input tiles keep their original fields');
    assert.notEqual(result, tiles, 'result is a different array');
    assert.equal(result[0], tiles[1], 'retained q is the original q object');
});
