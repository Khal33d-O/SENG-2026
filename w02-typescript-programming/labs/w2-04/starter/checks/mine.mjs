// checks/mine.mjs - npm run check:mine
// Runs YOUR decisions from my-cases.mjs through transition, callRule and callFromReplay.
// A pass shows your expected values are consistent with the implementation. It does not show
// that your inputs distinguish the rival proposals: your `reason` and evidence.md do that.
import { decisions } from "../my-cases.mjs";
import { cases } from "../cases.mjs";
import { entryPoints, checkRecord, sameValues } from "./harness.mjs";

const problems = [];
const isPositiveInteger = (n) => Number.isInteger(n) && n > 0;

// Inputs must satisfy the outcome contract; arbitrary external data is out of scope.
function contractProblem(state) {
  if (typeof state !== "object" || state === null) return "before must be a state object";
  if (!isPositiveInteger(state.target)) return "target must be a positive integer";
  if (typeof state.label !== "string") return "label must be text (it may be empty)";
  if (state.phase === "ready") {
    return Object.keys(state).length === 3 ? null : "a ready state has only phase, target and label";
  }
  if (state.phase === "playing") {
    if (!Number.isInteger(state.progress) || state.progress < 0 || state.progress > state.target - 1) {
      return "playing progress must be an integer from 0 to target - 1";
    }
    return Object.keys(state).length === 4 ? null : "a playing state has only phase, target, label and progress";
  }
  if (state.phase === "complete") {
    if (state.finalScore !== state.target) return "complete finalScore must equal target";
    return Object.keys(state).length === 4 ? null : "a complete state has only phase, target, label and finalScore";
  }
  return "phase must be ready, playing or complete";
}

if (!Array.isArray(decisions) || decisions.length < 2) {
  const count = Array.isArray(decisions) ? decisions.length : 0;
  problems.push(`my-cases.mjs has ${count} decision(s); add two fresh records to the decisions array`);
} else {
  decisions.forEach((decision, index) => {
    const label = decision?.name ? `"${decision.name}"` : `decision ${index + 1}`;
    for (const field of ["name", "before", "action", "after", "same", "reason"]) {
      if (decision?.[field] === undefined) problems.push(`${label}: missing field "${field}"`);
    }
    if (decision?.same !== undefined && typeof decision.same !== "boolean") {
      problems.push(`${label}: same must be true or false`);
    }
    if (typeof decision?.reason === "string" && decision.reason.trim().length < 20) {
      problems.push(`${label}: reason must name the rival, predict its result and explain the difference`);
    }
    if (!["start", "collect", "retry"].includes(decision?.action)) {
      problems.push(`${label}: action must be start, collect or retry`);
    }
    const invalid = contractProblem(decision?.before);
    if (invalid) problems.push(`${label}: before is outside the outcome contract (${invalid})`);
    const copy = cases.find((c) => sameValues(c.before, decision?.before) && c.action === decision?.action);
    if (copy) problems.push(`${label}: copies the public record "${copy.name}"; choose a fresh input`);
  });
  const [first, second] = decisions;
  if (sameValues(first?.before, second?.before) && first?.action === second?.action) {
    problems.push("the two decisions use the same input and action; choose two different cases");
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.log(`FAIL check:mine: ${problem}`);
  process.exitCode = 1;
} else {
  let failed = 0;
  for (const decision of decisions) {
    for (const entry of entryPoints) {
      const failure = checkRecord(decision, entry);
      if (failure) {
        failed += 1;
        console.log(`FAIL ${failure}`);
      } else {
        console.log(`PASS ${decision.name} via ${entry.name}`);
      }
    }
  }
  const total = decisions.length * entryPoints.length;
  console.log(`${total - failed} of ${total} learner prediction checks passed.`);
  if (failed > 0) {
    console.log("A failing prediction is still evidence: record the wrong assumption and the correction in evidence.md.");
    process.exitCode = 1;
  } else {
    console.log("Now defend in evidence.md what each rival proposal would return on these inputs.");
  }
}
