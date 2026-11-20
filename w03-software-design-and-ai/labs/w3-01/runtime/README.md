# Runtime guide (W3.01)

Three supplied executable fixtures share the same intentionally seeded rule defect (a rejected action
spends one move). You inspect them; **no runtime source edit is required** for the lab.

| Fixture | What it shows |
|---|---|
| `before/` | `src/application.ts` imports the concrete DOM renderer; `node headless.mjs` fails on `document` during module evaluation |
| `after/` | Completed direct-dependency demonstration: the caller supplies the renderer; `node headless.mjs` loads and records three states |
| `challenge/` | The challenge starting graph: a public entry `src/index.ts` used by both fixed consumers (`browser.mjs`, `headless-public.mjs`) |

Each fixture has `src/ports.ts`, `rules-seeded.ts`, `browser-renderer.ts`, `history-store.ts`,
`make-game.ts`, `application.ts`, an `index.html` page, `browser.mjs` and `headless.mjs`.

## Commands (from this `runtime` folder)

```bash
npm ci                        # once: pinned TypeScript 5.9.3
npm run build:before          # likewise build:after, build:challenge (tsc -p <fixture>/tsconfig.json)
npm run serve:before          # http://127.0.0.1:4301 ; Ctrl+C stops it (port busy? node serve.mjs before 4302)
(cd before && node headless.mjs)           # expected: ReferenceError: document is not defined
(cd after && node headless.mjs)            # expected: three states, match local history, four moves
(cd challenge && node headless.mjs)        # direct application check: loads
(cd challenge && node headless-public.mjs) # fixed public consumer: observe and record the first error
```

In the browser, click East, South, East, South, South and record all six complete states (including the
initial state, collected IDs and status). Both before and after finish with one move: the blocked-action
defect remains.

Run every Node check in a **fresh process**: Node caches an imported module by its resolved URL, and a fresh
process also starts a new in-memory history. If a headless `document` error appears in `after/`, you ran a
different entry, a stale build or changed sources: record the working directory and rebuild.

Read the emitted JavaScript in `<fixture>/dist/` to distinguish an erased type import from a retained runtime
import (or a retained re-export).
