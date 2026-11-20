// Terminal event for one hint request. YOU OWN THIS FILE (W3.09).
// Emit exactly one event per completed request with ONLY: requestId, latencyMs, outcome, fallback.
// latencyMs is finishedMs - startedMs (same supplied clock: handler entry -> validation/fallback done).
// Do not serialize the facts object, the request, the response, an error or explanation text.
import type { Envelope, Outcome } from './contracts.js';

export interface Facts {
  requestId: string;
  startedMs: number;   // supplied clock at handler entry
  finishedMs: number;  // supplied clock when validation or fallback selection finished
  outcome: Outcome;
  result: Envelope;    // supplied so fallback use can be derived; never copied into the event
}

export interface Event {
  requestId: string;
  latencyMs: number;
  outcome: Outcome;
  fallback: boolean;
}

export function recordHint(facts: Facts,
  emit: (event: Event) => void): void {
  // TODO(W3.09): construct the event from the permitted fields and call emit once.
  void facts;
  void emit;
}
