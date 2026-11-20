// Before: module loading already requires the DOM renderer.
import { makeGame } from './make-game.js';
import { browserRenderer } from './browser-renderer.js';
import type { Renderer } from './ports.js';
export function createGame(renderer: Renderer = browserRenderer) {
  return makeGame(renderer);
}
