// SUPPLIED complete demonstrations for demo.html?mode=working | mismatch | repaired.
// Worked Example 1 uses mode=working; Worked Example 2 pauses in the mismatch branch, then repairs it.
import { connectInputs, type InputSource } from "./inputs.js";
import { inspectBoard } from "./api.js";
import { applyMove, initialState, type Direction, type GameState } from "./rules.js";
import { identify, paint, text } from "./render.js";
import { newRunId, recordEvent, summary } from "./telemetry.js";

const mode = new URLSearchParams(location.search).get("mode") ?? "working";
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
    .then(() => text("telemetry", "Recorded locally"))
    .catch(() => text("telemetry", "Local recording unavailable"));
  if (mode === 'mismatch') {
    paint(before); // Mismatched example: passes the OLDER value to rendering
  } else {
    paint(after); // Working and corrected example
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

document.getElementById("mode")!.textContent = mode;
connectInputs(dispatch);
void inspectBoard();
document.getElementById("new-run")?.addEventListener("click", newRun);
document.getElementById("inspect-again")?.addEventListener("click", () => void inspectBoard());
newRun();
