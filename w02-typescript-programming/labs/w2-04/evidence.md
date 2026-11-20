# W2.04 evidence: typed state and module boundaries

Learner id (synthetic, e.g. `learner-01`): ______  Partner id: ______

## Starting point
- `npm run check:baseline` output:
- First named failures of `npm test` and `npm run practice` on the unchanged starter:

## Guided floor
- Completed object you wrote (target two, label quiet, score two); predicted diagnostic if the score were missing or quoted:
- `npm run practice` result; what `dist/src/caller.js` still imports and what disappeared:
- Checkpoint used? Printed backup directory (`Preserved attempt: ...`) and support recorded:

## Task 1: predictions before coding retry
| Before | Action | Predicted after | Same object? |
|---|---|---|---|
| complete (target __, label __) | retry | | |
| playing (progress __) | retry | | |
- Why a build that accepts `"retry"` cannot establish that retry behaves correctly:

## Task 2: verify the existing boundary
- First failing assertion: before, action, expected, observed; classification (compile / runtime import / behaviour):
- Trace ready/start through `callRule` and playing/collect through `callFromReplay` (argument -> rule -> caller result; where the old object remains):

## Task 3: implement and compare
- First failure and the corrected run:
- Proposal A (factory: target two, label quiet): an observation that would distinguish it:
- Proposal B (only `callRule` checks completion): an observation that would distinguish it:

## Task 4: fresh diagnostic cases (`my-cases.mjs`)
| Case | Rival | Rival's predicted result | My expected result and identity | Why they differ |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
- `npm run check:mine` result:
- Changed condition: if the caller's settings equal the factory defaults, does case 1 still distinguish A? What would you need instead?
- Does moving the Proposal B case to the direct rule entry change what it can reveal?

## Individual trace (minutes 97-100)
- Argument values, imported function, return through the caller, resulting state, and what the retained observer still sees:

## Transfer: document workflow (paper)
- What the state type can describe, what needs a runtime decision, and the observation that separates main-screen-only blocking from the shared rule:

## Assistance and next revisit
- independent / human hint / ordinary checkpoint / not yet demonstrated:
- Runtime executed, or inspected from supplied output?
- Next revisit:
