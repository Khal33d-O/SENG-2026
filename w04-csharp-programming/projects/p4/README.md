# P4 · Tested C# game engine

Build a C# rule library and console demonstration that agree with your playable TypeScript game's agreed small
slice. You have **540 minutes**: Thursday afternoon 180 minutes and Friday 360 minutes (W4.10's 120-minute
preparation is separate). Keep your game's identity; assessment is about actions, invariants and explanation
rather than visual complexity.

## What you start with and what you own

The self-contained [starter](starter/) supplies typed reference-board/state/action/result models
(`Rules/Models.cs`), initial state (`Rules.InitialState`), JSON parsing (`Rules/BoardJson.cs`), a console
(`ConsoleApp/`), the thirteen independent fixture cases (`fixtures/F01.json` … `F11.json`, incl. F09A/F09B and
F10A/F10B, byte-identical to `source/shared/fixtures/treasure/`, plus `board-reference.json`), a TypeScript
reference engine and runner (`typescript/src/rules.ts`, `runner.ts`), the comparison script `compare.py`, a
deterministic provider (`Rules/BoardProvider.cs`: `IBoardProvider`, `FixedBoardProvider`, `GameEngine`) and a
compiling API skeleton (`ApiSkeleton/`). The library's `EvaluateMove` deliberately throws `NotImplementedException`.

**You own:** the implementation of `Rules.EvaluateMove`, meaningful deterministic tests in `Tests/`, one independent
fixture you add to `fixtures/`, the handover ([starter/HANDOVER.md](starter/HANDOVER.md)) and the plan
([starter/PLAN.md](starter/PLAN.md)). You may reuse your own W4.08 tests after checking their namespace and project
reference; a complete earlier lab is not required.

## Tools

.NET SDK 10.0.401, Node 24.13.0 and Python 3 from the W4.01 prepared terminal (local `global.json` rolls forward
from 10.0.100; any Node ≥ 22.18 runs the `.ts` runner directly). Test dependencies are pinned in
`Tests/Rules.Tests.csproj` (Microsoft.NET.Test.Sdk 17.14.1, xunit 2.9.3, xunit.runner.visualstudio 3.1.4) and
`Tests/packages.lock.json`. No application secrets or environment variables are needed. On Windows use `py -3` or
`python` where the book writes `python3`.

Copy the starter to your own project folder and run these commands from that folder:

```bash
dotnet build Rules/Rules.csproj
dotnet run --project ConsoleApp/ConsoleApp.csproj -- fixtures/F01.json
dotnet run --project ConsoleApp/ConsoleApp.csproj -- fixtures/F02.json
dotnet test Tests/Rules.Tests.csproj
```

**Initially** the build and F01 pass; F02 throws `NotImplementedException`; one supplied initial-state test passes
(`Passed: 1`). That one passing test is not completion. After implementing actions, `python3 compare.py` must
compare actual C# and TypeScript outcomes against every independent expected fixture (initially `12 of 13
fixture(s) failed`). `dotnet build ApiSkeleton/ApiSkeleton.csproj` checks the reusable project boundary.

The complete teaching checkpoint ([../../labs/w4-10/starter](../../labs/w4-10/starter/)) is a recovery option and the
ready library seam for Week 5. Save your own work before opening it, record any copied implementation, demonstrate a
bounded change yourself, and retain unfinished learning needs. Copying it unchanged does not demonstrate this
project's objectives.

## Agree the smallest slice

**Default treasure hunt** (see `source/shared/contract/GAME-CONTRACT.md`): validate direction/type; reject walls and
edges without changing state; charge one move per accepted action; collect each treasure for ten points once; win on
reaching the exit with treasure, including the final move; otherwise lose at zero; reject actions after completion.
Rendering and real time do not determine the result. Restart means a fresh initial state, never mutating a completed
state. Rule reasons are `WALL`, `EDGE`, `INVALID_ACTION` and `GAME_COMPLETE`; external JSON stays camelCase.

**Another genre** (target range, flight checkpoint, RPG slice): keep your earlier state/action/config definitions,
bring your own TypeScript source and independent fixtures into the project folder before starting, replace the
supplied TypeScript runner/config and C# models together, document equivalent normal/invalid/completion fixtures
and agree the mapping with the instructor at the first checkpoint. Do not change only the JSON board: the supplied
TypeScript runner uses a fixed board. Physics, aiming, cameras and new game frameworks are out of scope.

Your plan (`PLAN.md`) names the action, state fields, invariant, invalid case, progress update and completion
condition, with one normal expected result and one rejected unchanged result recorded before implementation. Keep
library code independent of Console, ASP.NET and storage.

## Milestones within the 540 minutes

| Time | Work and checkpoint | Evidence before continuing |
|---|---|---|
| Thu 0–30 | Preserve earlier work, choose slice and annotate library interface | Contract note and independently predicted normal/invalid outcomes |
| Thu 30–90 | Implement input validation and accepted movement/progress | F01–F04 (or agreed equivalents); original input unchanged |
| Thu 90–150 | Add treasure/progress and completion priority | F05–F08 and F11; final-move win explained |
| Thu 150–180 | Thursday checkpoint and recovery | Console normal + rejected case; next-day defect list |
| Fri 180–270 | Complete boundary rules and deterministic unit tests | Parameterised legal/illegal/boundary tests with provider double; completed-state and malformed-input cases |
| Fri 270–360 | Reproduce a known defect and retain a regression test | F07 or equivalent red/green evidence; test explains independently chosen expectation |
| Fri 360–450 | Compare TS/JSON/C# fixtures; diagnose mismatch; add a case | Every shared case and one learner fixture agree on all fields; preserved mismatch diagnosis |
| Fri 450–510 | Package library, build supplied API skeleton, write handover | Exact clean run/check commands, dependencies and seam signature |
| Fri 510–540 | Individual demonstration and final recovery record | Each learner drives a normal, rejected and completion case and explains ownership |

These are checkpoints of one project, not separate challenges. At each checkpoint, stop adding features if the core
evidence is missing; use the saved starter or teaching checkpoint to recover a runnable baseline.

## Tests and comparison contract

Write real xUnit tests in `Tests`. Use `[Theory]`/`[InlineData]` with the supplied `FixedBoardProvider` so board
selection cannot vary, and keep the real rule operation under test. Cover legal movement, malformed input, wall/edge
rejection, completion and a boundary (zero-budget winning move). A rejection assertion checks acceptance/reason and
all state fields; accepted and rejected calls must leave the original input unchanged. Assert literal expected values
or independently authored fixture values, never output computed by the engine under test.

Add one new case calculated before running. A learner fixture may hold one `"action"` (like the shared files) or an
`"actions"` array applied in order from `"state"` (null = initial state); both runners support it. Record at least one
mismatch: input, differing field, expected rule, cause, repair and rerun. Do not change an expectation just to get parity.

```bash
dotnet test Tests/Rules.Tests.csproj
python3 compare.py
dotnet run --project ConsoleApp/ConsoleApp.csproj -- fixtures/F07.json
dotnet build ApiSkeleton/ApiSkeleton.csproj
```

**Expected final reference results:** all tests pass, all thirteen shared cases plus your new case pass, F07 displays
score 10 / moves 0 / status won, and the API skeleton builds. Test counts may differ with your authored cases; no
skipped placeholder counts as evidence.

Optional TypeScript check with the pinned compiler: `cd typescript && npm ci && npm run typecheck` (TypeScript 5.9.3),
or `npm run build` then `python3 compare.py --ts-dist`.

## Handover for Week 5

Include source, fixtures, test output and a README (`HANDOVER.md`) with exact setup/run/check commands. Name the method
accepting `(board, storedState, action)` and returning `(accepted, state, reason)` without mutating inputs. The API
skeleton's `RuleBoundary.Apply` is the integration seam; a project reference makes the library reusable. The skeleton
implements only health (`/health`), so do not claim session routes already work. Explain that the browser sends an
action while the API obtains authoritative stored state. Keep camelCase external fields. Record the future translation
of malformed input to 400 `INVALID_REQUEST`, illegal actions (WALL/EDGE) to 409 `ILLEGAL_ACTION` and completed actions
to 409 `GAME_COMPLETE`. Supply one example fixture command and its actual output.

## Completion and individual demonstration

Submit the evidence record ([evidence.md](evidence.md)) with source and runnable package. Completion requires a
reusable library, normal/invalid/progress/completion behaviour, deterministic parameterised tests plus a known-defect
regression, full fixture parity, console evidence and the compiling API seam. Each learner runs one supplied and one
authored case, explains why a rejection preserves state, identifies the dependency controlled by the double,
diagnoses a field mismatch and points to the API boundary. Explain any copied checkpoint work candidly. Do not use the
final group presentation as the only individual evidence.
