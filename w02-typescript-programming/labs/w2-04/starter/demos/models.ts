// demos/models.ts - Worked Example 1: three states that share target and label.
// Run with: npm run demo:models
import type { ReadyState, PlayingState, CompleteState } from "./rule.js";

const ready: ReadyState = { phase: "ready", target: 2, label: "quiet" };
const playing: PlayingState = { phase: "playing", target: 2, label: "quiet", progress: 1 };
const complete: CompleteState = { phase: "complete", target: 2, label: "quiet", finalScore: 2 };

console.log("ready:   ", ready);
console.log("playing: ", playing);
console.log("complete:", complete);

// Prediction check: reading `complete.progress` would not compile, because
// CompleteState records finalScore instead. Uncomment to see the diagnostic, then restore.
// console.log(complete.progress);
