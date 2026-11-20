// SUPPLIED - do not edit. The keyboard guard and key-to-direction mapping.
import type { Direction } from "./rules.js";

// True when a keydown must not become a game action:
// - repeated keydown events from holding a key down,
// - IME composition,
// - selected modifier combinations (Alt, Ctrl, Meta), so browser shortcuts keep working,
// - any event inside an editable control. isContentEditable is the *effective*
//   editability, so a nested span inside a contenteditable note also counts.
export function shouldIgnoreGameKey(event: KeyboardEvent): boolean {
  if (event.repeat || event.isComposing) return true;
  if (event.altKey || event.ctrlKey || event.metaKey) return true;
  const target = event.target;
  if (target instanceof HTMLElement) {
    if (target.isContentEditable) return true;
    if (target.closest("input, textarea, select") !== null) return true;
  }
  return false;
}

// ArrowRight is a browser key value; "east" is a domain value. Other keys map to null.
export function directionForKey(key: string): Direction | null {
  switch (key) {
    case "ArrowUp":
      return "north";
    case "ArrowRight":
      return "east";
    case "ArrowDown":
      return "south";
    case "ArrowLeft":
      return "west";
    default:
      return null;
  }
}
