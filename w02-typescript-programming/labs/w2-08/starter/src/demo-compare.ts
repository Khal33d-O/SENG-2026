// Worked Example 1 (npm run demo:compare): the function adapter and the demonstration class
// each request East from the reference start, then the scalar receiver example runs.
import { initialState } from "./rules.js";
import { createHolder, moveHolder, snapshotHolder } from "./before.js";
import { DemoComponent } from "./demo-class.js";
import { north, south } from "./receiver.js";

const holder = createHolder(initialState());
moveHolder(holder, "east");
const fromFunctions = snapshotHolder(holder);

const game = new DemoComponent(initialState());
game.move("east");
const fromClass = game.snapshot();

console.log("functions:", JSON.stringify(fromFunctions));
console.log("class:    ", JSON.stringify(fromClass));
console.log("equal observations:", JSON.stringify(fromFunctions) === JSON.stringify(fromClass));

console.log("north.describe() ->", north.describe());
console.log("south.describe() ->", south.describe());
