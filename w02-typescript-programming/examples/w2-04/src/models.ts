// Worked Example 1: Model three states and an action union, plus narrowing on phase.
interface ReadyState {
  phase: "ready"; target: number; label: string;
}
interface PlayingState {
  phase: "playing"; target: number; label: string;
  progress: number;
}
interface CompleteState {
  phase: "complete"; target: number; label: string;
  finalScore: number;
}
type State = ReadyState | PlayingState | CompleteState;
type Action = "start" | "collect";

function show(state: State): void {
  if (state.phase === "playing") {
    console.log(state.progress);
  }
}

const ready: State = { phase: "ready", target: 2, label: "quiet" };
const playing: State = { phase: "playing", target: 2, label: "quiet", progress: 1 };
const complete: State = { phase: "complete", target: 2, label: "quiet", finalScore: 2 };
const next: Action = "collect";
console.log(ready, playing, complete, next);
show(playing); // 1
show(complete); // prints nothing: progress is not read outside the playing branch
