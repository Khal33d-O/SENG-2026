// FIXED public headless consumer (challenge): must import the SAME public entry as the browser.
// Do not change this import. Run from this folder after a build:  node headless-public.mjs
import { createGame } from './dist/index.js';

const recorded = [];
const recorder = { show: (state) => recorded.push(structuredClone(state)) };
const game = createGame(recorder);
game.act('east');
game.act('south');
console.log('recorded states:');
for (const state of recorded) console.log('  ' + JSON.stringify(state));
console.log(`recorded states match local history: ${JSON.stringify(recorded) === JSON.stringify(game.history())}`);
console.log(`movesRemaining after East, South: ${recorded.at(-1).movesRemaining} (intended 5; the seeded defect gives 4)`);
