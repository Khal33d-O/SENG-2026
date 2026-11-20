# W2.09 recorded walkthrough (captured observations)

Author-captured with the supplied package (.NET API running). Label any use as captured; it is not
your execution.

## Worked Example 1: `demo.html?mode=working`
- API region: `Reference API verified`. Run ID e.g. `run-1a2b3c4d`.
- East (button): position `(1,0)`, moves `5`, score `0`, status `playing`; recording `Recorded locally`.
- Local event view filtered by that run: sequence `1`, action `east`, source `button`,
  before `(0,0) moves 6 score 0 playing`, after `(1,0) moves 5 score 0 playing`.

## Worked Example 2: `demo.html?mode=mismatch`
- Breakpoint on the `paint(before);` line inside `if (mode === 'mismatch')` in the served `dist/demo.js`.
- After East, paused: `before.position.x` = 0, `after.position.x` = 1, `state.position.x` = 1,
  `sequence` = 1, `runId` = this page's run.
- After resuming: page still `(0,0)`, moves `6`; event row after `(1,0) moves 5 score 0 playing`.
- `demo.html?mode=repaired`: East shows `(1,0)` and `5`, agreeing with the event. `npm run check:rules`: 12 pass.

## Guided practice: `practice.html`
- Complete task: count `1`; row sequence `1`, action `complete`, before `(0,0) moves 0 score 0 playing`,
  after `(0,0) moves 0 score 1 playing`.

## Lab starter after Task 2 (connected checkpoint), seeded mismatch still present
- East from a fresh run: page `(0,0)`, `6`; event row after `(1,0) moves 5 score 0 playing`.
- South from a fresh run: page `(0,1)`, `5`, agreeing with its event (the paint branch ran).
