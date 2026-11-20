// Supplied element lookup. Read the promise; leave the implementation as it is.
//
// Promise: `statusLabel` refers to the real <p id="mission-label"> paragraph in the
// loaded page, or the program stops here with a diagnostic naming what is missing.
//
// `document` is provided by the browser. Node.js has no page document, so running
// this module with Node.js stops at the next line with
// "ReferenceError: document is not defined".
const found = document.getElementById("mission-label");
if (!(found instanceof HTMLParagraphElement)) {
    throw new Error('page.ts: expected a <p id="mission-label"> paragraph in this page.');
}
// Export makes the checked reference available to main.ts (it does not copy the HTML).
export const statusLabel = found;
