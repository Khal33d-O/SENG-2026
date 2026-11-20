// SUPPLIED: a play session composed from a plan. The browser page and the plan
// checker (npm run plan) both use this, so they exercise the same connections.

import { copyState, evaluate, initialState, type Board, type GameState, type Reason } from "./rules.js";
import { retain, type Plan } from "./plans.js";
import { referenceBoard } from "./reference.js";

export interface Step {
  sequence: number;
  action: unknown;
  accepted: boolean;
  reason: Reason | null;
  /** The state consumed by this call (what the previous handoff retained). */
  before: GameState;
  /** The state the rule returned: the immediate result the panel displays. */
  after: GameState;
  /** What the plan's handoff keeps for the next call. */
  retained: GameState;
}

export interface Session {
  readonly plan: Plan;
  current(): GameState;
  act(direction: unknown): Step;
}

/** Start a fresh session from the public start of `board`. */
export function startSession(plan: Plan, board: Board = referenceBoard): Session {
  let retained = initialState(board);
  let sequence = 0;
  return {
    plan,
    current: () => copyState(retained),
    act(direction: unknown): Step {
      sequence += 1;
      const before = copyState(retained);
      const action = { type: "move", direction };
      const result = evaluate(board, before, action);
      retained = retain(plan.handoff, result.state);
      return {
        sequence,
        action,
        accepted: result.accepted,
        reason: result.reason,
        before,
        after: copyState(result.state),
        retained: copyState(retained),
      };
    },
  };
}

export function formatState(s: GameState): string {
  const ids = s.collected.length ? s.collected.join(",") : "none";
  return `position (${s.position.x},${s.position.y}) · moves ${s.movesRemaining} · score ${s.score} · collected ${ids} · ${s.status}`;
}
