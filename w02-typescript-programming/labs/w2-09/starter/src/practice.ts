// SUPPLIED guided practice (practice.html): a task counter using the same recorder.
// score represents the completed count. The snapshot sets the unused position and move fields
// to zero: they are explicit fields of this small teaching record, not task coordinates.
import { identify } from "./render.js";
import { newRunId, recordEvent, type Summary } from "./telemetry.js";

const runId = newRunId();
let sequence = 0;
let count = 0;

function snapshot(completed: number): Summary {
  return { x: 0, y: 0, moves: 0, score: completed, status: "playing" };
}

function show(): void {
  document.getElementById("count")!.textContent = String(count);
}

function completeTask(): void {
  const before = count;
  count = before + 1; // the counter update happens BEFORE the diagnostic promise settles
  show();
  const status = document.getElementById("telemetry")!;
  void recordEvent({ runId, sequence: ++sequence, action: "complete", source: "button",
    before: snapshot(before), after: snapshot(count) })
    .then(() => { status.textContent = "Recorded locally"; })
    .catch(() => { status.textContent = "Local recording unavailable"; });
}

identify(runId);
show();
document.getElementById("complete")?.addEventListener("click", completeTask);
