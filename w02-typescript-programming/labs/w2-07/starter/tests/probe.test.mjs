// OWNED FILE (editable probe). A teammate wrote these two claims; both require
// threshold two. You may change declarations and setup in this file. Do not skip
// a callback, change the runner's selection, rename a test or change an expected ID.
//
// Teammate's proposal: "replace the rule predicate with tile.cost > 2, because that
// makes the reported boundary agree with the full run." Predict its effect first.
import test from 'node:test';
import assert from 'node:assert/strict';
import { costly as rule } from '../dist/costly.js';
import { demoTiles, ids } from '../fixtures.mjs';
import { traced } from '../trace.mjs';

const costly = traced(rule); // prints the received threshold when TRACE=1

let threshold = 0;

test('probe: threshold two keeps only the tile above two', () => {
    threshold = 2;
    const tiles = [
        { id: 'r', x: 0, y: 1, cost: 1 },
        { id: 's', x: 1, y: 1, cost: 5 },
    ];
    assert.deepEqual(ids(costly(tiles, threshold)), ['s']);
});

test('boundary probe: equality at threshold two is excluded', () => {
    const tiles = demoTiles();
    assert.deepEqual(ids(costly(tiles, threshold)), ['q']);
});
