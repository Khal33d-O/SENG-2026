// Trace a counted loop. Prints: 6
let total = 0;
for (let count = 0; count < 3; count = count + 1) {
  total = total + 2;
}
console.log(total);
