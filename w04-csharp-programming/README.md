# Week 4 · C# Programming

The familiar treasure-hunt rules move from TypeScript to C#. Each session is a 120-minute module with one
practical challenge; the week ends with Project 4, a tested C# rule library that agrees with the TypeScript game on
the shared fixtures and is ready for the Week 5 API.

| Id | Session | Lab | Worked examples | Starter's initial state |
|---|---|---|---|---|
| W4.01 | C#, .NET and the development toolchain | [labs/w4-01](labs/w4-01/README.md) | [examples/w4-01](examples/w4-01/README.md) | `PASS F02`, `Result report: pending`; checker exits 1 |
| W4.02 | C# types, values and nullability | [labs/w4-02](labs/w4-02/README.md) | [examples/w4-02](examples/w4-02/README.md) | `Typed report: pending`; 0 of 6 cases |
| W4.03 | Methods, control flow and assertions | [labs/w4-03](labs/w4-03/README.md) | [examples/w4-03](examples/w4-03/README.md) | `Candidate assertions: 14/30; cases=10; failures=16` |
| W4.04 | Classes and encapsulation | [labs/w4-04](labs/w4-04/README.md) | [examples/w4-04](examples/w4-04/README.md) | `Session assertions: 79/98; cases=10; failures=19` |
| W4.05 | Interfaces and composition | [labs/w4-05](labs/w4-05/README.md) | [examples/w4-05](examples/w4-05/README.md) | `Checks: 11/18 passed`, exit 1 |
| W4.06 | Collections, generics and LINQ | [labs/w4-06](labs/w4-06/README.md) | [examples/w4-06](examples/w4-06/README.md) | `Assertions: 6/17 passed`, exit 1 |
| W4.07 | Exceptions and debugging | [labs/w4-07](labs/w4-07/README.md) | [examples/w4-07](examples/w4-07/README.md) | `fault` throws IndexOutOfRangeException |
| W4.08 | Unit tests and test doubles | [labs/w4-08](labs/w4-08/README.md) | [examples/w4-08](examples/w4-08/README.md) | 3 pass, `Complete_the_challenge` fails |
| W4.09 | Async file loading and failure handling | [labs/w4-09](labs/w4-09/README.md) | [examples/w4-09](examples/w4-09/README.md) | throws NotImplementedException |
| W4.10 | Project preparation: translating rules and checking parity | [labs/w4-10](labs/w4-10/README.md) | [examples/w4-10](examples/w4-10/README.md) | compare FAILs: first line `{}` |
| P4 | Tested C# game engine | [projects/p4](projects/p4/README.md) | — | build + F01 pass; F02 NotImplementedException |

Shared support for W4.03: [assets/w4-03](assets/w4-03/) (`diagnostic-caller.cs`, `diagnostic-cases.json`).

## Prerequisites and tool versions

| Tool | Course pin | Notes |
|---|---|---|
| .NET SDK | 10.0.401 (runtime 10.0.12), C# 14, `net10.0` | Each project folder has `global.json` `{"sdk":{"version":"10.0.100","rollForward":"latestFeature"}}`, so any 10.0.1xx–4xx SDK works. Verified on 10.0.102. |
| Python 3 | 3.x | Checkers use the standard library only. On Windows use `py -3` or `python` where the book writes `python3`. |
| Make | any | `make test` wraps the Python checker (W4.01–W4.04); without Make run the checker directly. |
| Node | 24.13.0 (≥ 22.18) | W4.10 and P4 only: runs the TypeScript runner directly. Optional TypeScript 5.9.3 type-check via `npm ci`. |
| xUnit | Microsoft.NET.Test.Sdk 17.14.1, xunit 2.9.3, xunit.runner.visualstudio 3.1.4 | W4.08 and P4, pinned with `packages.lock.json`. |
| A C# debugger | VS Code + C# extension, Visual Studio or Rider | W4.07 (launch configuration supplied in the example). |

No accounts, API keys, secrets or environment variables are needed this week.

## How labs are organised

* `labs/<id>/README.md` — the lab brief; `labs/<id>/starter/` — what you copy and work in; `labs/<id>/evidence.md`
  — the evidence sheet. Work in a copy; keep your predictions, failed and corrected observations.
* `examples/<id>/` — the complete, runnable worked examples from the session.
* W4.07–W4.10 give commands from the "repository root": in this repository that is the `source/` folder.
* All game logic follows `source/shared/contract/GAME-CONTRACT.md`. Rule reasons are `WALL`, `EDGE`,
  `INVALID_ACTION` and `GAME_COMPLETE`; where the book says `ILLEGAL_ACTION` / `INVALID_REQUEST` it is using the API
  categories (409 / 400), which W4.07 and W4.08's action boundary reports. The fixtures `F01`–`F11` (13 files) are
  byte-identical copies of `source/shared/fixtures/treasure/`.
* `bin/`, `obj/`, `node_modules/` and `dist/` are build output — never part of the hand-in (`.gitignore` supplied).
