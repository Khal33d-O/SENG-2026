// SUPPLIED helpers. Read them before use; none of them chooses an expected result.

// Fresh collection data on every call: p costs two, q costs four.
// It performs no selection.
export function demoTiles() {
  return [
    { id: 'p', x: 0, y: 0, cost: 2 },
    { id: 'q', x: 1, y: 0, cost: 4 },
  ];
}

// The identifiers of a tile array, in their existing order.
export function ids(tiles) {
  return tiles.map((tile) => tile.id);
}

// An independent copy of small fixture data, kept for a later comparison.
// A saved reference is not a before-image: a later write would change it too.
export function snapshot(value) {
  return structuredClone(value);
}
