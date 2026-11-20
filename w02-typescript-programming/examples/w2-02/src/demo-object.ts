// Worked Example 1: inspect a small game state. Prints: North gate 7 true, then 4
const tokenState = { label: "North gate", score: 4, active: true };
const earlierScore = tokenState.score;
tokenState.score = tokenState.score + 3;
console.log(tokenState.label, tokenState.score, tokenState.active);
console.log(earlierScore);
