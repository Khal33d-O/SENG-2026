// CONNECTED CHECKPOINT (support only): the taught integrations (inputs, reference check, event call)
// are complete, but the seeded display mismatch is deliberately UNRESOLVED. Compiling and recording
// events does not demonstrate that you diagnosed or repaired the remaining behaviour.
//
// Supplied operations:
//   connectInputs(dispatch)   registers buttons and permitted keys ONCE; callbacks give (direction, source)
//   applyMove(before, action) returns the next state (a rejection preserves every field)
//   paint(state)              describes the supplied state (board cells, position, moves, score, status)
//   inspectBoard()            checks the reference API and reports in its own region
//   recordEvent(event)        one local POST of { runId, sequence, action, source, before, after }
//
// STARTER: the page renders the starting game, but input registration, the reference check and the
// event call are unfinished (Task 2), and the display path contains the seeded mismatch you will
// diagnose in Tasks 3-4. Keep the rules, renderer, helper and API supplied.
import { connectInputs, type InputSource } from "./inputs.js";
import { inspectBoard } from "./api.js";
import { applyMove, initialState, type Direction, type GameState } from "./rules.js";
import { identify, paint, text } from "./render.js";
import { newRunId, recordEvent, summary } from "./telemetry.js";

let state: GameState = initialState();
let runId = "";
let sequence = 0;

function dispatch(action: Direction, source: InputSource): void {
  const before = state;
  const after = applyMove(before, action);
  state = after;

  const event = { runId, sequence: ++sequence, action, source,
    before: summary(before), after: summary(after) };
  void recordEvent(event)
    .then(() => text('telemetry', 'Recorded locally'))
    .catch(() => text('telemetry', 'Local recording unavailable'));

  // Display update ("only repaint when the row changes" - supplied by a teammate).
  if (after.position.y !== before.position.y) {
    paint(after);
  }
}

function newRun(): void {
  runId = newRunId();
  sequence = 0;
  identify(runId);
  state = initialState();
  paint(state);
  text("telemetry", "No event recorded in this run");
}

function start(): void {
  connectInputs(dispatch);
  void inspectBoard();
  document.getElementById("new-run")?.addEventListener("click", newRun);
  document.getElementById("inspect-again")?.addEventListener("click", () => void inspectBoard());
  newRun();
}

start();
