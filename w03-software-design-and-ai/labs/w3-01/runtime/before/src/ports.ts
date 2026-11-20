import type { Direction, State } from './rules-seeded.js';

// Collaboration contracts (type-only). Type imports are erased from the emitted JavaScript.
export interface Renderer {
  show(state: State): void;
}

export interface Game {
  act(direction: Direction): State;
  history(): State[];
}
