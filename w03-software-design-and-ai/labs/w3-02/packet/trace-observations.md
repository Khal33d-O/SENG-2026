# Trace observations

Actual local executions of the supplied programs by the facilitator's runner (2026-10-11). Each row is one
action with its before → after values. Baseline and candidate are recorded separately; neither is the
requirement. Further complete sequences can be requested from the instructor (state the start and all
actions; label your expectation as a prediction until it is replayed).

## T1 — East, South
**baseline** — actions: east, south

| Row | Action | Accepted | Position (before → after) | Collected | Score | Moves remaining | Status |
|---|---|---|---|---|---|---|---|
| 1 | east | true | (0,0) → (1,0) | [] | 0 | 6 → 5 | playing |
| 2 | south | false | (1,0) | [] | 0 | 5 → 4 | playing |

**candidate-c** — actions: east, south

| Row | Action | Accepted | Position (before → after) | Collected | Score | Moves remaining | Status |
|---|---|---|---|---|---|---|---|
| 1 | east | true | (0,0) → (1,0) | [] | 0 | 6 → 5 | playing |
| 2 | south | false | (1,0) | [] | 0 | 5 | playing |

## T2 — East, South, East, South, South
**baseline** — actions: east, south, east, south, south

| Row | Action | Accepted | Position (before → after) | Collected | Score | Moves remaining | Status |
|---|---|---|---|---|---|---|---|
| 1 | east | true | (0,0) → (1,0) | [] | 0 | 6 → 5 | playing |
| 2 | south | false | (1,0) | [] | 0 | 5 → 4 | playing |
| 3 | east | true | (1,0) → (2,0) | [] → [t1] | 0 → 10 | 4 → 3 | playing |
| 4 | south | true | (2,0) → (2,1) | [t1] | 10 | 3 → 2 | playing |
| 5 | south | true | (2,1) → (2,2) | [t1] | 10 | 2 → 1 | playing → won |

**candidate-c** — actions: east, south, east, south, south

| Row | Action | Accepted | Position (before → after) | Collected | Score | Moves remaining | Status |
|---|---|---|---|---|---|---|---|
| 1 | east | true | (0,0) → (1,0) | [] | 0 | 6 → 5 | playing |
| 2 | south | false | (1,0) | [] | 0 | 5 | playing |
| 3 | east | true | (1,0) → (2,0) | [] → [t1] | 0 → 10 | 5 | playing |
| 4 | south | true | (2,0) → (2,1) | [t1] | 10 | 5 → 4 | playing |
| 5 | south | true | (2,1) → (2,2) | [t1] | 10 | 4 → 3 | playing → won |
