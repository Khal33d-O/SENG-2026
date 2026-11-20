// Supplied page logic: renders confirmed state only. Busy/error is UI state, separate from
// the game's playing/won/lost status. No automatic state-changing retries.
import { getBoard, createSession, loadSession, sendAction, requestHint } from './client.js';

const $ = (selector) => document.querySelector(selector);
let board = null;
let confirmed = null; // the last envelope the server confirmed

function cellLabel(x, y, state) {
  if (board.walls.some((w) => w.x === x && w.y === y)) return 'wall';
  if (state && state.position.x === x && state.position.y === y) return 'you';
  const collected = state?.collected ?? [];
  if (board.treasures.some((t) => t.x === x && t.y === y && !collected.includes(t.id))) return 'T';
  if (board.exit.x === x && board.exit.y === y) return 'exit';
  return '';
}

function render() {
  const grid = $('#board');
  grid.replaceChildren();
  const s = confirmed?.state;
  if (board) {
    for (let y = 0; y < board.height; y += 1) {
      for (let x = 0; x < board.width; x += 1) {
        const cell = document.createElement('div');
        const label = cellLabel(x, y, s);
        cell.className = 'cell' + (label === 'wall' ? ' wall' : '') + (label === 'you' ? ' player' : '');
        cell.dataset.x = String(x);
        cell.dataset.y = String(y);
        cell.textContent = label === 'wall' ? '' : label;
        grid.append(cell);
      }
    }
  }
  const show = (field, value) => { $(`[data-field="${field}"]`).textContent = value; };
  show('position', s ? `(${s.position.x},${s.position.y})` : '-');
  show('movesRemaining', s ? String(s.movesRemaining) : '-');
  show('score', s ? String(s.score) : '-');
  show('collected', s ? (s.collected.length ? s.collected.join(', ') : 'none') : '-');
  show('status', s ? s.status : '-');
  if (confirmed) $('#session-id').value = confirmed.sessionId;
}

function setBusy(busy) {
  $('#busy').hidden = !busy;
  for (const button of document.querySelectorAll('button')) button.disabled = busy;
}

function showError(error) {
  const box = $('#error');
  if (!error) { box.hidden = true; box.textContent = ''; return; }
  box.hidden = false;
  box.textContent = `${error.code ?? 'ERROR'}: ${error.message}` + (error.requestId ? ` (request ${error.requestId})` : '');
}

/** Runs one request; confirmed state is assigned only after the awaited request succeeds. */
async function perform(work) {
  setBusy(true);
  showError(null);
  try {
    confirmed = await work();
  } catch (error) {
    showError(error); // recoverable: the previous confirmed state stays on screen
  } finally {
    setBusy(false);
    render();
  }
}

$('#new-game').addEventListener('click', () => perform(() => createSession()));
$('#load-session').addEventListener('click', () => perform(() => loadSession($('#session-id').value.trim())));
for (const button of document.querySelectorAll('[data-direction]')) {
  button.addEventListener('click', () => {
    if (!confirmed) { showError({ code: 'NO_SESSION', message: 'Choose New game or Load session first.' }); return; }
    const fail = $('#fail-next').checked;
    $('#fail-next').checked = false; // the failure hook applies to one request only
    perform(() => sendAction(confirmed.sessionId, button.dataset.direction, fail));
  });
}

$('#hint').addEventListener('click', async () => {
  if (!confirmed) { showError({ code: 'NO_SESSION', message: 'Choose New game or Load session first.' }); return; }
  const box = $('#hint-result');
  setBusy(true);
  showError(null);
  try {
    const advice = await requestHint(confirmed.sessionId); // advice only: confirmed state is not replaced
    box.hidden = false;
    box.dataset.source = advice.source;
    box.textContent = advice.hint
      ? `Hint (${advice.source}): ${advice.hint.action.direction} - ${advice.hint.explanation}`
      : `Hint (${advice.source}): none - no permitted move`;
  } catch (error) {
    box.hidden = true;
    showError(error);
  } finally {
    setBusy(false);
  }
});

getBoard().then((b) => { board = b; render(); }).catch(showError);
