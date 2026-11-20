# W4.02 · Represent values and handle independent absence

**Session:** W4.02 C# types, values and nullability · **Challenge:** 45 minutes (5 + 10 + 10 + 12 + 8)

The console can print a number even when it has lost the value the display was meant to preserve. It can
also build successfully and then fail when an optional result is absent. You use the supplied
position/result models to represent game values and handle optional data explicitly.

## Outcomes

* Describe common C# value and reference types using a supplied data model.
* Explain how nullable values affect the safe handling of an optional result.
* Write typed representations of numeric values, structured data and application status.
* Debug type-conversion and nullability problems in supplied examples.

## Supplied and owned

| Supplied (keep unchanged) | You own |
|---|---|
| `Preflight.slnx`, `global.json`, both `.csproj` files (net10.0, C# 14, nullable enabled, warnings not errors) | The marked region of `starter/ConsoleApp/Program.cs` |
| `Rules/Rules.cs` — records `Position`, `GameState`, `MoveResult` … and the rules | Your probes, predictions and diagnostic record in [evidence.md](evidence.md) |
| `ConsoleApp/FixtureSupport.cs` — loader, runner, `FixtureReport.Check`, `DisplaySelector` | |
| `fixtures/F01–F04.json`, `board-reference.json`; `check_report.py`, `Makefile`; `proposals/` (Task 4) | |

The supplied setup exposes `actual`, `optionalScore` (`int?`), `optionalResult` (`MoveResult?`) and
`measuredScore` (`double`). The last is a diagnostic display example, separate from the game's integer
score. All supplied measurements are finite and inside int range.

## Prerequisites

.NET SDK 10.0.401, runtime 10.0.12, Python 3 and Make (local copy: `global.json` rolls forward from
10.0.100; without Make use `python3 check_report.py`, on Windows `py -3 check_report.py`).

## Setup

From the lab directory:

```bash
cd starter
dotnet restore Preflight.slnx
dotnet build Preflight.slnx --no-restore --disable-build-servers
dotnet run --project ConsoleApp/ConsoleApp.csproj --no-build -- fixtures/F02.json
    present 2.75
make test
```

(The `run` command is one line: `... -- fixtures/F02.json present 2.75`.)

**Initial behaviour.** The untouched source builds, runs the supplied fixture comparison (`PASS F02`) and
prints `Typed report: pending`. The Python checker exits 1 because the required reports are absent
(`Typed report check: FAILED (6 of 6 cases)`); Make propagates that failed recipe as exit 2.

## Concepts to reuse

Construct the supplied position without defining a type:

```csharp
Position position = new Position(1, 0);
int score = 0;
string status = "playing";
```

Guard the value being read:

```csharp
if (optionalScore.HasValue)
    Console.WriteLine(optionalScore.Value);
else
    Console.WriteLine("absent");
```

For the supplied record class use `if (optionalResult is not null)` before its properties. Worked
examples: [../../examples/w4-02/](../../examples/w4-02/README.md) (present/absent runs and the unsafe variants).

## Task

For `F02.json present 2.75`, the required added output is:

```text
Values: 1,0|0|playing
Measurement: 2.75
Whole part: 2
Optional score: 0
Optional result: True|playing
```

Use the actual returned position/score/status. Construct a `Position` with `new Position(x, y)`; no new
model is needed. Preserve the supplied `FixtureReport.Check` call. Labels and `|` separators are fixed.

| Mode | Optional score | Optional result | Required interpretation |
|---|---|---|---|
| `present` | present | present | Report each supplied value. |
| `absent` | absent | absent | Print `absent` for each field. |
| `score-only` | present, possibly zero | absent | Keep the score; do not invent a result. |
| `result-only` | absent | present, possibly rejected | Keep the result; do not invent a score. |

### Task 1: Confirm the starting program (5 minutes)
Run setup and retain the fixture result plus the expected incomplete-report failure. Inspect the records in
`Rules/Rules.cs` and the optional declarations in `Program.cs`. Mark `Position` and `MoveResult` as
reference types, `int` and `double` as value types, and explain what each `?` permits.

### Task 2: Write typed values and preserve the measurement (10 minutes)
Declare position, score and status from the returned values; produce the first three lines. Keep the full
measurement as `double`; explicitly convert only the whole part. Predict 3.5 and -2.75 before running.

### Task 3: Handle each optional field (10 minutes)
Write a present/absent branch for the nullable score (`HasValue` before `Value`) and another for the
nullable result (null check before `Accepted` or `State.Status`). Do not use `!` or replace absence with
zero. Run both `present` and `absent` for F02.

### Task 4: Choose checks that distinguish two compiling proposals (12 minutes)
Both supplied proposals compile and pass `F02.json present 2`. Proposal A (`proposals/ProposalA.Program.cs`)
changes the full measurement to `(int)measuredScore`. Proposal B (`proposals/ProposalB.Program.cs`) adds
`optionalResult is not null &&` to the score's `HasValue` condition. Choose two input triples — one exposing A
while B satisfies it, one exposing B while A satisfies it — and predict the distinguishing line. In a
disposable copy, copy a proposal into `ConsoleApp/Program.cs` and run
`dotnet run --project ConsoleApp/ConsoleApp.csproj -- fixtures/FIXTURE.json MODE MEASUREMENT` (this builds
current source). Return to your own source and run `make test` (six cases, including a negative fraction).

### Task 5: Retain a diagnostic and explain the correction (8 minutes)
Save your working `Program.cs`, change the full-measurement declaration to `int displayedScore = measuredScore;`,
build and retain the actual CS0266 diagnostic. Restore, rebuild and rerun the full check.

## Acceptance criteria

* Current source builds and reports the actual typed position, integer score and string status.
* Full measurements 2.75, 3.5 and -2.75 are preserved; whole parts are 2, 3 and -2.
* Present zero, absent score, present result, absent result and rejected-but-present result stay distinguishable.
* Score-only and result-only report the available field without inventing the other; `make test` passes all six cases.
* Two chosen input triples distinguish the proposals in opposite directions, with predictions, observations and reasons.
* Actual CS0266 and its explanation are retained, followed by the corrected current build and check.
* Each learner explains the null guard and conversion choice, with assistance recorded.

## Hints

* **Hint 1 — classify the supplied types.** Which declarations are value types and which refer to objects?
* **Hint 2 — preserve the intended value.** A cast that compiles can still discard the fraction the full line needs.
* **Hint 3 — guard each independent field.** The score's guard says nothing about the result; give each its own branch.

## Individual evidence

Show a changed-input prediction and its actual output. Name the value whose presence the guard
establishes, explain why the other field's guard would be insufficient, and connect your conversion
correction to the required full measurement.

## Recovery and teardown

Separate a missing SDK, a compiler error, a nullable warning, a runtime exception and a report assertion.
A report failure after `PASS` usually points to the marked region or the input mode. The checker builds
disposable copies and removes them. Generated `bin/obj` directories are not the hand-in. Save your working
copy before using a checkpoint.

## Optional depth

Transfer to a sensor display receiving `double? reading`: predict output for a zero reading and an absent reading.

## Knowledge check

1. The declaration is `record Position(int X, int Y)`. A second variable receives the first and is then assigned a new Position. Which account fits?
2. A `MoveResult?` is null. A colleague adds `!`; CS8602 disappears but the absent run still throws. What does that support?
3. The console must preserve 3.5 and report its whole part. `int displayedScore = measuredScore;` fails with CS0266. Which representation satisfies both?
4. Score-only prints absent despite a valid zero; the score branch requires both conditions. Which correction and confirming observation fit?
