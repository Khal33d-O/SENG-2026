# W2.09 evidence card: connect and diagnose one application action

Learner id (synthetic, e.g. `learner-01`): ______  Partner id: ______

## Baseline and Task 1
- `npm run check:baseline` result:
- Practice prediction (run, sequence, action, before/after count) and the matching row:
- Startup connections and event-call location in `src/app.ts`:

## Task 2: first observation (before any repair)
| Page URL | Run ID | Sequence | Action / source | Page: position, moves, score, status | Event before -> after |
|---|---|---|---|---|---|
| | | | | | |
- API region text:
- Served script inspected:

## Task 3: paused observation
- Line paused on (served `dist/app.js`), and the expression controlling `paint`:
- `before`, `after`, `state` values while paused:
- After step/resume: did painting execute, with which value? Post-resume DOM:
- Boundary supported, and one alternative excluded:

## Task 4: competing explanations (written BEFORE running)
- Explanation A (execution path):
- Explanation B (argument or rule):
- Second interaction chosen, and each explanation's prediction:
- Actual result (run, sequence, page, event):
- Bounded change made and why a display-only change would fail:
- Both interactions repeated after rebuild and reload:

## Task 5
- `npm test` names/results:
- Why failed recording must leave the accepted action intact; why an old event cannot stand in for a missing row:

## Individual explanation
- Visible defect, inspected values, matching event, source correction, repeated interaction, preserved rule result, alternative ruled out:

## Transfer: task counter
- View-boundary value to inspect; what a matching event adds; the missing evidence when the collector is unavailable:

## Assistance
- independent / prompted / guided / not yet demonstrated; environment blocked (separately); checkpoint backup path:
