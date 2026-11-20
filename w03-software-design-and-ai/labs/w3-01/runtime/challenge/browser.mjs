// FIXED browser consumer (challenge): imports the public entry. Do not change these imports.
import { createGame, browserRenderer } from './dist/index.js';

const game = createGame(browserRenderer);
const showHistory = () => { document.querySelector('#history').textContent = game.history().map((s) => JSON.stringify(s)).join('\n'); };
for (const button of document.querySelectorAll('[data-move]')) {
  button.addEventListener('click', () => { game.act(button.dataset.move); showHistory(); });
}
showHistory();
