// checks/baseline.mjs - npm run check:baseline
// Checks only what the starter already supplies: the ready/start branch, one ignored
// action and that both caller functions can be imported and called. It does NOT
// establish the completed contract (see npm run practice and npm test).
import { entryPoints, checkRecord } from "./harness.mjs";

const failures = [];
const [direct, main, replay] = entryPoints;

const records = [
  {
    name: "baseline ready/start",
    before: { phase: "ready", target: 2, label: "quiet" },
    action: "start",
    after: { phase: "playing", target: 2, label: "quiet", progress: 0 },
    same: false,
  },
  {
    name: "baseline ignored action",
    before: { phase: "ready", target: 2, label: "quiet" },
    action: "collect",
    after: { phase: "ready", target: 2, label: "quiet" },
    same: true,
  },
];
for (const record of records) {
  const failure = checkRecord(record, direct);
  if (failure) failures.push(failure);
}

for (const entry of [main, replay]) {
  if (typeof entry.call !== "function") {
    failures.push(`${entry.name} is not an exported function of dist/src/caller.js`);
    continue;
  }
  try {
    entry.call({ phase: "ready", target: 2, label: "quiet" }, "start");
  } catch (error) {
    failures.push(`${entry.name} threw when called: ${error?.message ?? error}`);
  }
}

if (failures.length > 0) {
  for (const failure of failures) console.log(`FAIL ${failure}`);
  process.exitCode = 1;
} else {
  console.log("PASS baseline: ready/start, ignored action and two callable imports");
}
