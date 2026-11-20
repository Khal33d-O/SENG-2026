// demos/caller.ts - Worked Example 2: export, import and trace one transition.
import { transition } from "./rule.js";
import type { State, Action } from "./rule.js";

export function callRule(state: State, action: Action): State {
  return transition(state, action);
}
