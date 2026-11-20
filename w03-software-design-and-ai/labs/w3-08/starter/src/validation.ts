// YOU OWN validHint and fallbackHint (W3.08). The primitive checks and constants are supplied.
// Contract: starter/fixtures/schema.json. Keep the 160-unit policy, extra-field policy and null no-action.
import type { Envelope, Hint, MoveAction } from './contracts.js';
import { DIRECTION_ORDER } from './rules.js';

export const MAX_EXPLANATION_UNITS = 160; // JavaScript (UTF-16) string length, not displayed symbols
export const FALLBACK_EXPLANATION = 'A permitted next move.';

// Primitive record check (supplied): excludes null and arrays before nested property access.
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Supplied direction check: a known direction value. Knowing the value is not the same as permitted.
export function isDirection(value: unknown): value is MoveAction['direction'] {
  return typeof value === 'string' && (DIRECTION_ORDER as readonly string[]).includes(value);
}

// TODO(W3.08): accept only a non-null, non-array record whose action is a non-null, non-array record
// with type 'move' and a known direction, whose explanation is a string that is nonempty after trimming
// and no longer than MAX_EXPLANATION_UNITS, AND whose direction is in the independently derived list.
export function validHint(candidate: unknown, allowed: readonly MoveAction[]): candidate is Hint {
  void candidate;
  void allowed;
  return false; // starter: the guard rejects everything
}

// TODO(W3.08): return the first permitted action (supplied N, E, S, W order) with FALLBACK_EXPLANATION,
// or a null hint when the list is empty; source 'fallback' and the current request identifier.
export function fallbackHint(allowed: readonly MoveAction[], requestId: string): Envelope {
  void allowed;
  return { hint: null, source: 'fallback', requestId }; // starter: incomplete
}
