# W4.07 lab · Repair a seeded failure and action boundary

**Session:** W4.07 Exceptions and debugging · One 45-minute practical challenge within the 120-minute module
(10 retrieval and prediction, 20 concepts, 20 worked demonstrations, 45 challenge, 15 comparison and repair,
10 individual knowledge checks and recovery).

Work in your own copy of `starter`; save the original so you can recover. The package is self-contained.

## Outcomes

* Distinguish an invalid game action (an expected rejection) from a program failure.
* Read an exception and its stack trace, starting from the first frame in our own source.
* Reproduce and locate a failing path with a bound debugger breakpoint, Step Over and Continue.
* Handle expected invalid input explicitly without hiding unexpected defects.

## Start and ownership

Use the academy shell prepared in W4.01 and .NET SDK 10.0.401 (`dotnet --version`). In the authoring repository
the facilitator runs `source designer/build/tooling/environment.sh`; that designer file is not published. In
this distribution, [environment.sh](environment.sh) is the learner-side equivalent: `sh environment.sh` checks
the prepared terminal and changes nothing. No application environment variables or secrets are needed.

Commands below begin at the repository root, which in this course repository is the **`source/`** folder.

**You edit:** `ActionBoundary.cs` — repair `TreasureLabel` for the known reference board and return an
explicit invalid result from `Apply`. Keep `Program.cs` and the full rule engine (`Rules/`) supplied.

```bash
dotnet run --project learner/units/w04-csharp-programming/labs/w4-07/starter/Probe.csproj --
    fault
```

(One line: `... /starter/Probe.csproj -- fault`.) Other modes: `invalid`, `missing`, `west`, `east`, `unexpected`.

**Initial behaviour.** The starter builds but `fault` throws `IndexOutOfRangeException`; `invalid` (and `missing`)
throws `ArgumentException`. Neither is a toolchain failure.

## Concepts in brief

* West from (0,0) is an understandable request the rules reject: `Accepted` false, `Reason` `ILLEGAL_ACTION`,
  every `State` field unchanged. Missing or unknown direction is `INVALID_REQUEST`. Neither should terminate
  the console or spend a move.
* Reading an array element that does not exist is a broken programmer assumption. Returning `ILLEGAL_ACTION`
  would blame a valid request and hide the defect.
* `MoveResult` carries `Accepted`, `State` and optional `Reason`; `new(false, state, "INVALID_REQUEST")`
  constructs it, and returning `state` preserves the existing state.
* `throw new ArgumentException("Unknown direction")` throws; it does not return a game result. `board.Treasasures`
  fails at compile time (misspelt); `board.Treasures[1]` compiles but fails at runtime on this board.
* `catch (IOException)` selects one family; `catch (Exception)` selects almost everything and can hide
  programming faults. No `catch` is needed around ordinary move validation.

Contract note: the rule engine's own reasons are `EDGE`/`WALL`/`INVALID_ACTION` (shared contract); `Apply` is the
action boundary and reports the API categories `ILLEGAL_ACTION`/`INVALID_REQUEST`. The probe prints both.

Demonstrations: [../../examples/w4-07/](../../examples/w4-07/README.md).

## Work through the challenge

Spend 5 minutes predicting/reproducing, 25 implementing and checking, 10 comparing a normal and boundary path,
and 5 capturing your explanation.

1. Reproduce `fault`, save its stack trace and bind a debugger breakpoint on the array read. Record `index`,
   array `Length` and caller.
2. Repair the seeded lookup. Run the same case and explain why it now prints `t1`.
3. Replace the expected invalid-input `throw` with an unchanged-state `MoveResult`. Verify `invalid`, `missing`,
   `west` and `east` using the table below.
4. Run `unexpected` and retain its visible fault. Explain why a broad `catch` would be misleading.

| Mode | Expected after your repair |
|---|---|
| `fault` | `first treasure label: t1` |
| `invalid` (`upwards`) | `boundary: accepted=False reason=INVALID_REQUEST`, x=0, six moves |
| `missing` (null) | `INVALID_REQUEST`, x=0, six moves |
| `west` | `ILLEGAL_ACTION` (rule engine reason `EDGE`), unchanged state |
| `east` | accepted, x=1, five moves |
| `unexpected` | still an unhandled `NullReferenceException` (deliberate null board) |

## Completion and individual evidence

A repaired fault prints `t1`; missing/unknown input returns `INVALID_REQUEST` without state change; `west` returns
`ILLEGAL_ACTION`; `east` succeeds; `unexpected` remains an exception. Each learner explains an observed debugger
stop and the two different handling choices. Submit changed source, exact commands and observed outcomes using
[evidence.md](evidence.md). Pair work is welcome, but each learner demonstrates one case without their partner
driving.

## Hints and recovery

* **Hint 1.** An array of length one has only index zero: what is `Length` here, and which index does the seed read?
* **Hint 2.** The expected-input branch should *return* a result: `new(false, state, "INVALID_REQUEST")`.
* **Hint 3.** Keep `unexpected` failing: no `try`/`catch` in `Apply` or `Program.cs`.

Save a branch or copy before resetting. Open a fresh starter and isolate one failing command. A breakpoint that
never binds is not evidence of execution: build the current Debug assembly and check the source path. If a tool
is unavailable, retain the learning need and schedule the actual check rather than declaring it passed.

## Knowledge check

1. West from the initial state is rejected. Should the move budget change? Why?
2. An array of length one is indexed at one. Identify the fault and the first useful stack frame.
3. Why is `catch (Exception)` returning ILLEGAL_ACTION a poor repair?
4. Show your actual debugger stop. What were index and the treasure array size? What happened on Step Over?
5. How should missing direction differ from a null trusted board?
