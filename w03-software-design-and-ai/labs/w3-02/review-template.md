# Review of candidate C

Save As your own working copy first (for example `review.md`). Label every statement as **requirement**,
**observed result**, **interpretation** or **requested verification**. Mark predictions and unexecuted checks
as *pending*.

## 1. Record

| Field | Entry |
|---|---|
| Patch identifier | |
| Intended correction | |
| Known-defective baseline | |
| Evidence inspected (packet files) | |

## 2. Candidate claims

| Claim (quote from `candidate-message.md`) | Supported / contradicted / not yet established | Evidence (file, row or line) |
|---|---|---|
| | | |
| | | |

## 3. Allowed-difference statement

- Differences the request allows:
- Rules that remain authoritative:
- Why blanket old-snapshot equality is insufficient:
- Why updating every expected value to match the candidate is insufficient:

## 4. Classified trace differences

| Trace / variant / row | Field(s) | Baseline value | Candidate value | Contract-derived expectation | Classification (justified / regression / unresolved) | Reason |
|---|---|---|---|---|---|---|
| | | | | | | |
| | | | | | | |

## 5. Annotations (location · concern · consequence · verification)

| # | Location | Concern | Consequence | Verification | Severity |
|---|---|---|---|---|---|
| 1 | | | | | required before approval / clarity suggestion |
| 2 | | | | | |

## 6. Quality-tool interpretation

| Command policy | Scanned artifact | Rule | Severity | Location | What it establishes |
|---|---|---|---|---|---|
| | | | | | |

A question the report leaves open:

## 7. Verification request

Describe a check that rejects the defective baseline, rejects candidate C and permits a valid correction.
Give its starting state, actions and expected relationship, and the authority for each expected value.

## 8. Verdict

Approve / request changes / withhold pending named evidence — and the developer's concrete next action:

## 9. Evidence index

| Item | Reference |
|---|---|
| Trace variant(s), actions, cited rows | |
| Quality-report command(s) and finding | |
| Pending checks | |

## Individual decisive comment (four fields, written alone)

Location / concern / consequence / verification, and how its result would change the review decision:
