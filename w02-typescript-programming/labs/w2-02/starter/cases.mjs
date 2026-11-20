// Public cases for the W2.02 state preview. READ ONLY: do not change the
// expected outcomes. The tests, `npm run show` and the browser report all
// read this list. Each runner call builds a fresh `initial` object from these
// values, so one case cannot affect another.
//
// Contract (from the lab brief):
//   - each permitted action adds `points` to score and consumes one action;
//   - process as many requested actions as capacity permits; never spend
//     below zero, score an unpermitted action or discard a permitted last one;
//   - completed is true exactly when no capacity remains;
//   - return a fresh object every call and leave the original unchanged.

export const cases = [
  {
    name: "zero-request",
    note: "No work requested; capacity remains, so not completed.",
    initial: { score: 5, actionsRemaining: 2, completed: false },
    requested: 0,
    points: 3,
    expected: { score: 5, actionsRemaining: 2, completed: false },
  },
  {
    name: "zero-capacity",
    note: "Work requested but no capacity: no score-bearing action.",
    initial: { score: 9, actionsRemaining: 0, completed: true },
    requested: 3,
    points: 2,
    expected: { score: 9, actionsRemaining: 0, completed: true },
  },
  {
    name: "one",
    note: "One requested action with spare capacity.",
    initial: { score: 4, actionsRemaining: 3, completed: false },
    requested: 1,
    points: 2,
    expected: { score: 6, actionsRemaining: 2, completed: false },
  },
  {
    name: "multiple",
    note: "Several requested actions, fewer than capacity.",
    initial: { score: 0, actionsRemaining: 6, completed: false },
    requested: 3,
    points: 4,
    expected: { score: 12, actionsRemaining: 3, completed: false },
  },
  {
    name: "exact-capacity",
    note: "Requested equals capacity: the last permitted action must count.",
    initial: { score: 2, actionsRemaining: 4, completed: false },
    requested: 4,
    points: 3,
    expected: { score: 14, actionsRemaining: 0, completed: true },
  },
  {
    name: "over-request",
    note: "Requested exceeds capacity: stop when capacity runs out.",
    initial: { score: 1, actionsRemaining: 2, completed: false },
    requested: 5,
    points: 5,
    expected: { score: 11, actionsRemaining: 0, completed: true },
  },
  {
    name: "last-action",
    note: "One available action and several requested (Hint 3).",
    initial: { score: 3, actionsRemaining: 1, completed: false },
    requested: 4,
    points: 5,
    expected: { score: 8, actionsRemaining: 0, completed: true },
  },
];

// Builds a fresh initial object for one call (supplied runner helper).
export function freshInitial(testCase) {
  return {
    score: testCase.initial.score,
    actionsRemaining: testCase.initial.actionsRemaining,
    completed: testCase.initial.completed,
  };
}
