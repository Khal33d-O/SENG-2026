# W4.01 · Build and report a familiar C# fixture

**Session:** W4.01 C#, .NET and the development toolchain · **Challenge:** 45 minutes (Tasks 1–5: 6 + 11 + 10 + 9 + 9)

A familiar rule fixture can keep the same inputs and expected state while its caller changes language.
You build a supplied C# console, read the returned game state and correct a compiler diagnostic. The
rule implementation, project structure and fixture runner are provided; your code change is a short
console report.

## Outcomes

By the end, you can:

* Describe the roles of C#, the .NET SDK, runtime, project and solution.
* Compare the C# build/run process with the TypeScript toolchain used earlier.
* Write and execute a small C# console program in the supplied project structure.
* Explain a compiler diagnostic and correct the corresponding code.

## Supplied and owned

| Supplied (do not change) | You own |
|---|---|
| `global.json`, `Preflight.slnx`, `ConsoleApp/ConsoleApp.csproj`, `Rules/Rules.csproj` | Two report statements in `starter/ConsoleApp/Program.cs` |
| `Rules/Rules.cs` (complete rule library), `ConsoleApp/FixtureSupport.cs` (loader, runner, report) | Your diagnostic record and explanations in [evidence.md](evidence.md) |
| `fixtures/F01.json` … `fixtures/F04.json` + `board-reference.json` (shared, byte-identical) | |
| `check_report.py`, `Makefile`, `tests/probes/` (reporting budget probe, 9 starting moves) | |

| File | What it specifies | What to inspect |
|---|---|---|
| `global.json` | SDK selection | Version pin and roll-forward policy |
| `Preflight.slnx` | Group of projects | ConsoleApp and Rules paths |
| `ConsoleApp/ConsoleApp.csproj` | Executable project | OutputType Exe and project reference |
| `Rules/Rules.csproj` | Shared library project | Target framework net10.0 |

## Prerequisites and tool versions

Prepared terminal with .NET SDK 10.0.401, .NET runtime 10.0.12, Python 3 and Make. `global.json`
selects the SDK; `net10.0` selects the target framework. No account, API key or new package is needed.

> **Local note.** The book's `global.json` pins 10.0.401 with roll-forward disabled. This copy uses
> `{"sdk":{"version":"10.0.100","rollForward":"latestFeature"}}` so it also runs on any 10.0.1xx–4xx SDK.
> Without Make, run the checker directly: `python3 check_report.py` (Windows: `py -3 check_report.py`).

## Setup

From the lab directory:

```bash
cd starter
dotnet --version
dotnet --list-runtimes
dotnet sln Preflight.slnx list
dotnet restore Preflight.slnx
dotnet build Preflight.slnx --no-restore --disable-build-servers
dotnet run --project ConsoleApp/ConsoleApp.csproj --no-build -- fixtures/F02.json
make test
```

**Initial behaviour.** The untouched program builds and prints `PASS F02` for the supplied rule. It also
prints `Result report: pending`. The separate Python console checker exits 1 because your two report
lines are absent; `make test` reports that failed recipe with process exit 2. Read its named missing
lines before editing. A restore or compilation failure is a setup problem, not that expected starter result.

The check builds and runs a disposable copy. `bin/` and `obj/` are build output, not your hand-in.

## Before you start: predict

F02 starts at (0,0) with six moves and then moves east. F03 continues by attempting south into the wall
at (1,1). F04 instead attempts west from the starting edge. **Activity: Predict** — write the final
position and remaining moves for F03 and F04 before running anything.

## Worked examples (see [../../examples/w4-01/](../../examples/w4-01/README.md))

**Worked Example 1: Build the supplied console and library** — in a disposable copy of `demo/`:

```bash
dotnet sln Preflight.slnx list
dotnet restore Preflight.slnx
dotnet build Preflight.slnx --no-restore --disable-build-servers
dotnet run --project ConsoleApp/ConsoleApp.csproj --no-build -- fixtures/F02.json
```

The complete demo entry code loads a fixture, calls the supplied runner and prints its result:

```csharp
using PreflightSupport;
var fixture = FixtureLoader.Load(args);
var result = FixtureRunner.Run(fixture);
Console.WriteLine("Fixture: " + fixture.Id);
Console.WriteLine("Moves remaining: " + result.State.MovesRemaining);
return FixtureReport.Check(fixture, result);
```

**Worked Example 2: Correct a compiler diagnostic** — remove the semicolon from the move-report
statement and rebuild:

```bash
dotnet build Preflight.slnx --no-restore --disable-build-servers
```

Then open `ConsoleApp/FixtureSupport.cs` and locate the library call:

```csharp
result = Rules.EvaluateMove(fixture.Board, input, action);
```

## Task

A colleague wants a short console report of the actual returned position and move budget, followed by
the supplied full fixture comparison. Edit only `starter/ConsoleApp/Program.cs`. Keep loading,
execution, fixture identification and `return FixtureReport.Check(fixture, result);` intact. The required
two lines for F02 are:

```text
Result position: 1,0
Remaining moves: 5
```

The values must come from the returned result, so the same program works for every supplied fixture and
a different initial budget.

### Task 1: Establish the starting observation (6 minutes)
Run the setup sequence. Save the F02 output and the expected incomplete-report result from `make test`.
Open `ConsoleApp/ConsoleApp.csproj`, `Rules/Rules.csproj` and `Preflight.slnx`; annotate which file
declares the executable and which includes the library.

### Task 2: Write the returned-state report (11 minutes)
Replace the pending line with two C# console statements. Use the supplied property map:
`result.State.Position.X`, `result.State.Position.Y`, `result.State.MovesRemaining`. Use string
concatenation as demonstrated. Predict F01 and F03 before running them. Build current source, then run
`make test`. Do not copy a number from the expected fixture into the program.

### Task 3: Explain and correct a compiler diagnostic (10 minutes)
Save a copy of your working `Program.cs` outside the project. Remove the ending semicolon from one of
your new `Console.WriteLine` statements. Build and retain the actual diagnostic (file, line, code).
Restore the semicolon, rebuild and execute F03. Do not present an old `--no-build` run as evidence that
broken current source compiled.

### Task 4: Diagnose a failed run after a successful build (9 minutes)
Use one minute to compare your F03/F04 report checks. Then, from your working starter directory,
execute this handover command and save the actual message:

```bash
dotnet run --project Rules/Rules.csproj --no-build -- fixtures/F03.json
```

Record the last successful stage and choose a next observation: the project declarations, the console
statement, or the rule implementation. Decide between changing the selected project, changing a
project's `OutputType`, or changing the rule source; justify one remedy, reject the other two, and retain
the actual F03 report. Use the last two minutes for the billing-tool transfer (paper case): record a
proposed command and the observation that would confirm it.

### Task 5: Explain the build and library boundary (9 minutes)
Record a small comparison with the TypeScript workflow (source file, build command, output, execution
command, runtime). Locate `Rules.EvaluateMove(fixture.Board, input, action)` in
`ConsoleApp/FixtureSupport.cs`; name its three inputs and returned `MoveResult` and the fields your
report reads.

## Acceptance criteria

* Current supplied solution builds; the two new console lines read returned position and move budget for
  F01–F04 and the reporting budget probe.
* `make test` passes after your change; saved output distinguishes the rule's full comparison from the
  console report assertions.
* A real missing-semicolon diagnostic and your explanation are retained, followed by a successful rebuild
  and F03 run after correction.
* Your failed-run record names the last successful stage, inspected evidence, chosen correction and two
  rejected remedies; the corrected selection produces the actual F03 report without changing project
  settings or rules. Your billing transfer states a proposed command and confirming observation.
* Your TypeScript/C# comparison distinguishes compiling source from executing built output and names
  SDK, runtime, project and solution roles.
* You identify the rule call's board/state/action inputs and returned result, and limit your claim to the
  cases actually checked.
* Each learner retains an individual explanation and an assistance record.

## Hints

* **Hint 1 — locate the value.** The report describes the completed action sequence: which object holds
  the state *after* the action — the board, the expected fixture or the returned `result`?
* **Hint 2 — read the diagnostic.** `CS1002` gives file(line,column): inspect that statement first; the
  compiler wants a statement terminator, not a fixture change.
* **Hint 3 — check the expression.** `"Result position: " + result.State.Position.X + "," + ...` — compare
  your label character by character with the required line.

## Individual evidence

Show one of your console statements and explain the label, selected returned property and semicolon.
Then show your actual compiler diagnostic and the successful rebuild after its correction. Name the
library's expected input/output using one fixture. Use [evidence.md](evidence.md).

## Recovery and teardown

Preserve a blocked command and its working directory before trying a correction. For a missing fixture
file, check the argument path from the working directory. For a missing SDK, use the prepared environment
(do not change the SDK pin to guess a replacement). For CS1002, inspect the indicated statement. For a
wrong report line, inspect the returned-field expression. `bin/` and `obj/` can be deleted afterwards.

## Optional depth

Change only the demo's output label in a disposable copy; run `dotnet run --no-build` before rebuilding
and observe the old label, then rebuild and compare.

## Knowledge check (answers in facilitated feedback)

1. A colleague has a machine with only the .NET runtime and wants to build the supplied C# solution. Which explanation identifies the missing role?
2. You change a console label after a successful build. A run with `--no-build` still prints the old label. Which next step verifies the new source?
3. For F03, the board starts with six moves. The actual result after east and a rejected wall move has five. Which expression supplies the report's move budget?
4. A build reports Program.cs with CS1002 and the message `; expected` after a console statement. Which response provides evidence of the correction?
