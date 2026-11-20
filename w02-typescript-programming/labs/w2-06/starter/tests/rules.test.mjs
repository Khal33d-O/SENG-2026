// SUPPLIED: the local rule agrees with the shared fixtures F01-F11 (copied byte-identically into fixtures/).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { REFERENCE_BOARD } from "../dist/board.js";
import { evaluate, initialState } from "../dist/rules.js";

const dir = new URL("../fixtures/treasure/", import.meta.url);
for (const file of readdirSync(dir).sort()) {
  const f = JSON.parse(readFileSync(new URL(file, dir), "utf8"));
  test(`${f.id} ${f.description}`, () => {
    if (f.state === null) {
      assert.deepEqual(initialState(REFERENCE_BOARD), f.expected.state);
      return;
    }
    const before = JSON.stringify(f.state);
    assert.deepEqual(evaluate(REFERENCE_BOARD, f.state, f.action), f.expected);
    assert.equal(JSON.stringify(f.state), before, "input state must not be mutated");
  });
}
