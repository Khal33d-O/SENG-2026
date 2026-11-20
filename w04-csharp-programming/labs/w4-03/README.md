# W4.03 · Select the first open candidate

**Session:** W4.03 Methods, control flow and assertions · **Challenge:** 45 minutes (5 + 12 + 12 + 10 + 6)

A method can return a correct result for the first item and still be wrong for the collection. You connect
familiar TypeScript rule behaviour to a C# method, then select the earliest open position from supplied
candidates. The models, collection construction and assertion runner are prepared; your work is one
method body, chosen expectations and an explanation supported by current-source execution.

## Outcomes

* Describe method inputs, results and the minimal array/list syntax used by the example.
* Compare a C# rule calculation with its familiar TypeScript equivalent.
* Write the rule method using supplied models and explicit control flow.
* Write expected results for normal and boundary inputs and run the supplied checks.

## Supplied and owned

| Supplied (keep unchanged) | You own |
|---|---|
| `Preflight.slnx`, `ConsoleApp/ConsoleApp.csproj`, `Rules/Rules.csproj`, `global.json` | The body of `FindFirstOpenPosition` in `starter/Rules/CandidateRules.cs` |
| `Rules/Models.cs`, `Rules/Rules.cs`, `Rules/PositionRules.cs` (complete `IsOpenPosition`) | Two orders and expected positions in `fixtures/learner-cases.json` |
| `ConsoleApp/Program.cs`, `ConsoleApp/CaseSupport.cs` (assertion transport) | Predictions, caller diagnosis and explanations in [evidence.md](evidence.md) |
| `fixtures/candidate-cases.json` (10 fixed cases), `test_candidates.py`, `Makefile` | |
| `../../assets/w4-03/diagnostic-caller.cs`, `diagnostic-cases.json` (Task 3/4) | |

## Prerequisites

SDK 10.0.401, runtime 10.0.12, C# 14/net10.0, Python and Make (local `global.json` rolls forward from
10.0.100; without Make: `python3 test_candidates.py`, on Windows `py -3 test_candidates.py`). Git Bash
(or any POSIX shell) for the `cp`/`cmp` commands.

## Setup

From the lab directory:

```bash
cd starter
dotnet restore Preflight.slnx
dotnet build Preflight.slnx --no-restore --disable-build-servers
dotnet run --project ConsoleApp/ConsoleApp.csproj --no-build --
    fixtures/candidate-cases.json
make test
```

(The `run` command is one line ending `-- fixtures/candidate-cases.json`.)

**Initial behaviour.** The starting method returns null for every array. It builds, but the fixed cases report
`Candidate assertions: 14/30; cases=10; failures=16`: empty/all-blocked results and all preservation checks
pass; eight expected positions fail on both calls. Python exits 1; Make reports its failed recipe with exit 2.

## Concepts and worked examples

The supplied predicate's declaration and the minimal array syntax:

```csharp
public static bool IsOpenPosition(
    Board board, Position candidate)
```

```csharp
Position[] positions =
    [new Position(1, 1), new Position(2, 0)];
```

`foreach (Position position in positions)` visits the array in increasing index order. Worked Example 1
(complete method body, in `Rules/PositionRules.cs`):

```csharp
if (candidate.X < 0 || candidate.X >= board.Width ||
    candidate.Y < 0 || candidate.Y >= board.Height)
{
    return false;
}
foreach (Position wall in board.Walls)
{
    if (wall.X == candidate.X && wall.Y == candidate.Y)
    {
         return false;
    }
}
return true;
```

From a disposable copy of [../../examples/w4-03/demo](../../examples/w4-03/README.md):

```bash
dotnet restore Preflight.slnx
dotnet build Preflight.slnx --no-restore --disable-build-servers
dotnet run --project ConsoleApp/ConsoleApp.csproj --no-build -- fixtures/position-cases.json
```

## Task

Write one method body in `starter/Rules/CandidateRules.cs`, then choose two candidate orders and expected
positions in `fixtures/learner-cases.json`. Keep the supplied signature:

```csharp
public static Position? FindFirstOpenPosition(
    Board board, Position[] candidates)
```

Use an ordinary `foreach` or `for` loop. `PositionRules.IsOpenPosition(board, candidate)` is complete; do not
rewrite it or use LINQ to replace the loop. The selection contract:

* Inspect candidates in their supplied array order and return the earliest open position.
* An unsuitable candidate does not establish that every later candidate is unsuitable.
* Return null when the array is empty or none of its positions is open.
* Preserve the board and the candidate array, including their order.

This helper does not execute a move, check adjacency, spend a move budget, collect treasure or find a route.

### Task 1: Read the callable boundary (5 minutes)
Locate the signature; mark the two parameters, return type and method body. Find the call in
`ConsoleApp/CaseSupport.cs` and distinguish its arguments from the parameter names. State why the
starting source can compile while failing its result checks.

### Task 2: Write the selection method (12 minutes)
Implement the body with an ordinary loop. Run `python test_candidates.py --fixed-only` and read actual,
expected, repeated and preserved. A method returning the last open position, or stopping after the first
blocked one, may succeed on simple inputs and still violate the contract.

### Task 3: Complete the baseline and select a diagnostic observation (12 minutes)
Five minutes: complete the two orders in `learner-cases.json` — each an ordering of the supplied `pool`,
with different expected open positions and a blocked-first case — and run `make test`.
Seven minutes: from the lab directory make a disposable copy of your completed starter:

```bash
cp -R starter caller-copy
cp ../../assets/w4-03/diagnostic-caller.cs caller-copy/ConsoleApp/Program.cs
cp ../../assets/w4-03/diagnostic-cases.json caller-copy/fixtures/diagnostic-cases.json
cd caller-copy
cp Rules/CandidateRules.cs method-before.cs.txt
cp fixtures/diagnostic-cases.json cases-before.json.txt
dotnet run --project ConsoleApp/ConsoleApp.csproj --disable-build-servers --
    fixtures/diagnostic-cases.json
```

The caller must select the first open position from each case's `PlannedCandidates`; `DisplayCandidates` is
a separate preview order. The output has one passing and one failing comparison; the cause is not named.
Before feedback, choose an observation that distinguishes at least two explanations (wrong method,
unexpected call argument, mistaken expectation) and predict its result under each. You may add a temporary
`Console.WriteLine` or make a controlled call with a chosen array.

### Task 4: Resolve the mismatch and verify the correction (10 minutes)
Perform the observation, decide which boundary needs correction (do not change an expectation solely to
agree with output), make the smallest justified correction in `caller-copy` and rerun:

```bash
dotnet run --project ConsoleApp/ConsoleApp.csproj --disable-build-servers --
    fixtures/diagnostic-cases.json
```

```bash
cmp Rules/CandidateRules.cs method-before.cs.txt
cmp fixtures/diagnostic-cases.json cases-before.json.txt
cd ../starter
```

Matching files produce no output and exit zero. Back in the starter, predict the fixed exact-width case (C04)
before its confirming run.

### Task 5: Explain and preserve the evidence (6 minutes)
Run the complete current-source check. Retain your method, orders and predictions, the caller mismatch and
predicted observation, the correction and your boundary explanation.

## Acceptance criteria

* Current method builds and uses an ordinary loop in the supplied shell.
* Ten fixed cases pass 30 assertions covering first/repeated result and preserved inputs.
* Two chosen orders use the supplied pool, have different correct expected positions and include a
  blocked-first case; both pass six further assertions.
* The guided orders fit the published policy; the caller diagnosis distinguishes at least two causes before feedback.
* The caller mismatch has a chosen observation, competing predictions, actual output and a justified
  correction; both caller comparisons pass, with method/case byte comparisons retained.
* Each learner predicts the exact-width boundary before running it, explains the optional result and records assistance.

## Hints

* **Hint 1 — read the method boundary.** Which parameter holds the ordered candidates, and what does `Position?` allow you to return?
* **Hint 2 — trace the loop's evidence.** Which observation is enough to return a position? Which can only be known after the loop?
* **Hint 3 — choose a distinguishing order.** Put a blocked candidate first and two different open ones later; which one must win?

## Individual evidence

Predict a boundary input's result before running the rule check: the exact-width candidate followed by an
in-bounds candidate. Explain why the first is rejected and why the method can still return a later position.
Then explain how your selected observation distinguished competing causes in the caller mismatch.

## Recovery and teardown

A missing SDK, compiler error, malformed case file and assertion mismatch need different observations. If
only preservation fails, a correct position does not satisfy the contract. If no assertions ran, confirm the
case path. The verifier uses disposable copies; delete `caller-copy/` and `bin/obj` afterwards.

## Optional depth

Paper transfer: a warehouse map with blocked storage cells — is X equal to width usable, and does an empty
blocked-cell array permit every coordinate?

## Knowledge check

1. The declaration receives `Board board` and `Position[] candidates`, returning `Position?`. Which account fits this method?
2. `IsOpenPosition` meets a non-matching wall before a later matching wall. Which translation preserves the Boolean rule?
3. An array starts with a blocked position and then two different open positions. Which control flow fits?
4. A width-three board case supplies (3,0) then open (2,0); a learner expects no position, the method returns (2,0). What should be checked and corrected?
