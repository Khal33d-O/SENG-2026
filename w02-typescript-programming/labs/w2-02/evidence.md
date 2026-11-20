# W2.02 evidence: state preview trace

Learner id (synthetic, e.g. `learner-01`): ______  Partner id: ______

## Baseline
- `node --version`, `npm exec tsc -- --version`:
- `npm run check:baseline` result:
- First `npm test` result (first failed case and field):
- Demo outputs and the statement producing one property in each:

## Guided practice
- Packing loop: predicted total and first false comparison; bound 1 and 0 observations:
- Two-reference paper trace (`current` / `previous`) and which earlier value cannot be recovered:

## Task 1 predictions (before running)
| Case | Preview score / actionsRemaining / completed | Original after call | `preview === original` |
|---|---|---|---|
| zero-request | | | |
| one | | | |
- Does reading `initial.score` have the same effect as assigning `initial` to another variable? Diagram:

## Task 2 trace for `multiple`
| Body execution | Comparison and operands | score | actionsRemaining |
|---|---|---|---|
| | | | |
- Observation that stops further work:

## Task 3 changed inputs and identity
- Predicted last permitted update for over-request and exact-capacity:
- Candidate guard `count < state.actionsRemaining` with four actions/four requests: operands of the 2nd and 3rd comparisons, and your verdict:
- Reference trace: why mutation followed by replacement cannot recover the before-state:

## Task 4 counterexample
- Error my implementation avoids, the input exposing it, predicted first wrong observation, actual result:
- Final `npm test` and `npm run check:browser` results:

## Individual check (instructor-supplied boundary input)
- Input:
- Predictions (score, actionsRemaining, completed, original properties, same reference?):
- Observations and the first incorrect step, if any:

## Transfer: equipment servicing (paper)
- Both displayed records:
- An implementation that corrupts the before-state, and what must be checked before / observed after an update:

## Assistance and next revisit
- Support used (documentation / human prompt / checkpoint / capture):
- Status: demonstrated independently / with a prompt / with guided support / not yet demonstrated; environment blocked:
- Specific W2.03 retrieval revisit:
