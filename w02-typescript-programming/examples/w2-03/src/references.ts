// Two names, one object: the observer sees the later score.
const original = { score: 6 };
const observer = original;
original.score = 9;
console.log(observer.score); // 9
