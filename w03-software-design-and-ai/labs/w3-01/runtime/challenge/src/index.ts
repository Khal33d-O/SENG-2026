// Public entry used by BOTH fixed consumers (browser.mjs and headless-public.mjs).
export { createGame } from './application.js';
export { browserRenderer } from './browser-renderer.js';
export type { Game, Renderer } from './ports.js';
