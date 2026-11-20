// Component interface and bounded copy helper (supplied: read and preserve).
import type { Direction, GameState } from "./rules.js";

// A structural interface: any value with compatible move and snapshot operations satisfies it.
// move returns nothing useful to the caller; observation belongs to snapshot.
export interface Component {
  move(direction: Direction): void;
  snapshot(): GameState;
}

// Copies the two nested mutable members this component promises to keep independent
// (position and collectedTreasureIds) plus the scalar fields.
// It is not a general deep clone, and it performs no movement.
export function copyState(state: GameState): GameState {
  return {
    position: { x: state.position.x, y: state.position.y },
    movesRemaining: state.movesRemaining,
    score: state.score,
    collectedTreasureIds: [...state.collectedTreasureIds],
    status: state.status,
  };
}
