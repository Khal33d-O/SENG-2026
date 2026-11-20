// Knowledge check Question 3 (paper trace first). Prints: printed is 1
let sheets = 2;
let printed = 0;
for (let count = 0; count < 2; count = count + 1) {
  if (sheets > 0) {
    sheets = sheets - 1;
    if (sheets > 0) printed = printed + 1;
  }
}
console.log("printed is", printed);
