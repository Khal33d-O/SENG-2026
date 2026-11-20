// SUPPLIED - do not edit. "New game", "Final approach" and "Read diagnostics".
import {
  finalApproachState,
  initialState,
  moveRuleCallCount,
  resetMoveRuleCallCount,
  type GameState,
} from "./rules.js";
import { requireButton, requireElement } from "./view.js";

export interface SupportHooks {
  // Returns the state your adapter currently retains.
  getState(): GameState;
  // Replaces the retained state and renders it (used by New game and Final approach).
  replaceState(next: GameState): void;
}

export function connectSupportControls(hooks: SupportHooks): void {
  const output = requireElement("#diagnostics");

  // A fresh state and a zero count give a comparable next observation.
  requireButton("#new-game").addEventListener("click", () => {
    resetMoveRuleCallCount();
    hooks.replaceState(initialState());
  });

  // The changed-input checkpoint: near the exit, treasure collected, two moves.
  requireButton("#final-approach").addEventListener("click", () => {
    resetMoveRuleCallCount();
    hooks.replaceState(finalApproachState());
  });

  // Displays a copy of the retained state and the call count. Never applies a move.
  requireButton("#read-diagnostics").addEventListener("click", () => {
    const copied = structuredClone(hooks.getState());
    output.textContent = JSON.stringify({ state: copied, moveRuleCalls: moveRuleCallCount() }, null, 2);
  });
}
