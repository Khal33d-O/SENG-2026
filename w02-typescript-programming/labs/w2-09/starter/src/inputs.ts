// SUPPLIED input connector. connectInputs(dispatch) registers the four direction buttons and the
// permitted arrow keys ONCE. Later callbacks call dispatch(direction, source).
// The keyboard guard leaves editing controls and repeated keys outside game dispatch.
import type { Direction } from "./rules.js";

export type InputSource = "button" | "key";
export type Dispatch = (direction: Direction, source: InputSource) => void;

const KEYS: Readonly<Record<string, Direction>> = {
  ArrowUp: "north",
  ArrowRight: "east",
  ArrowDown: "south",
  ArrowLeft: "west",
};

function isEditing(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

let connected = false;

export function connectInputs(dispatch: Dispatch): void {
  if (connected) throw new Error("connectInputs was called more than once; call it once during startup");
  connected = true;
  for (const button of document.querySelectorAll<HTMLButtonElement>("button[data-direction]")) {
    const direction = button.dataset.direction as Direction;
    button.addEventListener("click", () => dispatch(direction, "button"));
  }
  document.addEventListener("keydown", (event) => {
    if (event.repeat || isEditing(event.target)) return;
    const direction = KEYS[event.key];
    if (direction === undefined) return;
    event.preventDefault();
    dispatch(direction, "key");
  });
}
