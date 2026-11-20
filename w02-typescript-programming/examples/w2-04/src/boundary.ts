// Worked Example 2 shape: imports and a caller that returns the rule's result.
import { transition } from "./rule.js";
import type { State, Action } from "./rule.js";

export function callRule(state: State, action: Action): State {
  return transition(state, action);
}

const before: State = { phase: "ready", target: 1, label: "quiet" };
const afterStart = callRule(before, "start");
console.log(afterStart, callRule(afterStart, "collect"), before);
