// Retrieve Monday's object and function.
const before = { progress: 1 };
const observer = before;
function advance(input: { progress: number }) {
  return { progress: input.progress + 1 };
}
const after = advance(before);
console.log(after.progress, observer.progress, after === before); // 2 1 false
