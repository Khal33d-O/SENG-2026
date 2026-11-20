// Baseline check (npm run check:baseline). Passes on the unchanged starter:
// it confirms the TypeScript compiled and calculate() returns an inspectable
// object. It does NOT check the preview rule; npm test does that.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";

test("the build emitted dist/calculate.js", () => {
  assert.ok(existsSync(new URL("../dist/calculate.js", import.meta.url)));
});

test("calculate returns an object with numeric score/capacity and Boolean completion", async () => {
  const { calculate } = await import("../dist/calculate.js");
  const result = calculate({ score: 1, actionsRemaining: 1, completed: false }, 0, 1);
  assert.equal(typeof result, "object");
  assert.notEqual(result, null);
  assert.equal(typeof result.score, "number");
  assert.equal(typeof result.actionsRemaining, "number");
  assert.equal(typeof result.completed, "boolean");
});
