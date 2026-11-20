// checks/practice.mjs - npm run practice (guided floor)
// A playing round at target two, progress one, receives collect through BOTH callers.
// Expected: a completed object with target two, label quiet and final score two,
// while the original playing object still has progress one.
import { entryPoints, checkRecord } from "./harness.mjs";

const record = {
  name: "guided floor playing/collect reaching target",
  before: { phase: "playing", target: 2, label: "quiet", progress: 1 },
  action: "collect",
  after: { phase: "complete", target: 2, label: "quiet", finalScore: 2 },
  same: false,
};

const failures = entryPoints
  .filter((entry) => entry.name !== "transition")
  .map((entry) => checkRecord(record, entry))
  .filter((failure) => failure !== null);

if (failures.length > 0) {
  console.log("FAIL guided floor: expected completed object returned across the boundary");
  for (const failure of failures) console.log(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log("PASS guided floor: completed score returned across boundary; original retained.");
}
