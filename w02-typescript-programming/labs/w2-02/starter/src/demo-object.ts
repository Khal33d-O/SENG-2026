// Worked Example 1: inspect a small game state (npm run demo:object).
// earlierScore captures a primitive number; the later property write changes
// only the object's score property.

const tokenState = { label: "North gate", score: 4, active: true };
const earlierScore = tokenState.score;
tokenState.score = tokenState.score + 3;
console.log(tokenState.label, tokenState.score, tokenState.active);
console.log(earlierScore);
