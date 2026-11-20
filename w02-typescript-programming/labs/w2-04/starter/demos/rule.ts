// demos/rule.ts - the complete ORDINARY rule shown in Worked Examples 1 and 2.
// It handles ready/start and playing/collect only. It has no retry action.

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
  finalScore: number;
}

export type State = ReadyState | PlayingState | CompleteState;

export type Action = "start" | "collect";

export function transition(state: State, action: Action): State {
  // Ready branch: construct a new playing state at progress zero.
  if (state.phase === "ready" && action === "start") {
    return { phase: "playing", target: state.target, label: state.label, progress: 0 };
  }

  // Playing branch: the phase check narrows `state`, so `state.progress` can be read here.
  if (state.phase === "playing" && action === "collect") {
    const nextProgress = state.progress + 1;
    if (nextProgress >= state.target) {
      return { phase: "complete", target: state.target, label: state.label, finalScore: state.target };
    }
    return { phase: "playing", target: state.target, label: state.label, progress: nextProgress };
  }

  // Any other pair in this demo: the same input object.
  return state;
}
