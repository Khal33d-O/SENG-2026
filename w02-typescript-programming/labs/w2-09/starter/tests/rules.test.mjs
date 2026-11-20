// SUPPLIED: the twelve rule checks (fixtures F01-F11, byte-identical copies in fixtures/treasure,
// plus one applyMove check). These must stay green before and after your adapter repair.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { REFERENCE_BOARD, applyMove, evaluate, initialState } from "../dist/rules.js";

const dir = new URL("../fixtures/treasure/", import.meta.url);
const byId = new Map();
for (const file of readdirSync(dir).sort()) {
  const f = JSON.parse(readFileSync(new URL(file, dir), "utf8"));
  const key = f.id.slice(0, 3); // F09A and F09B form one check, as do F10A and F10B
  byId.set(key, [...(byId.get(key) ?? []), f]);
}

for (const [key, fixtures] of byId) {
  test(`${key} ${fixtures.map((f) => f.description).join(" / ")}`, () => {
    for (const f of fixtures) {
      if (f.state === null) {
        assert.deepEqual(initialState(REFERENCE_BOARD), f.expected.state);
        continue;
      }
      const before = JSON.stringify(f.state);
      assert.deepEqual(evaluate(REFERENCE_BOARD, f.state, f.action), f.expected);
      assert.equal(JSON.stringify(f.state), before, "input must not be mutated");
    }
  });
}

test("applyMove returns the next state and never throws on rejection", () => {
  const start = initialState();
  assert.deepEqual(applyMove(start, "east").position, { x: 1, y: 0 });
  assert.deepEqual(applyMove(start, "north"), start); // edge: every field preserved, no move spent
});
