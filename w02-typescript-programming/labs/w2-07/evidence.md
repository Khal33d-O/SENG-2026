# W2.07 evidence: trustworthy regression evidence

Learner id (synthetic, e.g. `learner-01`): ______  Partner id: ______
Working directory (`$w207_work`): ______

## Environment
- `node --version`, `npm --version`, `tsc --version` (or `npx tsc --version`):
- Environment block, if any (kept separate from reasoning):

## Baseline and guided practice
- `npm run check:baseline`: number of named passes and the two test files:
- Compiled import used by the conversion example:
- My normal test: predicted complete returned state (written before running):
- Seed regression: original failure text, inspected operands (threshold, costs, actual IDs), the bounded change, the passing rerun:
- Worked example / human prompt / checkpoint used? Printed backup path:

## Task 1: normal and invalid checks
- Which assertion catches "rejects but consumes a move"? Which catches "allowed position, wrong score"?
- `npm run check:mine` partial result:

## Task 2: full vs focused probe
| | Complete file (`check:probe`) | Focused (`check:focused`) |
|---|---|---|
| Callbacks executed | | |
| Threshold received (TRACE) | | |
| Result | | |
- The statement that supplied the threshold in each run:
- Prediction for the fixed-two proposal (`tile.cost > 2`) on the demonstration and both probe modes; the caller requirement it abandons:

## Task 3: probe repair and my boundary input
- Setup change in `tests/probe.test.mjs` and why both claims now receive their promised input:
- My threshold and tiles; predicted IDs under the strict rule, the original inclusive rule and the fixed-two proposal:

## Task 4: replay the original defect
- PRESERVED path printed by `node tools.mjs seed`:
- `npm run check:boundary` against the seed (named assertion failure):
- After `node tools.mjs restore <path>`: `check:boundary` result, then `npm test` count and names:
- Fixed-two scratch proposal (optional): actual vs predicted, and the assertion that rejects it:

## Individual explanation
- Test name, chosen input, original rule version, expected IDs, actual before/after results (same test bytes):
- The probe discrepancy in my own words: value entering the rule in each run, the statement supplying it, why the correction belongs where I put it:

## Transfer: completed work item (paper)
- First state observation; a setup that lets the rejection claim run alone; the counter assertion a broadly accepting repair would violate:

## Status and assistance
- demonstrated independently / with a prompt / completed with guided support / not yet demonstrated:
- Documentation, hints, access support used:
