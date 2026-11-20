// Public assertions for neighbours. Run with: npm test (it rebuilds first).
// For each case: exact ordered IDs, a new array of original references with
// a repeated call, and unchanged inputs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { neighbours } from '../dist/neighbours.js';
import { cases } from '../cases.mjs';
import { assertOriginalReferences, idsOf, mapEntries, snapshot } from './support.mjs';

for (const c of cases) {
  test(`${c.name}: exact ordered IDs`, () => {
    const access = new Map(c.access);
    const actual = neighbours(c.tiles, c.from, c.board, access);
    assert.deepEqual(idsOf(actual), c.expected, `${c.name}: expected ${JSON.stringify(c.expected)}`);
  });

  test(`${c.name}: new array of original tiles, same on a repeated call`, () => {
    const access = new Map(c.access);
    const first = neighbours(c.tiles, c.from, c.board, access);
    const second = neighbours(c.tiles, c.from, c.board, access);
    assertOriginalReferences(first, c.tiles, c.name);
    assert.notEqual(first, second, `${c.name}: each call returns its own array`);
    assert.deepEqual(idsOf(second), idsOf(first), `${c.name}: repeated call gives the same IDs`);
  });

  test(`${c.name}: tiles, from, board and access unchanged`, () => {
    const access = new Map(c.access);
    const tileRefs = [...c.tiles];
    const before = {
      tiles: snapshot(c.tiles),
      from: snapshot(c.from),
      board: snapshot(c.board),
      access: snapshot(mapEntries(access))
    };
    neighbours(c.tiles, c.from, c.board, access);
    assert.equal(snapshot(c.tiles), before.tiles, `${c.name}: tile properties and order unchanged`);
    assert.equal(c.tiles.length, tileRefs.length, `${c.name}: tile array length unchanged`);
    tileRefs.forEach((tile, i) => assert.equal(c.tiles[i], tile, `${c.name}: tile ${i} is the same object`));
    assert.equal(snapshot(c.from), before.from, `${c.name}: from unchanged`);
    assert.equal(snapshot(c.board), before.board, `${c.name}: board unchanged`);
    assert.equal(snapshot(mapEntries(access)), before.access, `${c.name}: access Map unchanged`);
  });
}
