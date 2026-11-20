// The complete demonstrated class (supplied: use as supported comparison).
// One private field owns the current state; the rule and the copy helper are composed, not inherited.
import { applyMove, initialState, type Direction, type GameState } from "./rules.js";
import { copyState, type Component } from "./contract.js";

export class DemoComponent implements Component {
  // Native private field: code outside this class cannot read or write it.
  #state: GameState;

  // The constructor establishes this instance's starting state from a copy of the seed.
  // The default is used only when the caller omits the argument.
  constructor(initial: GameState = initialState()) {
    this.#state = copyState(initial);
  }

  // Delegates to the pure rule and retains its returned value in the field.
  move(direction: Direction): void {
    this.#state = applyMove(this.#state, direction);
  }

  // Returns an independent copy, never a writable reference to #state.
  snapshot(): GameState {
    return copyState(this.#state);
  }
}
