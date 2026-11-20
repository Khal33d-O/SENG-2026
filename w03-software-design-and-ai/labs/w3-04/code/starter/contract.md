# Rule contract (fixed)

`evaluateMove(state, direction)` returns `{ accepted, state, reason }` and never mutates its input.

- Board: 3 × 3 (coordinates 0–2), start (0,0), wall (1,1), treasure t1 at (2,0) worth 10, exit (2,2),
  six moves (`src/board.ts`).
- An accepted move costs exactly one move, including a move that collects treasure.
- First entry to t1 adds 10 to `score` and records `t1` in `collected` once; collecting grants no moves.
- Standing on the exit with t1 collected sets `status` to `won`; this is checked before the zero-budget
  loss, so a win on the final move counts. Otherwise zero moves remaining sets `status` to `lost`.
- A rejected action (wall or board edge: reason `ILLEGAL_ACTION`) preserves every public state field.
- A completed game rejects later actions with `GAME_COMPLETE` and preserves state.

Known defect in the supplied rule: from the start, East then South (into the wall) returns four moves;
the contract requires five.
