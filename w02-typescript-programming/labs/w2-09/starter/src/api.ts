// SUPPLIED HTTP adapter. inspectBoard() checks GET /api/boards/reference (the supplied .NET API) against
// the known reference definition, mapping the wire name initialMoves to the local initialMoveBudget.
// It reports loading / verified / unavailable / unreadable / different data in the "api" region only.
// It never installs another board, never posts game actions and never touches the current game.
import { REFERENCE_BOARD } from "./rules.js";
import { text } from "./render.js";

type Json = Record<string, unknown>;

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function matchesReference(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Json;
  const points = (list: unknown) => (Array.isArray(list) ? list.map((p: Json) => ({ x: p.x, y: p.y })) : null);
  const treasures = Array.isArray(v.treasures)
    ? v.treasures.map((t: Json) => ({ id: t.id, x: t.x, y: t.y, value: t.value }))
    : null;
  const local = {
    width: v.width, height: v.height,
    start: points([v.start])?.[0], walls: points(v.walls), treasures,
    exit: points([v.exit])?.[0],
    initialMoveBudget: v.initialMoves, // explicit wire -> local mapping
  };
  return v.id === "reference" && sameJson(local, REFERENCE_BOARD);
}

export async function inspectBoard(): Promise<void> {
  text("api", "Checking reference API...");
  try {
    const response = await fetch("/api/boards/reference", { headers: { Accept: "application/json" } });
    if (!response.ok) {
      text("api", `Reference API unavailable: HTTP ${response.status}`);
      return;
    }
    let value: unknown;
    try {
      value = await response.json();
    } catch {
      text("api", "Reference API returned malformed JSON");
      return;
    }
    text("api", matchesReference(value) ? "Reference API verified" : "Reference API returned a different definition");
  } catch {
    text("api", "Reference API unavailable: network error");
  }
}
