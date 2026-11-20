# W2.03 evidence: select valid neighbouring positions

Learner id (synthetic, e.g. `learner-01`): ______  Partner id: ______
Copy this file into your working folder (it is also in `starter/`) and keep it with your attempt.

## Baseline
- `node --version`, `npm --version`:
- `npm run check:baseline` result:
- First `npm test` failure (case, expected IDs, actual IDs):

## Guided practice
- `costly` prediction for costs two and four with threshold two, and the role of each return:
- Map edit prediction (`get('q')`, `has('r')`, `size`) and observation:

## Task 1: predict before editing (interior fixture)
- Expected ordered IDs:
- One inclusion, with coordinates and access value:
- Each exclusion and the property or missing entry that causes it:
- Changed prediction after comparing with a partner (keep the original visible):

## Task 2: implementation note
- Loop or callback? Where the collection is traversed and where one inclusion decision is made:
- Why the cost-only demonstration would fail this request:

## Task 3: diagnose against public checks
| Case | Expected IDs | Actual IDs | Candidate explaining the difference | Correction and result |
|---|---|---|---|---|
| | | | | |
- If it passed first time: the deliberate wrong comparison, the predicted failing case, the observation, and the restore:
- *Activity: Diagnose* — one prediction, observed result and correction:

## Task 4: diagnostic changed input
- Board (rectangular), origin, access entries:
- Normal example and expected IDs:
- Boundary example, the disputed tile, and expected IDs under the correct rule:
- Rival rule (`x === width` still inside) prediction:
- Proposed change (disputed tile access set to false): prediction for both implementations, and whether it strengthens or destroys the evidence:
- Width and height swapped on paper (state any origin change): does the example still distinguish the rules?
- `npm run check:mine` result, and what it does and does not establish:

## Individual evidence
- My boundary input and expected IDs; the off-by-one alternative and why it disagrees:
- One callback invocation mapped to the equivalent loop decision:

## Transfer: work queue (paper)
- Why a callback that marks selected tickets reviewed violates the request; a before-and-after assertion that exposes it:

## Support record
- Each claim: independent / prompted / checkpoint-supported / awaiting revisit:
- Next narrow recheck:
