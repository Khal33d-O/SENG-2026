// Guided practice check (supplied: do not edit).
import { test } from "node:test";
import assert from "node:assert/strict";
import { VisitCounter } from "../dist/practice.js";

test("practice: increment adds one to the receiving counter only", () => {
  const first = new VisitCounter(2);
  const second = new VisitCounter(7);
  first.increment();
  assert.equal(first.value(), 3);
  assert.equal(second.value(), 7);
});
