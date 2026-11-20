// The original explicit-state functions and a compatible adapter (supplied: read and preserve).
// Ownership is visible in the parameter list: each function receives the holder it operates on.
import { applyMove, type Direction, type GameState } from "./rules.js";
import { copyState, type Component } from "./contract.js";

export interface Holder {
  current: GameState;
}

// Creating a holder copies the caller's seed, so later edits to the seed cannot reach it.
export function createHolder(initial: GameState): Holder {
  return { current: copyState(initial) };
}

// The holder line that owns the current value: holder.current = <rule result>.
export function moveHolder(holder: Holder, direction: Direction): void {
  holder.current = applyMove(holder.current, direction);
}

// An observation is an independent copy of the owned value.
export function snapshotHolder(holder: Holder): GameState {
  return copyState(holder.current);
}

// Adapter: the same functions exposed through the Component interface.
// Its operations are arrow functions that close over `holder`, so they do not depend on `this`.
export function createFunctionComponent(initial: GameState): Component {
  const holder = createHolder(initial);
  return {
    move: (direction: Direction) => moveHolder(holder, direction),
    snapshot: () => snapshotHolder(holder),
  };
}
