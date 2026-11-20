// Guided practice runner. Run with: npm run practice
// Keep every supplied assertion intact.
import assert from 'node:assert/strict';
import { costly } from './dist/practice.js';
import { ids } from './dist/supplied.js';

// Strict threshold: costs two and four with threshold two.
const tiles = [
  { id: 'two', x: 0, y: 0, cost: 2 },
  { id: 'four', x: 1, y: 0, cost: 4 }
];
const before = JSON.stringify(tiles);
const actual = costly(tiles, 2);
assert.deepEqual(ids(actual), ['four'], 'strict threshold: cost equal to threshold is excluded');
assert.notEqual(actual, tiles, 'strict threshold: result is a new array');
assert.equal(actual[0], tiles[1], 'strict threshold: retained tile is the original object');
assert.equal(JSON.stringify(tiles), before, 'strict threshold: input unchanged');

// Empty input gives an empty (new) result.
const none = [];
const emptyResult = costly(none, 2);
assert.deepEqual(ids(emptyResult), [], 'empty: no tiles returned');
assert.notEqual(emptyResult, none, 'empty: result is a new array');

// Keyed replacement in a caption Map (separate from the challenge's access Map).
const captions = new Map();
captions.set('p', 'Waiting');
captions.set('q', 'Waiting');
captions.set('q', 'Ready');
assert.equal(captions.get('q'), 'Ready', 'keyed replacement: q now holds Ready');
assert.equal(captions.size, 2, 'keyed replacement: still two keys');

console.log('PASS guided practice: strict threshold, empty, keyed replacement');
