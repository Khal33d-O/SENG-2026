import type { State } from './rules-seeded.js';

// Local history service: retains COPIED states in memory for this process only (not a network database).
const snapshots: State[] = [];

export function recordSnapshot(state: State): void {
  snapshots.push(structuredClone(state));
}

export function history(): State[] {
  return snapshots.map((s) => structuredClone(s));
}
