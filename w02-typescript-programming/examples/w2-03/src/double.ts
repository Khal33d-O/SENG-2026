// One call's result becomes another call's argument.
function double(value: number): number {
  return value * 2;
}
const first = double(4);
const second = double(first);
console.log(first, second); // 8 16
