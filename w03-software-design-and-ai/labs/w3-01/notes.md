# W3.01 design note (notes.md)

Fixture version: `runtime/challenge` as supplied. Label every row **observed** (command output you ran),
**supplied** (from the book/brief) or **predicted** (not yet executed).

## Known defect (keep separate from the boundary decision)

| Sequence | Intended `movesRemaining` | Supplied actual | Source |
|---|---|---|---|
| East, South (from (0,0), six moves) | 5 | 4 | |

The later correction is separate from this boundary refactor.

## Four fields

| Field | Entry |
|---|---|
| Maintenance task | e.g. exercise a blocked move in a Node process and inspect its state history without starting a page |
| Proposed relationship change | (leave empty until you have inspected the challenge entry point) |
| Preserved callers | browser.mjs and headless-public.mjs, both importing `./dist/index.js` (imports unchanged) |
| Evidence | see table below |

## Text alternative of the diagram (same nodes and directed, labelled edges)

Current view:

-
-

Proposed after view:

-
-

## Evidence table (each Node check in a fresh process)

| Check | Command / interaction | Expected for my design | Observation that would reject it | Observed / predicted |
|---|---|---|---|---|
| Compilation | `npm run build:challenge` | | | |
| Direct application load | `node headless.mjs` (in `runtime/challenge`) | | | |
| Fixed public headless consumer | `node headless-public.mjs` | | | |
| Existing browser sequence | initial, East, South, East, South, South — complete states | | | |

## Rejected alternative

| Alternative | Why it is initially attractive | Supplied constraint or observation that rejects it |
|---|---|---|
| | | |

## Peer review

Question or counterexample received, and how the plan changed (or the unresolved uncertainty):

## Support used

Independent / prompted / guided; rendering or runtime blockers recorded separately:
