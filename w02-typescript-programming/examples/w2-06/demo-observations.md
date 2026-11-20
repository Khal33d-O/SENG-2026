# W2.06 captured demonstration observations

Author-captured with the supplied package (.NET API running behind the development proxy). Viewing this
record is not the same as executing the request; mark execution unperformed if you rely on it.

## Worked Example 1: HTTP response inspection (condition: Valid reference)
- Status: `200 (ok)`
- Content-Type: `application/json; charset=utf-8`
- Body (text) contains `"initialMoves": 6`, `"start": { "x": 0, "y": 0 }` and treasure `"id": "t1"` — see `response.json`.

## Worked Example 2: Asynchronous message request
- Valid message: `Loading` -> `Board service ready`.
- Wrong message type (`{"message": 42}`): `Loading` -> `Failure: Invalid message`.

## Reference request function, by response condition
| Condition | Request status | Last accepted definition |
|---|---|---|
| Valid reference | `Success: Board definition accepted.` | `initialMoveBudget: 6`, `Treasures: t1 (2,0)` |
| Unavailable | `Failure: HTTP 503` | unchanged |
| Malformed JSON | `Failure: ...` (browser-specific JSON syntax wording) | unchanged |
| Missing treasure ID | `Failure: Invalid board shape` | unchanged |
| Zero / negative / fractional budget | `Failure: Invalid move budget` | unchanged |
| Treasure on a wall / later treasure on a later wall | `Failure: Blocked treasure` | unchanged |
| Treasures sharing one coordinate with a wall | `Success: ...` | `Treasures: t1 (1,0), t2 (2,1)` |
| Delayed zero budget (8 s) | `Loading` while East + Enter still moves to (1,0), 5 moves; then `Failure: Invalid move budget` | unchanged; game still at (1,0), 5 moves |
