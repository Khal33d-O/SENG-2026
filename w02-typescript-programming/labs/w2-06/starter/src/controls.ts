// Supplied: the local game controls. The current game state is owned HERE.
// Nothing in the request path reads, resets or replaces this state.
import { REFERENCE_BOARD, type Direction, type GameState, type RuleResult } from "./board.js";
import { evaluate, initialState } from "./rules.js";

let state: GameState = initialState(REFERENCE_BOARD);
let lastResult: RuleResult | null = null;
let ruleCalls = 0;

function element<T extends HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (found === null) throw new Error("Missing page element " + selector);
  return found;
}

function cellLabel(x: number, y: number): string {
  const board = REFERENCE_BOARD;
  if (state.position.x === x && state.position.y === y) return "Player";
  if (board.walls.some((w) => w.x === x && w.y === y)) return "Wall";
  const treasure = board.treasures.find((t) => t.x === x && t.y === y);
  if (treasure !== undefined && !state.collected.includes(treasure.id)) return "Treasure " + treasure.id;
  if (board.exit.x === x && board.exit.y === y) return "Exit";
  return "Floor";
}

export function render(): void {
  const boardElement = element<HTMLElement>("#board");
  boardElement.replaceChildren();
  for (let y = 0; y < REFERENCE_BOARD.height; y += 1) {
    for (let x = 0; x < REFERENCE_BOARD.width; x += 1) {
      const cell = document.createElement("div");
      const label = cellLabel(x, y);
      cell.className = "cell cell-" + label.split(" ")[0].toLowerCase();
      cell.textContent = label;
      cell.setAttribute("aria-label", `(${x},${y}) ${label}`);
      boardElement.append(cell);
    }
  }
  element<HTMLElement>("#game-status").textContent =
    `Position (${state.position.x},${state.position.y}) · Moves remaining: ${state.movesRemaining}` +
    ` · Score: ${state.score} · Status: ${state.status}`;
  const last = element<HTMLElement>("#last-action");
  if (lastResult === null) last.textContent = "No move yet.";
  else last.textContent = lastResult.accepted ? "Last move accepted." : "Last move rejected: " + lastResult.reason;
}

// One rule call per action; the caller retains the returned state before rendering.
export function applyMove(direction: Direction): void {
  lastResult = evaluate(REFERENCE_BOARD, state, { type: "move", direction });
  ruleCalls += 1;
  state = lastResult.state;
  render();
}

function readDiagnostics(): void {
  element<HTMLElement>("#diagnostics").textContent = [
    `position: (${state.position.x},${state.position.y})`,
    `movesRemaining: ${state.movesRemaining}`,
    `score: ${state.score}`,
    `collected: [${state.collected.join(", ")}]`,
    `status: ${state.status}`,
    `ruleCalls: ${ruleCalls}`,
  ].join("\n");
}

// Editing guard: keys typed into editable fields belong to that field, not to the game.
function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

const KEYS: Record<string, Direction> = {
  ArrowUp: "north",
  ArrowRight: "east",
  ArrowDown: "south",
  ArrowLeft: "west",
};

export function startGame(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>("button[data-direction]")) {
    const direction = button.dataset.direction as Direction;
    button.addEventListener("click", () => applyMove(direction));
  }
  element<HTMLButtonElement>("#restart").addEventListener("click", () => {
    state = initialState(REFERENCE_BOARD);
    lastResult = null;
    render();
  });
  element<HTMLButtonElement>("#read-diagnostics").addEventListener("click", readDiagnostics);
  document.addEventListener("keydown", (event) => {
    if (isEditable(event.target)) return;
    const direction = KEYS[event.key];
    if (direction === undefined) return;
    event.preventDefault();
    applyMove(direction);
  });
  render();
}
