// SUPPLIED - independent rule fixtures (run after `npm run build`).
// These prove the supplied rule agrees with the course contract. They do NOT prove
// that a browser event reached the rule or that the page shows the result.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { evaluate, initialState, referenceBoard } from "../dist/rules.js";

const fixtures = new URL("../fixtures/", import.meta.url);
const load = (path) => JSON.parse(readFileSync(new URL(path, fixtures), "utf8"));

test("supplied board matches fixtures/board-reference.json", () => {
  assert.deepEqual(referenceBoard, load("board-reference.json"));
});

for (const file of readdirSync(new URL("treasure/", fixtures)).sort()) {
  const fixture = load(`treasure/${file}`);
  test(`${fixture.id} ${fixture.description}`, () => {
    if (fixture.state === null) {
      assert.deepEqual(
        { accepted: null, reason: null, state: initialState(referenceBoard) },
        fixture.expected,
      );
      return;
    }
    const before = JSON.stringify(fixture.state);
    assert.deepEqual(evaluate(referenceBoard, fixture.state, fixture.action), fixture.expected);
    assert.equal(JSON.stringify(fixture.state), before, "input state must not be mutated");
  });
}
