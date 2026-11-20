// After: the caller supplies the collaborator.
import { makeGame } from './make-game.js';
import type { Renderer } from './ports.js';
export function createGame(renderer: Renderer) {
  return makeGame(renderer);
}
