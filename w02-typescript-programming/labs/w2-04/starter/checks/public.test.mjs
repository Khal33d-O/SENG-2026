// checks/public.test.mjs - npm test
// Runs the 11 public records in cases.mjs through all three entry points (33 checks),
// using node:test. Read the FIRST named failure and classify it before editing:
// missing field, discarded return, changed old object or unimplemented transition.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { cases } from "../cases.mjs";
import { entryPoints, checkRecord } from "./harness.mjs";

for (const entry of entryPoints) {
  describe(`entry point: ${entry.name}`, () => {
    for (const record of cases) {
      test(`${record.name} · ${entry.name}`, () => {
        const failure = checkRecord(record, entry);
        assert.equal(failure, null, failure ?? undefined);
      });
    }
  });
}
