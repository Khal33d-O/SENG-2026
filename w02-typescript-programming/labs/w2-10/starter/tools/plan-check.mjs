// SUPPLIED: `npm run plan` (after `npm run build`). Checks YOUR evidence in src/acceptance.ts against
// the plan in plan.json, through the same session composition the browser uses.
//   1. plan.json must be a supported plan within the 8-unit budget (any supported plan, not a letter);
//   2. completionActions, from a FRESH public start, must reach the fixed finish: status won at the exit
//      with every treasure collected;
//   3. invalidExample: its prefix builds a playing setup; its action must be rejected while playing and
//      leave EVERY state field unchanged.
// Exit code 0 only when all three hold. The trace is printed before the result: read it.
import { readFileSync } from "node:fs";
import { completionActions, invalidExample } from "../dist/acceptance.js";
import { describePlan, parsePlan } from "../dist/plans.js";
import { referenceBoard } from "../dist/reference.js";
import { formatState, startSession } from "../dist/session.js";

let failed = 0;
const fail = (message) => { failed += 1; console.log(`FAIL ${message}`); };
const pass = (message) => console.log(`PASS ${message}`);

let raw;
try {
  raw = JSON.parse(readFileSync(new URL("../plan.json", import.meta.url), "utf8"));
} catch (e) {
  console.log(`FAIL plan.json could not be read as JSON: ${e.message}`);
  process.exit(1);
}
const checked = parsePlan(raw);
if (!checked.ok) {
  console.log(`FAIL plan.json is not a supported plan: ${checked.error}`);
  process.exit(1);
}
const plan = checked.plan;
pass(`plan.json: ${describePlan(plan)}`);

// --- completion witness ---------------------------------------------------------------
console.log("\nCompletion witness (fresh session from the public start):");
if (completionActions.length === 0) {
  fail("completion witness is empty: add the public-start sequence to completionActions in src/acceptance.ts");
} else {
  const session = startSession(plan);
  console.log(`  start      ${formatState(session.current())}`);
  let last = null;
  for (const direction of completionActions) {
    const step = session.act(direction);
    last = step;
    console.log(`  ${String(step.sequence).padStart(2)} ${String(direction).padEnd(6)} ${step.accepted ? "accepted" : `rejected ${step.reason}`}`);
    console.log(`       shown    ${formatState(step.after)}`);
    console.log(`       retained ${formatState(step.retained)}`);
  }
  const final = last.after;
  const exit = referenceBoard.exit;
  const allCollected = referenceBoard.treasures.every((t) => final.collected.includes(t.id));
  if (final.status === "won" && final.position.x === exit.x && final.position.y === exit.y && allCollected) {
    pass(`completion: won at (${exit.x},${exit.y}) with every treasure collected`);
  } else {
    fail(`completion: expected won at (${exit.x},${exit.y}) with every treasure collected; final ${formatState(final)}`);
  }
}

// --- invalid-action example -----------------------------------------------------------
console.log("\nInvalid-action example (another fresh session):");
if (invalidExample.action === null) {
  fail("invalidExample.action is empty: give the prefix that builds the setup and the action to assess");
} else {
  const session = startSession(plan);
  for (const direction of invalidExample.prefix) session.act(direction);
  const before = session.current();
  console.log(`  Given      ${formatState(before)}  (prefix: ${invalidExample.prefix.join(", ") || "none"})`);
  const step = session.act(invalidExample.action);
  console.log(`  When       ${invalidExample.action} -> ${step.accepted ? "accepted" : `rejected ${step.reason}`}`);
  console.log(`  Then       ${formatState(step.after)}`);
  if (before.status !== "playing") fail("invalid example: the setup is not playing, so a terminal rejection cannot stand in for an invalid action");
  else if (step.accepted) fail(`invalid example: ${invalidExample.action} was ACCEPTED from this setup; choose a setup where it is invalid`);
  else if (JSON.stringify(step.after) !== JSON.stringify(before)) fail("invalid example: a rejected action changed the state");
  else pass(`invalid example: ${invalidExample.action} rejected (${step.reason}) while playing; every field unchanged`);
}

console.log(failed ? `\n${failed} plan check(s) failed` : "\nAll plan checks pass for this plan.json");
process.exit(failed ? 1 : 0);
