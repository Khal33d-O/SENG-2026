# W3.01 worked examples

The runnable worked examples live in the lab, where the book places them: `../../labs/w3-01/runtime/`.

- **Worked example 1** — `runtime/before`: `npm run build:before`, `npm run serve:before` (http://127.0.0.1:4301), click East then South (four moves), then `(cd before && node headless.mjs)` → `ReferenceError: document is not defined` at module evaluation.
- **Worked example 2** — `runtime/after`: `npm run build:after`, `(cd after && node headless.mjs)` → three recorded states that match local history; replay East, South, East, South, South in the browser: both fixtures finish with one move (the seeded defect remains).
- Run all commands from `labs/w3-01/runtime` after `npm ci`.

No live model, API key or account is used by any example.
