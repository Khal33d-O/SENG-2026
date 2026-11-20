// YOUR component (owned by you): complete move, then repair the bounded connection.
import { applyMove, initialState, type Direction, type GameState } from "./rules.js";
import { copyState, type Component } from "./contract.js";
import { subscribe, type Port } from "./subscriber.js";

export class GameComponent implements Component {
  #state: GameState;

  // Supplied: copies the caller's seed so later edits to the seed cannot reach this instance.
  constructor(initial: GameState = initialState()) {
    this.#state = copyState(initial);
  }

  // Task 1: complete this operation.
  // Use the supplied field, the applyMove rule and the direction parameter.
  // Keep the signature. Do not duplicate the movement calculation or add rendering.
  move(direction: Direction): void {
    // TODO (Task 1): retain the rule's result for this instance.
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
