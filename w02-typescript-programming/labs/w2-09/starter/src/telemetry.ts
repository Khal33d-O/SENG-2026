// SUPPLIED event helper (LOCAL collector only; not Grafana or BP telemetry).
//
// recordEvent(event) sends copied scalar before/after values with run, sequence, action and source in
// ONE local POST to /api/events. Its promise fulfils when the collector accepts the record (2xx) and
// rejects otherwise. One attempt only: no retry queue, durable storage or exactly-once guarantee.
import type { GameState } from "./rules.js";
import type { InputSource } from "./inputs.js";

/** Copied scalar values; later actions cannot rewrite an earlier record. */
export interface Summary {
  readonly x: number;
  readonly y: number;
  readonly moves: number;
  readonly score: number;
  readonly status: string;
}

export interface AppEvent {
  readonly runId: string;
  readonly sequence: number;
  readonly action: string;
  readonly source: InputSource;
  readonly before: Summary;
  readonly after: Summary;
}

export function summary(state: GameState): Summary {
  return { x: state.position.x, y: state.position.y, moves: state.movesRemaining, score: state.score, status: state.status };
}

/** A new random run identifier, e.g. "run-3f9c2a1b". */
export function newRunId(): string {
  return `run-${crypto.randomUUID().slice(0, 8)}`;
}

export async function recordEvent(event: AppEvent): Promise<void> {
  const response = await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event), // serialised now: a copy
  });
  if (!response.ok) throw new Error(`Local collector rejected the record: HTTP ${response.status}`);
}
