// Separate an object type from an object value. Prints: 2
let state: {
  score: number; actionsRemaining: number; completed: boolean;
} = {
  score: 4, actionsRemaining: 2, completed: false
};
console.log(state.actionsRemaining);
