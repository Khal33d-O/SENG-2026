// src/rule.ts - the rule module.
// It owns the state model, the action union and the transition calculation.
// Callers import these declarations instead of keeping their own copies.

export interface ReadyState {
  phase: "ready";
  target: number;
  label: string;
}

export interface PlayingState {
  phase: "playing";
  target: number;
  label: string;
  progress: number;
}

export interface CompleteState {
  phase: "complete";
  target: number;
  label: string;
  // Guided practice: add the required numeric final score here.
}

export type State = ReadyState | PlayingState | CompleteState;

export type Action = "start" | "collect";

// Receives a before-state and an action; returns the after-state.
// An allowed transition returns a NEW object. An ignored pair returns the original object.
export function transition(state: State, action: Action): State {
  if (state.phase === "ready" && action === "start") {
    return { phase: "playing", target: state.target, label: state.label, progress: 0 };
  }

  // Guided practice: reconstruct the playing/collect branch from demos/rule.ts here.

  // Every other pair is ignored: return the exact original object.
  return state;
}
