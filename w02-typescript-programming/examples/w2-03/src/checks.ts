// Worked Examples 1 and 2: the same cost rule as an explicit loop and as a filter callback.
import assert from "node:assert/strict";

type Tile = { id: string; x: number; y: number; cost: number };
const tiles: Tile[] = [
  { id: "amber", x: 0, y: 0, cost: 2 },
  { id: "blue", x: 1, y: 0, cost: 5 },
  { id: "copper", x: 2, y: 0, cost: 3 },
];
const ids = (list: Tile[]): string[] => list.map((tile) => tile.id);

function affordableLoop(tiles: Tile[], budget: number): Tile[] {
  const result: Tile[] = [];
  for (let i = 0; i < tiles.length; i += 1) {
    const tile = tiles[i];
    if (tile.cost <= budget) result.push(tile);
  }
  return result;
}

function affordableFilter(tiles: Tile[], budget: number): Tile[] {
  return tiles.filter((tile: Tile): boolean => {
    return tile.cost <= budget;
  });
}

for (const select of [affordableLoop, affordableFilter]) {
  const actual = select(tiles, 3);
  assert.deepEqual(ids(actual), ["amber", "copper"]);
  assert.notEqual(actual, tiles);
  assert.equal(actual[0], tiles[0]);
  assert.deepEqual(ids(select(tiles, 1)), []); // no candidate qualifies
  assert.deepEqual(ids(select([], 3)), []); // no candidate visited
  console.log(select.name, ids(actual));
}
console.log("PASS loop and callback agree");
