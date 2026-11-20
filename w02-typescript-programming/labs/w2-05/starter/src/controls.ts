// YOUR FILE - the browser adapter. This is the only file you edit in W2.05.
//
// Path to complete: input event -> callback -> direction -> dispatchMove
//   -> applyMove (supplied rule) -> retained state -> render (text and tile classes).
import { applyMove, initialState, type Direction, type GameState } from "./rules.js";
import { getButtonBindings, renderBoard, requireButton, requireElement } from "./view.js";
import { directionForKey, shouldIgnoreGameKey } from "./keyboard.js";
import { connectSupportControls } from "./support.js";

// A replaceable variable holding the retained state; starts from a fresh object.
let state: GameState = initialState();

// Checked references to supplied markup.
const statusElement = requireElement("#status");
const buttonBindings = getButtonBindings();
const eastButton = requireButton("#east");

// Describes the retained state. It never decides whether a move is legal.
function render(): void {
  renderBoard(state);
  statusElement.textContent = state.status + ": " + state.movesRemaining + " moves left";
  // Task 4: decide when this feedback should also say "Last move".
}

// Task 2: the one owner of the action calculation.
// Call the supplied rule once, retain its result in `state`, then refresh the view.
function dispatchMove(direction: Direction): void {
  // TODO (Task 2)
}

// TEMPORARY guided East listener (Task 1). Remove it when you connect the
// shared binding loop in Tasks 2-3, otherwise one click runs two calculations.
eastButton.addEventListener("click", () => {
  state = applyMove(state, "east");
  // Guided completion: call the existing render function here.
});

// Task 3: register a click callback on each binding.element that sends
// binding.direction to dispatchMove when the click arrives (not during setup).
for (const binding of buttonBindings) {
  // TODO (Task 3)
}

// Guarded keyboard route. Keep the early returns and the preventDefault() placement.
document.addEventListener("keydown", (event: KeyboardEvent) => {
  if (shouldIgnoreGameKey(event)) return;
  const direction = directionForKey(event.key);
  if (direction === null) return;
  event.preventDefault();
  // TODO (Task 3): complete the final connection here.
});

// SUPPLIED - do not change: New game, Final approach and Read diagnostics.
connectSupportControls({
  getState: () => state,
  replaceState: (next) => {
    state = next;
    render();
  },
});

// Startup: listeners are registered and the initial view is drawn with zero rule calls.
render();
