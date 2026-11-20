// Supplied: the explicit wire-to-local adapter and the definition display.
// It translates initialMoves to the earlier local name initialMoveBudget.
// It displays the inspected definition only: it never resets or replaces the current game,
// and it does not install the definition in the rule engine.
import type { Point } from "./board.js";
import type { WireBoard } from "./board-shape.js";

export interface InspectedDefinition {
  id: string;
  width: number;
  height: number;
  start: Point;
  walls: Point[];
  treasures: { id: string; x: number; y: number }[];
  exit: Point;
  initialMoveBudget: number; // a starting allowance, NOT state.movesRemaining
}

export function toInspectedDefinition(value: WireBoard): InspectedDefinition {
  return {
    id: value.id,
    width: value.width,
    height: value.height,
    start: { x: value.start.x, y: value.start.y },
    walls: value.walls.map((w) => ({ x: w.x, y: w.y })),
    treasures: value.treasures.map((t) => ({ id: t.id, x: t.x, y: t.y })),
    exit: { x: value.exit.x, y: value.exit.y },
    initialMoveBudget: value.initialMoves, // the one renamed field
  };
}

const point = (p: Point): string => `(${p.x},${p.y})`;

export function publishDefinition(value: WireBoard): void {
  const d = toInspectedDefinition(value);
  const output = document.querySelector<HTMLElement>("#definition");
  if (output === null) throw new Error("Missing page element #definition");
  output.textContent = [
    `Board: ${d.id} (${d.width} × ${d.height})`,
    `Start: ${point(d.start)}`,
    `Exit: ${point(d.exit)}`,
    `Walls: ${d.walls.map(point).join(", ") || "none"}`,
    `Treasures: ${d.treasures.map((t) => `${t.id} ${point(t)}`).join(", ")}`,
    `initialMoveBudget: ${d.initialMoveBudget}`,
  ].join("\n");
}
