// Worked Example 2: update a state with no remaining actions. Prints: 4 0 (change 0 to 2 for 6 1)
const state = { score: 4, actionsRemaining: 0 };
if (state.actionsRemaining > 0) {
  state.score = state.score + 2;
  state.actionsRemaining = state.actionsRemaining - 1;
}
console.log(state.score, state.actionsRemaining);
