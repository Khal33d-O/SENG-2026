# W4.08 lab · Write deterministic parameterised rule tests

**Session:** W4.08 Unit tests and test doubles · One 45-minute practical challenge within the 120-minute module
(10 retrieval and prediction, 20 concepts, 20 worked demonstrations, 45 challenge, 15 comparison and repair,
10 knowledge checks and recovery).

Work in your own copy of `starter`; save the original so you can recover. The package is self-contained.

## Outcomes

* Structure a C# unit test with Arrange, Act and Assert in the supplied xUnit project.
* Use `[Theory]` and `[InlineData(...)]` for repeatable data rows with independent expected values.
* Isolate the rule from variable inputs with the `FixedBoardProvider` test double.
* Cover legal, illegal and boundary actions and keep a known-defect regression.

## Start and ownership

Use the academy shell prepared in W4.01 and .NET SDK 10.0.401 (`dotnet --version`). The authoring repository's
`source designer/build/tooling/environment.sh` is not published; use [environment.sh](environment.sh)
(`sh environment.sh`) to check the prepared terminal. No application environment variables or secrets are
needed. Commands begin at the repository root — the **`source/`** folder of this course repository.

**You edit:** `LearnerTests.cs` only — replace its failing placeholder with a theory and wall regression.
`Provider.cs`, `RuleTests.cs` and `Rules.cs` are supplied. Temporary demo mutation is reverted before submission.

```bash
dotnet test learner/units/w04-csharp-programming/labs/w4-08/starter/Rules.Tests.csproj
```

**Initial behaviour.** Three supplied checks pass and `Complete_the_challenge` fails
(`Failed: 1, Passed: 3, Total: 4`). This red placeholder prevents an untouched starter being mistaken for
completed work. The test packages are pinned in `Rules.Tests.csproj` and `packages.lock.json`; if restore fails,
use the prepared classroom cache — do not claim tests passed from an old console output.

## Concepts

A public method annotated `[Fact]` is one test; `Assert.Equal(expected, actual)` fails when the values differ.
`[Theory]` runs one method with several data rows; each `[InlineData(...)]` supplies arguments in parameter order:

```csharp
[Theory]
[InlineData("east", true, 1, 0, 5, null)]
[InlineData("west", false, 0, 0, 6, "ILLEGAL_ACTION")]
public void Initial_move(string direction, bool accepted,
    int x, int y, int moves, string? reason)
```

Do not compute the expected result by calling the same rule again. `FixedBoardProvider` always returns the board
passed to its constructor; `Engine` calls `provider.GetBoard()` when it applies a move, and `Calls` proves the
double was used. The double replaces board retrieval, not `Rules.EvaluateMove`.

Vocabulary: `Engine` is the action boundary (as in W4.07). It reports the rule engine's `EDGE`/`WALL` as
`ILLEGAL_ACTION` and `INVALID_ACTION` as `INVALID_REQUEST`, the categories the Week 5 API uses.

Demonstrations (two-row theory, F07 regression and its temporary mutant):
[../../examples/w4-08/](../../examples/w4-08/README.md).

## Work through the challenge

Spend 5 minutes predicting/reproducing, 25 implementing and checking, 10 comparing a normal and boundary path,
and 5 capturing your explanation.

1. Design rows for `south`, `north`, unknown direction (`upwards`) and `null` from the start. Write literal
   expected acceptance/reason and every state field before coding: south enters (0,1) with five moves; each
   rejected case stays (0,0), six moves, score zero, empty collected IDs and `playing`.
2. Write a theory using `FixedBoardProvider` and `Engine`. Assert provider use and input immutability as well as
   the result.
3. Add a fact: east then south into the wall. Assert every state field remains unchanged, with `ILLEGAL_ACTION`.
   Keep the supplied F07 regression.
4. Run the suite, deliberately make one expected move count wrong to prove the test fails, restore it and rerun.
   Explain which dependency was isolated.

## Completion and individual evidence

All supplied and learner tests pass after restoring correct expectations. South reaches (0,1), five moves; all
other added start rows reject with unchanged state. The wall regression checks all fields. Each learner explains
the double and shows a specific red/green assertion. Submit changed source, exact commands and observed outcomes
using [evidence.md](evidence.md).

## Hints and recovery

* **Hint 1.** One `[InlineData]` row per direction; `string?` lets a row pass `null`.
* **Hint 2.** Snapshot the input (e.g. serialise it) before `Apply` and compare afterwards.
* **Hint 3.** An assertion on `Accepted` alone misses a rejected move that still spends a move: assert every field.

Save a copy before resetting. A compile error means no test ran — that is different from a failing assertion that
exposes a bug. If a tool is unavailable, retain the learning need and schedule the actual check.

## Knowledge check

1. What do Theory and InlineData do?
2. Which dependency does FixedBoardProvider control, and what still executes?
3. Why does a rejection test need more than `Assert.False(actual.Accepted)`?
4. Why must F07 expect won when movesRemaining is zero?
5. Both engines compute your expected value and actual value. What is wrong with that test?
