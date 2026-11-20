// src/caller.ts - the caller module.
// The imports are already correct: a value import for the runtime function and a
// type-only import for the declarations used during checking.
import { transition } from "./rule.js";
import type { State, Action } from "./rule.js";

// The main entry point (for example, the code that receives a player's request).
export function callRule(state: State, action: Action): State {
  // Guided practice: return the rule result instead of the original argument.
  return state;
}

// A second code path that can request the same operation (for example, replaying a saved action).
export function callFromReplay(state: State, action: Action): State {
  // Guided practice: return the rule result instead of the original argument.
  return state;
}
