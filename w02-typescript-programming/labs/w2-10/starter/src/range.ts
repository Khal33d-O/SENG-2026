// SUPPLIED: the target-range alternative (Worked Example 2).
// A supplied local range definition: two rounds. Hit and Miss are provided domain
// events from labelled buttons; there is no aiming, camera or physics here.

export type RangeStatus = "active" | "complete";
export type RangeReason = "INVALID_EVENT" | "GAME_COMPLETE";

export interface RangeDefinition {
  readonly id: string;
  readonly name: string;
  readonly ammunition: number;
}

export interface RangeState {
  ammunition: number;
  score: number;
  shots: number;
  status: RangeStatus;
}

export interface ShotEvent {
  type: "hit" | "miss";
}

export interface ShotResult {
  accepted: boolean;
  reason: RangeReason | null;
  state: RangeState;
}

export const rangeDefinition: RangeDefinition = {
  id: "reference",
  name: "Reference target range",
  ammunition: 2,
};

export function initialRangeState(range: RangeDefinition = rangeDefinition): RangeState {
  return { ammunition: range.ammunition, score: 0, shots: 0, status: "active" };
}

function copy(s: RangeState): RangeState {
  return { ammunition: s.ammunition, score: s.score, shots: s.shots, status: s.status };
}

/** The shot rule: produces the next state and never mutates its inputs. */
export function evaluateShot(state: RangeState, event: unknown): ShotResult {
  if (state.status !== "active") return { accepted: false, reason: "GAME_COMPLETE", state: copy(state) };
  const candidate = event as Partial<ShotEvent> | null | undefined;
  if (!candidate || (candidate.type !== "hit" && candidate.type !== "miss")) {
    return { accepted: false, reason: "INVALID_EVENT", state: copy(state) };
  }
  const next = copy(state);
  next.ammunition -= 1; // every shot spends one round
  next.shots += 1;
  if (candidate.type === "hit") next.score += 1; // only a hit scores
  if (next.ammunition === 0) next.status = "complete"; // the last round completes the range
  return { accepted: true, reason: null, state: next };
}
