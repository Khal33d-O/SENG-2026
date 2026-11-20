// Worked Example 2: a one-action update with a guard (npm run demo:boundary).
// Each run creates its own object. This example deliberately updates
// properties in place; it has no preview observer to preserve.

// Run 1: start from two remaining actions.
const fromTwo = { score: 4, actionsRemaining: 2 };
if (fromTwo.actionsRemaining > 0) {
  fromTwo.score = fromTwo.score + 2;
  fromTwo.actionsRemaining = fromTwo.actionsRemaining - 1;
}
console.log(fromTwo.score, fromTwo.actionsRemaining);

// Run 2: start from zero remaining actions. The condition is false before
// either assignment, so neither property changes.
const state = { score: 4, actionsRemaining: 0 };
if (state.actionsRemaining > 0) {
  state.score = state.score + 2;
  state.actionsRemaining = state.actionsRemaining - 1;
}
console.log(state.score, state.actionsRemaining);
