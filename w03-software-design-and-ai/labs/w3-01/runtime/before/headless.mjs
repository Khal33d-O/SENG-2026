// Headless check (before): load the application factory in Node, supply a recording renderer, act East
// then South, and compare the recorded states with local history. Run from this folder after a build:
//   node headless.mjs
import { createGame } from './dist/application.js';

const recorded = [];
const recorder = { show: (state) => recorded.push(structuredClone(state)) };
const game = createGame(recorder);
game.act('east');
game.act('south');
console.log('recorded states:');
for (const state of recorded) console.log('  ' + JSON.stringify(state));
const same = JSON.stringify(recorded) === JSON.stringify(game.history());
console.log(`recorded states match local history: ${same}`);
console.log(`movesRemaining after East, South: ${recorded.at(-1).movesRemaining} (intended 5; the seeded defect gives 4)`);
