// SUPPLIED: the twelve existing rule checks (shared fixtures F01-F11 plus one copy check).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { copyState, evaluate, initialState } from "../dist/rules.js";
import { referenceBoard } from "../dist/reference.js";

const dir = new URL("../fixtures/treasure/", import.meta.url);
const groups = new Map();
for (const file of readdirSync(dir).sort()) {
  const f = JSON.parse(readFileSync(new URL(file, dir), "utf8"));
  const key = f.id.slice(0, 3); // F09A/F09B and F10A/F10B are one check each
  groups.set(key, [...(groups.get(key) ?? []), f]);
}

for (const [key, fixtures] of groups) {
  test(`rule ${key}: ${fixtures.map((f) => f.description).join(" / ")}`, () => {
    for (const f of fixtures) {
      if (f.state === null) {
        assert.deepEqual(initialState(referenceBoard), f.expected.state);
        continue;
      }
      const before = JSON.stringify(f.state);
      assert.deepEqual(evaluate(referenceBoard, f.state, f.action), f.expected);
      assert.equal(JSON.stringify(f.state), before, "input must not be mutated");
    }
  });
}

test("rule copy: copyState returns an independent copy", () => {
  const start = initialState(referenceBoard);
  const copy = copyState(start);
  copy.collected.push("x");
  copy.position.x = 9;
  assert.deepEqual(start, initialState(referenceBoard));
});
