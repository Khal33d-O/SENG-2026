# W4.08 demonstrations — repeatable tests with a test double

Known-good teaching aid except the clearly marked temporary mutant in `mutant/`. From this folder:

```bash
dotnet test Rules.Tests.csproj
```

## Demo 1: two data rows and a regression

`RuleTests.cs` holds the `Initial_move` theory (`east` accepted to (1,0) with five moves; `west` rejected with
`ILLEGAL_ACTION`, (0,0), six moves) and the F07 regression. Trace `new FixedBoardProvider(board)` into
`new Engine(provider)` and then `provider.GetBoard()`. No network, current time or random board influences the
results. Observed (run twice): `Passed!  - Failed: 0, Passed: 3, Skipped: 0, Total: 3`.

## Demo 2: reproduce F07 against the temporary mutant

F07 reproduces east, east, west, east, south, south: the player reaches the exit with treasure and exactly zero
moves; the result must be `won`. In a disposable copy:

```bash
cp mutant/Rules.mutant.cs.txt Rules.cs
dotnet test Rules.Tests.csproj
```

Observed: `Failed TreasureRules.Tests.RuleTests.F07_final_move_win_is_won_not_lost` with
`Expected: "won"` / `Actual: "lost"`; `Failed: 1, Passed: 2`. Restore `Rules.cs` and rerun: 3 passed. Do not edit
the expected status to accept the mutant.

Then add a wall regression (east then south): capture the input before the rejected south, assert the reason and
every resulting field, and verify the input did not mutate — that is the lab's challenge.
