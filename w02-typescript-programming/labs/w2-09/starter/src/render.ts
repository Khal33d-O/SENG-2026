// SUPPLIED renderer. paint(state) describes the state it is GIVEN through board cells and text fields
// (position, moves, score, status). Repainting unchanged state is safe. It never calculates a move.
import { REFERENCE_BOARD, type GameState } from "./rules.js";

export type Region = "api" | "telemetry" | "run";

function element(id: string): HTMLElement {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Supplied page is missing #${id}`);
  return found;
}

function cellLabel(state: GameState, x: number, y: number): string {
  const b = REFERENCE_BOARD;
  if (state.position.x === x && state.position.y === y) return "Player";
  if (b.walls.some((w) => w.x === x && w.y === y)) return "Wall";
  const t = b.treasures.find((t) => t.x === x && t.y === y);
  if (t && !state.collected.includes(t.id)) return "Treasure";
  if (b.exit.x === x && b.exit.y === y) return "Exit";
  return "Floor";
}

export function paint(state: GameState): void {
  const board = element("board");
  board.replaceChildren();
  for (let y = 0; y < REFERENCE_BOARD.height; y += 1) {
    for (let x = 0; x < REFERENCE_BOARD.width; x += 1) {
      const cell = document.createElement("div");
      const label = cellLabel(state, x, y);
      cell.className = `cell cell-${label.toLowerCase()}`;
      cell.textContent = label;
      cell.setAttribute("aria-label", `(${x},${y}) ${label}`);
      board.append(cell);
    }
  }
  element("position").textContent = `(${state.position.x},${state.position.y})`;
  element("moves").textContent = String(state.movesRemaining);
  element("score").textContent = String(state.score);
  element("status").textContent = state.status;
}

/** Replace the words of one message region ("api", "telemetry" or "run"). */
export function text(region: Region, message: string): void {
  element(region).textContent = message;
}

/** Show the run identifier and carry it into the event-view link. */
export function identify(runId: string): void {
  element("run-id").textContent = runId;
  const link = element("event-link");
  if (link instanceof HTMLAnchorElement) link.href = `events.html?runId=${encodeURIComponent(runId)}`;
}
