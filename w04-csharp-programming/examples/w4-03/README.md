# W4.03 worked examples — the Boolean predicate demo

`demo/` contains the complete `IsOpenPosition` (`Rules/PositionRules.cs`), the supplied assertion runner and
the 13 position cases. `CandidateRules.cs` is the unfinished lab shell (not used by these cases).

## Worked Example 1: Translate the Boolean rule with foreach

From a disposable copy of `demo/`:

```bash
dotnet restore Preflight.slnx
dotnet build Preflight.slnx --no-restore --disable-build-servers
dotnet run --project ConsoleApp/ConsoleApp.csproj --no-build -- fixtures/position-cases.json
```

Observed: each case prints `actual`, `expected`, `repeated`, `preserved`, ending
`Position assertions: 39/39; cases=13; failures=0`.

**Continued: a valid for loop.** Copy `alternatives/PositionRules.for.cs.txt` over `Rules/PositionRules.cs`
(index from zero, `index < board.Walls.Length`, a `blocked` flag combined with the bounds result) and rerun:
also `39/39`.

## Worked Example 2: Run normal and exact-edge checks, then a wrong expectation

The 13 cases cover open normal, final in-bounds cell, exact width/height, negative coordinates, origin,
single and empty wall arrays, first/later/final wall membership and same-X/different-Y.

```bash
dotnet run --project ConsoleApp/ConsoleApp.csproj --no-build -- fixtures/wrong-expectation-case.json
```

Observed (exit 1):

```text
W01 Open position with a deliberately wrong expected value
    actual=True expected=False repeated=True preserved=True -> FAIL
Position assertions: 1/3; cases=1; failures=2
```

The input and the open-position contract justify correcting the expectation, not the method.

## Supporting defects (for guided practice and the checkpoint)

| File | Observed with `position-cases.json` |
|---|---|
| `alternatives/PositionRules.premature-return.cs.txt` (returns true after the first non-match) | `37/39`; the later-wall case P12 fails |
| `alternatives/PositionRules.overwrites-input.cs.txt` (correct Boolean, overwrites a wall) | `32/39`; preservation fails |

Restore the original `PositionRules.cs` after each experiment.
