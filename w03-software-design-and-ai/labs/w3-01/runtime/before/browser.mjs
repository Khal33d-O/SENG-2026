// Existing browser consumer (before). It supplies the concrete DOM renderer.
import { createGame } from './dist/application.js';
import { browserRenderer } from './dist/browser-renderer.js';

const game = createGame(browserRenderer);
const showHistory = () => { document.querySelector('#history').textContent = game.history().map((s) => JSON.stringify(s)).join('\n'); };
for (const button of document.querySelectorAll('[data-move]')) {
  button.addEventListener('click', () => { game.act(button.dataset.move); showHistory(); });
}
showHistory();
