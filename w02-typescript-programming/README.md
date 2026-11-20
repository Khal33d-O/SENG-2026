# Week 2: TypeScript Programming

Ten sessions take one small game — the course's shared treasure hunt (with a target-range alternative) —
from a compiled label on a page to a planned, testable, observable browser application, followed by
Project 2, a playable TypeScript game.

| Session | Title | Lab folder | Main command(s) | Port |
|---|---|---|---|---|
| W2.01 | TypeScript tooling and browser foundations | [`labs/w2-01`](labs/w2-01/) | `npm run check:baseline`, `npm test` | 4311 |
| W2.02 | Values, objects and control flow | [`labs/w2-02`](labs/w2-02/) | `npm run check:baseline`, `npm test`, `npm run check:browser` | 4302 |
| W2.03 | Functions, collections and simple checks | [`labs/w2-03`](labs/w2-03/) | `npm test`, `npm run check:mine` | — |
| W2.04 | Typed state and module boundaries | [`labs/w2-04`](labs/w2-04/) | `npm run practice`, `npm test`, `npm run check:mine` | — |
| W2.05 | Browser events and rendering from state | [`labs/w2-05`](labs/w2-05/) | `npm run check:baseline`, `npm test` | 4173 |
| W2.06 | HTTP requests, asynchronous code and validation | [`labs/w2-06`](labs/w2-06/) | `npm run check:baseline`, `npm test` | 4176 |
| W2.07 | Unit tests and regression debugging | [`labs/w2-07`](labs/w2-07/) | `npm run check:baseline`, `npm test` | — |
| W2.08 | Classes, composition and refactoring | [`labs/w2-08`](labs/w2-08/) | `npm run check:core`, `npm test` | — |
| W2.09 | Application integration and observability | [`labs/w2-09`](labs/w2-09/) | `npm run check:baseline`, `npm test` | 4179 |
| W2.10 | Project preparation: acceptance criteria and build plan | [`labs/w2-10`](labs/w2-10/) | `npm test`, `npm run plan`, `python3 tools/serve.py` | 4181 |
| P2 | Playable TypeScript game (540 min) | [`projects/p2`](projects/p2/) | `npm run check:rules`, `npm test`, `tools/release.py` | 4182 |

## How the labs are organised

* `labs/w2-NN/README.md` — the lab brief: outcomes, timings, what is supplied and what you own, setup,
  guided practice, challenge tasks, acceptance criteria, staged hints, individual evidence, knowledge-check
  questions, recovery and teardown.
* `labs/w2-NN/starter/` — the package you copy and work in. Each starter compiles and its baseline passes;
  the full check **intentionally fails** until you complete the challenge (each README states exactly which
  checks fail at the start).
* `labs/w2-NN/evidence.md` — your evidence card (predictions, observations, assistance). W2.10 also uses
  `document/template.md`.
* `labs/w2-NN/checkpoint/` (where the book supplies one) — a recovery checkpoint; use only after preserving
  your attempt with the documented command.
* `examples/w2-NN/` — the session's worked examples as runnable files, plus captured observations for a
  blocked environment (label those as captured).
* `projects/p2/` — the project brief and starter.

## Prerequisites and tool versions

| Tool | Course pin | Notes |
|---|---|---|
| Node.js / npm | 22.23.2 / 10.9.8 | Any Node 22+ works; verified with Node 24.10 / npm 11 |
| TypeScript | 5.9.3 | Pinned in every `package.json`; W2.07/W2.08 expect `tsc` on PATH in the prepared environment, otherwise run `npm ci` |
| Playwright / Chromium | 1.61.0 | `npx playwright install chromium` once per machine (W2.01, W2.02, W2.05, W2.06, W2.09, P2) |
| .NET SDK | 10.0.401 (`net10.0`) | Supplied APIs in W2.06, W2.09, W2.10 (`global.json` pins 10.0.100 with `latestFeature` roll-forward); you never write C# this week |
| Python 3 | 3.x | W2.10 and P2 tools (`python` on Windows if `python3` is absent) |

No BP credentials, tenants or cloud services are used. Every event view is local process memory — not
Grafana or BP telemetry. The `mktemp` setup blocks in W2.03, W2.04, W2.07 and W2.08 are Bash (use Git
Bash on Windows).

## Working practice for the week

* Copy the starter into a working location (the README gives the exact command) and keep the original for
  recovery.
* Stop a development server (Ctrl+C) before running browser tests: the tests start their own server on the
  same port.
* First attempts and individual evidence use supplied material, documentation and human/access support
  without generated code. Record assistance as *demonstrated independently*, *demonstrated with a prompt*,
  *completed with guided support* or *not yet demonstrated*; record *environment blocked* separately.
* Shared game contract and fixtures: [`../../../shared/contract/GAME-CONTRACT.md`](../../../shared/contract/GAME-CONTRACT.md).
