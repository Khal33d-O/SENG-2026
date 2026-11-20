// Object literals and property access. Prints: 4 then 7
let state = { score: 4, actionsRemaining: 2, completed: false };
console.log(state.score);
state.score = state.score + 3;
console.log(state.score);
