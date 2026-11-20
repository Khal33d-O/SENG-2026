# W4.10 demonstration guide

`demo/` is the completed checkpoint (serialization line written, plus `fixtures/L01.json`). Work in a copy.

## Demo 1: F02 across TypeScript, JSON and C#

Open `demo/fixtures/F02.json` and annotate the east action and expected position/moves: TypeScript
`position: { x: number; y: number }`, JSON `"position":{"x":1,"y":0}`, C# `Position(1,0)` read as
`State.Position.X/Y`; `movesRemaining` ↔ `MovesRemaining`. Then from `demo/`:

```bash
python3 compare.py fixtures/F02.json
```

Observed: `PASS F02 ...` then `1/1 fixtures: C# and TypeScript both match the expected result`. Both sides must
match the literal fixture expectation — agreement between two buggy implementations alone is insufficient.

## Demo 2: F07 with a temporary completion-priority mutant

In the demo copy only, swap in the mutant (zero moves is checked before the win) and compare:

```bash
cp Rules/Rules.cs Rules.cs.saved
cp mutant/Rules.priority-mutant.cs.txt Rules/Rules.cs
python3 compare.py fixtures/F07.json
```

Observed:

```text
FAIL F07  Final-move win: winning is checked before the zero-budget loss
     state.status: expected="won" typescript="won" csharp="lost"
1 of 1 fixture(s) failed
```

Locate `state.status`, explain the rule consequence (a final-move win is lost), then restore and rerun:

```bash
cp Rules.cs.saved Rules/Rules.cs
python3 compare.py
```

All 14 fixtures pass. Do not modify the fixture expectation to accommodate the defect.

## The seam

`demo/ApiSkeleton/Program.cs`: `RuleBoundary.Apply(board, storedState, action)` → `Rules.EvaluateMove`; the only
live route is `/health` (`dotnet build ApiSkeleton/ApiSkeleton.csproj` verifies packaging).
