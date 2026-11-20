// A function returns a value to its caller.
function remaining(total: number, used: number): number {
  return total - used;
}
const available = remaining(8, 3);
console.log(available); // 5
