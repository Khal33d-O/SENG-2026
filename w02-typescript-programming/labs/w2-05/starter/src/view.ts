// SUPPLIED - do not edit. Checked element selection and the board renderer.
import type { Direction, GameState } from "./rules.js";

// querySelector returns the first match or null. A type annotation cannot create a
// missing element, so these helpers check at runtime and name the missing selector.
export function requireElement(selector: string): HTMLElement {
  const element = document.querySelector(selector);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`Startup check: no element matches ${selector}`);
  }
  return element;
}

export function requireButton(selector: string): HTMLButtonElement {
  const element = document.querySelector(selector);
  if (!(element instanceof HTMLButtonElement)) {
    throw new Error(`Startup check: no button matches ${selector}`);
  }
  return element;
}

// One record per labelled direction button: the element and its domain direction.
export interface ButtonBinding {
  element: HTMLButtonElement;
  direction: Direction;
}

export function getButtonBindings(): ButtonBinding[] {
  return [
    { element: requireButton("#north"), direction: "north" },
    { element: requireButton("#east"), direction: "east" },
    { element: requireButton("#south"), direction: "south" },
    { element: requireButton("#west"), direction: "west" },
  ];
}

// Marks the player's tile from the retained state. classList.toggle's Boolean second
// argument says whether the class should be present, so re-rendering unchanged state
// keeps the same tile marked. The tile text "Player" is a non-colour cue.
// This function only describes the state; it never calculates a move.
export function renderBoard(state: GameState): void {
  const tiles = document.querySelectorAll<HTMLElement>("#board .tile");
  for (const tile of tiles) {
    const x = Number(tile.dataset.x);
    const y = Number(tile.dataset.y);
    const player = state.position.x === x && state.position.y === y;
    tile.classList.toggle("player", player);
    const base = tile.dataset.label ?? "";
    const collected = tile.dataset.treasure !== undefined && state.collected.includes(tile.dataset.treasure);
    const description = collected ? "Collected" : base;
    tile.textContent = player ? "Player" : description;
    tile.setAttribute("aria-label", `(${x},${y}) ${player ? "Player" : description || "empty"}`);
  }
  requireElement("#score").textContent = "Score: " + state.score;
}
