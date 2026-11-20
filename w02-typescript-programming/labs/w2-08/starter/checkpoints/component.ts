// SUPPORTED CORE CHECKPOINT (supplied by `node tools.mjs checkpoint`).
// move is complete; the connection expression is still the ORIGINAL one, so the caller diagnosis remains.
import { applyMove, initialState, type Direction, type GameState } from "./rules.js";
import { copyState, type Component } from "./contract.js";
import { subscribe, type Port } from "./subscriber.js";

export class GameComponent implements Component {
  #state: GameState;

  // Supplied: copies the caller's seed so later edits to the seed cannot reach this instance.
  constructor(initial: GameState = initialState()) {
    this.#state = copyState(initial);
  }

  // Completed core operation: delegates to the rule and retains its result in the field.
  move(direction: Direction): void {
    this.#state = applyMove(this.#state, direction);
  }

  // Supplied: an independent copy of the owned state.
  snapshot(): GameState {
    return copyState(this.#state);
  }
}

// The connection expression: registers the chosen component's move operation with the subscriber.
// Tasks 2-3: compare this caller with a direct call before deciding what (if anything) to change here.
export function connect(component: Component): Port {
  return subscribe(component.move);
}
