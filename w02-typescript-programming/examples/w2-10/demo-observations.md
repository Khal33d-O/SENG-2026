# W2.10 recorded walkthrough (captured)

Captured with the supplied package (`python tools/serve.py`, .NET reference API running).

## Worked Example 1, `?plan=B`
- Plan line: `supplied proposal B (?plan=B; plan.json unchanged) · handoff session-record; enhancements item-labels; estimate 8 of 8 units`.
- API line starts `Reference API verified: 3×3 board, initialMoves 6`.
- East: (1,0), 5 moves. South: `South rejected: WALL`, state unchanged, event still recorded.
- East: (2,0), score 10, collected `["t1"]`, item label `Collected items: t1 (treasure, 10 points)`.
- South, South: (2,2), 2 moves, score 10, `won`. West afterwards: `West rejected: GAME_COMPLETE`.
- Recording line: `Event 6 recorded (collector row 6)`; event view for the run: `6 row(s) for run-...`.

## Same route with `?plan=A`
- After East, East the panel shows collected `["t1"]`, but the next action starts from a retained record whose
  identity list is empty: South, South reaches (2,2) with status `playing`, not `won`.

## Worked Example 2: target range
- Start: ammunition 2, score 0, shots 0, active. Hit: 1 / 1. Miss: 0 / 1, `complete`. Hit: `hit rejected: GAME_COMPLETE`, unchanged.

## Unsupported query
- `?plan=Z`: `Plan error: unsupported plan query "Z" (use A, B or C, or no query for plan.json). No session started.`
