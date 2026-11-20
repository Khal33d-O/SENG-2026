// Guided practice: an independent packing calculation (fixed bound).
// Predict the total and the first false comparison, then run: npm run practice
// Change the bound from 3 to 1 and then 0, rebuilding through the same command
// each time. Restore 3 afterwards so someone else can reproduce the start state.

let packed = 0;
for (let box = 0; box < 3; box = box + 1) {
  packed = packed + 4;
}
console.log(packed);
