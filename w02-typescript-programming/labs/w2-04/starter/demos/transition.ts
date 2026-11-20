// demos/transition.ts - Worked Example 2: trace ready -> start -> collect through callRule.
// Run with: npm run demo:transition
import { callRule } from "./caller.js";
import type { State } from "./rule.js";

const ready: State = { phase: "ready", target: 1, label: "quiet" };
const observer = ready; // a retained reference, like a history entry

const afterStart = callRule(ready, "start");
const afterCollect = callRule(afterStart, "collect");

console.log("before:        ", ready);
console.log("after start:   ", afterStart);
console.log("after collect: ", afterCollect);
console.log("observer still:", observer);
console.log("afterStart === ready:", afterStart === ready);
