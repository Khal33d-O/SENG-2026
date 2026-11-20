import { applyMove, initialState } from './rules-seeded.js';
import { history, recordSnapshot } from './history-store.js';
import type { Game, Renderer } from './ports.js';

// Coordinates one transition: rule, then history record, then render. It does not choose the renderer.
export function makeGame(renderer: Renderer): Game {
  let state = initialState();
  recordSnapshot(state);
  renderer.show(state);
  return {
    act(direction) {
      state = applyMove(state, direction);
      recordSnapshot(state);
      renderer.show(state);
      return state;
    },
    history,
  };
}
