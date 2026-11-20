// Arrays: index, length and push into a separate array.
const costs: number[] = [2, 5, 3];
const firstCost = costs[0];
const count = costs.length;
const selected: number[] = [];
selected.push(firstCost);
console.log(firstCost, count, selected, costs); // 2 3 [ 2 ] [ 2, 5, 3 ]
