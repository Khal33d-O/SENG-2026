import type { Renderer } from './ports.js';

// Top-level environmental work: this line runs when the module is EVALUATED (imported), before any
// factory can be called. In Node there is no global `document`, so loading this module throws.
const output = document.querySelector('#state');

export const browserRenderer: Renderer = {
  show(state) {
    if (!output) throw new Error('missing display element #state');
    output.textContent = JSON.stringify(state);
  },
};
