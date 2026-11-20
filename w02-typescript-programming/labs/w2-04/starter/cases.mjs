// cases.mjs - the PUBLIC expected outcomes for this lab (11 phase/action cases).
// Every record is checked through transition, callRule and callFromReplay (npm test).
// Do NOT edit these records to match an implementation: they describe the agreed contract.
//
// Record format:
//   name    - a short description used in test output
//   before  - the input state (the checker passes a fresh copy and keeps a reference to it)
//   action  - "start" | "collect" | "retry"
//   after   - the exact expected returned object (every property, no extras)
//   same    - true when the result must be the SAME object as the input (an ignored pair),
//             false when it must be a NEW object (an allowed transition)
// For every record the retained input must still show its original values after the call.

export const cases = [
  {
    name: "C01 ready/start begins a round",
    before: { phase: "ready", target: 2, label: "quiet" },
    action: "start",
    after: { phase: "playing", target: 2, label: "quiet", progress: 0 },
    same: false,
  },
  {
    name: "C02 ready/collect is ignored",
    before: { phase: "ready", target: 3, label: "quiet" },
    action: "collect",
    after: { phase: "ready", target: 3, label: "quiet" },
    same: true,
  },
  {
    name: "C03 ready/retry is ignored",
    before: { phase: "ready", target: 2, label: "quiet" },
    action: "retry",
    after: { phase: "ready", target: 2, label: "quiet" },
    same: true,
  },
  {
    name: "C04 playing/start is ignored",
    before: { phase: "playing", target: 3, label: "quiet", progress: 1 },
    action: "start",
    after: { phase: "playing", target: 3, label: "quiet", progress: 1 },
    same: true,
  },
  {
    name: "C05 playing/collect below the target",
    before: { phase: "playing", target: 3, label: "quiet", progress: 1 },
    action: "collect",
    after: { phase: "playing", target: 3, label: "quiet", progress: 2 },
    same: false,
  },
  {
    name: "C06 playing/collect reaching the target",
    before: { phase: "playing", target: 2, label: "quiet", progress: 1 },
    action: "collect",
    after: { phase: "complete", target: 2, label: "quiet", finalScore: 2 },
    same: false,
  },
  {
    name: "C07 playing/collect reaching target one keeps an empty label",
    before: { phase: "playing", target: 1, label: "", progress: 0 },
    action: "collect",
    after: { phase: "complete", target: 1, label: "", finalScore: 1 },
    same: false,
  },
  {
    name: "C08 playing/retry is ignored",
    before: { phase: "playing", target: 3, label: "quiet", progress: 1 },
    action: "retry",
    after: { phase: "playing", target: 3, label: "quiet", progress: 1 },
    same: true,
  },
  {
    name: "C09 complete/start is ignored",
    before: { phase: "complete", target: 2, label: "quiet", finalScore: 2 },
    action: "start",
    after: { phase: "complete", target: 2, label: "quiet", finalScore: 2 },
    same: true,
  },
  {
    name: "C10 complete/collect is ignored",
    before: { phase: "complete", target: 2, label: "quiet", finalScore: 2 },
    action: "collect",
    after: { phase: "complete", target: 2, label: "quiet", finalScore: 2 },
    same: true,
  },
  {
    name: "C11 complete/retry restarts with the caller's settings",
    before: { phase: "complete", target: 2, label: "quiet", finalScore: 2 },
    action: "retry",
    after: { phase: "playing", target: 2, label: "quiet", progress: 0 },
    same: false,
  },
];
