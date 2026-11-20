// Baseline: the build succeeded and the supplied helpers and fixtures behave
// as documented. Run with: npm run check:baseline
// This should PASS on the unchanged starter, even though neighbours is still
// a placeholder that returns an empty array.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inside, stepDistance, ids } from '../dist/supplied.js';
import { neighbours } from '../dist/neighbours.js';
import { cases } from '../cases.mjs';

const board = { width: 4, height: 3 };

test('inside: zero-based coordinates within both dimensions', () => {
  assert.equal(inside({ id: 'a', x: 0, y: 0, cost: 0 }, board), true);
  assert.equal(inside({ id: 'b', x: 3, y: 2, cost: 0 }, board), true);
  assert.equal(inside({ id: 'c', x: 4, y: 2, cost: 0 }, board), false, 'x === width is outside');
  assert.equal(inside({ id: 'd', x: 3, y: 3, cost: 0 }, board), false, 'y === height is outside');
  assert.equal(inside({ id: 'e', x: -1, y: 0, cost: 0 }, board), false, 'negative x is outside');
});

test('stepDistance: horizontal plus vertical step count', () => {
  assert.equal(stepDistance({ x: 0, y: 0 }, { x: 1, y: 1 }), 2);
  assert.equal(stepDistance({ x: 0, y: 0 }, { x: 0, y: 0 }), 0);
  assert.equal(stepDistance({ x: 2, y: 1 }, { x: 2, y: 0 }), 1);
});

test('ids: identifiers in array order', () => {
  const tiles = [
    { id: 'blue', x: 1, y: 0, cost: 5 },
    { id: 'amber', x: 0, y: 0, cost: 2 }
  ];
  assert.deepEqual(ids(tiles), ['blue', 'amber']);
  assert.deepEqual(ids([]), []);
});

test('public fixtures: unique ids, positive dimensions, origin inside board', () => {
  for (const c of cases) {
    const seen = new Set(c.tiles.map((t) => t.id));
    assert.equal(seen.size, c.tiles.length, `${c.name}: tile ids are unique`);
    assert.ok(c.board.width > 0 && c.board.height > 0, `${c.name}: positive dimensions`);
    assert.ok(inside({ id: 'origin', x: c.from.x, y: c.from.y, cost: 0 }, c.board), `${c.name}: origin inside`);
  }
});

test('neighbours: callable and returns an array', () => {
  const c = cases[0];
  const result = neighbours(c.tiles, c.from, c.board, new Map(c.access));
  assert.ok(Array.isArray(result));
});
