// Supplied assertion helpers shared by the test files.
import assert from 'node:assert/strict';

/** A deep, independent record of a value's current contents. */
export function snapshot(value) {
  return JSON.stringify(value);
}

/** The Map's entries as an array, in insertion order. */
export function mapEntries(map) {
  return [...map.entries()];
}

/** Identifiers of an array of tiles, in order. */
export function idsOf(tiles) {
  return tiles.map((tile) => tile.id);
}

/**
 * Checks that `actual` is a new array whose elements are original tile
 * objects from `tiles` (same references, not clones).
 */
export function assertOriginalReferences(actual, tiles, label) {
  assert.ok(Array.isArray(actual), `${label}: result is an array`);
  assert.notEqual(actual, tiles, `${label}: result is a new array, not the input array`);
  for (const tile of actual) {
    assert.ok(tiles.includes(tile), `${label}: ${tile && tile.id} is an original input object`);
  }
}
