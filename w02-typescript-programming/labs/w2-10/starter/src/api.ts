// SUPPLIED: the reference API check. It fetches GET /api/boards/reference and
// requires the exact known wire definition (including initialMoves 6). It does not
// install arbitrary boards and never resets or owns current play.

import { referenceWire } from "./reference.js";

export interface ApiCheck {
  ok: boolean;
  message: string;
}

/** Structural equality for JSON values (key order does not matter, extra keys do). */
function same(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => same(v, b[i]));
  }
  if (typeof a === "object" && a !== null && typeof b === "object" && b !== null) {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    const ra = a as Record<string, unknown>;
    const rb = b as Record<string, unknown>;
    return same(ka, kb) && ka.every((k) => same(ra[k], rb[k]));
  }
  return a === b;
}

export async function checkReferenceApi(fetchFn: typeof fetch = fetch): Promise<ApiCheck> {
  let response: Response;
  try {
    response = await fetchFn("/api/boards/reference", { cache: "no-store" });
  } catch (error) {
    return { ok: false, message: `Reference API unavailable: ${String(error)}` };
  }
  if (!response.ok) return { ok: false, message: `Reference API failed: HTTP ${response.status}` };
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return { ok: false, message: "Reference API failed: response was not valid JSON" };
  }
  if (!same(body, referenceWire)) {
    return { ok: false, message: "Reference API failed: definition differs from the known reference board" };
  }
  return {
    ok: true,
    message: `Reference API verified: ${referenceWire.width}×${referenceWire.height} board, initialMoves ${referenceWire.initialMoves} (fixed definition; local rule uses initialMoveBudget)`,
  };
}
