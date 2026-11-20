# Week 3 · Software Design and AI

Week 3 takes the familiar treasure-hunt game and asks how to change it with evidence: design boundaries,
review, specifications and tests, AI-assisted changes and their review, integration checks, and finally a
server-side hint feature that stays reliable and observable when the model path fails.

| Session | Title | Lab | Main product |
|---|---|---|---|
| W3.01 | Software design and maintainability | [labs/w3-01](labs/w3-01/README.md) | Annotated dependency diagram (`starter.mmd`) and `notes.md` |
| W3.02 | Code review and quality tools | [labs/w3-02](labs/w3-02/README.md) | Review document for candidate C |
| W3.03 | Specifications and test-driven development | [labs/w3-03](labs/w3-03/README.md) | `tests/claim.test.mjs`, red/green/refactor stages |
| W3.04 | AI development workflows, agents and CLI tools | [labs/w3-04](labs/w3-04/README.md) | Bounded instruction, attempt record, decision record |
| W3.05 | Isolating and reviewing AI-assisted changes | [labs/w3-05](labs/w3-05/README.md) | Local PR record with evidence table |
| W3.06 | Integration tests and engineering documentation | [labs/w3-06](labs/w3-06/README.md) | Ownership integration check and feature note |
| W3.07 | Model APIs and application boundaries | [labs/w3-07](labs/w3-07/README.md) | `requestHint` adapter (9 checks) |
| W3.08 | Reliable responses and evaluation | [labs/w3-08](labs/w3-08/README.md) | `validHint`, `fallbackHint`, review check (24 + 1) |
| W3.09 | Observability for AI features | [labs/w3-09](labs/w3-09/README.md) | `recordHint` and a diagnosis repeat (24 + 5 + 1) |
| W3.10 | Project preparation: contextual hints and graceful failure | [labs/w3-10](labs/w3-10/README.md) | Hint-flow design template |
| P3 | Reviewed game with contextual hints | [projects/p3](projects/p3/README.md) | Hint feature, bounded refactor, tests, review record |

Worked-example guides for each session are in [`examples/`](examples/).

## Prerequisites and tool versions

| Tool | Course pin | Notes |
|---|---|---|
| Node.js / npm | 22.23.2 / 10.9.8 | Node 24 also works (verified on Node 24.10 / npm 11.6) |
| TypeScript | 5.9.3 | Pinned as an exact devDependency in each lab's `package.json` (with `package-lock.json`) |
| ESLint | 10.10.0 | Facilitator runner for W3.02 only; learners read the recorded report |
| Python | 3 | `python3` on macOS/Linux; `python` or `py -3` on Windows |
| Git | 2.47.3 | W3.05 (any later 2.x works) |
| GNU Make | any | Optional: every `make` target has a `python ...` equivalent, listed in each README |
| Podman + prepared Loki/Grafana images | facilitator-prepared | W3.09 view only; without them the app still runs and keeps terminal events as local evidence |
| Browser | any current | W3.01 fixtures, W3.10 / P3 game on http://127.0.0.1:4310 |

**No live model calls and no API keys.** Every model response in Week 3 comes from a deterministic local stub
or a recorded teaching run. The book's delivery mentions a facilitator-prepared terminal agent (W3.04) and a
prepared live demonstration (W3.07); both are optional and facilitator-side, and every lab can be completed
manually. Use synthetic data only.

## How the labs are organised

- Each `labs/w3-XX/README.md` is the learner brief: outcomes, supplied versus owned files, setup, worked
  examples, guided practice, the 45-minute challenge, acceptance criteria, staged hints, the knowledge-check
  questions, recovery and optional depth.
- Lab roots follow the book's paths: W3.01 has `starter.mmd`, `notes.md` and `runtime/`; W3.03, W3.07–W3.10
  have `starter/`; W3.04 and W3.06 have `code/` and `document/`; W3.05 has `assets/`; W3.02 has `packet/`.
- Commands that compile TypeScript (`check.py`, `lab.py`, `harness.py`, `assist.py`, `review.py`) compile a
  fresh copy and never rely on stale `dist/` output. Run `npm ci` once where the README says so.
- Starters reproduce the book's initial state: for example W3.03's claim tests fail as scaffolds, W3.04 fails
  two of five tests, W3.07 throws its missing-implementation error, W3.08 rejects everything, W3.09 emits no
  event, and W3.10 passes all 29 adapter checks.

## Notes on the shared contract

- Weeks 3.01–3.06 use the book's teaching API `evaluateMove(state, direction)` with a deliberately seeded
  defect (a rejected move spends one move). It reports a wall or board-edge rejection as `ILLEGAL_ACTION`,
  the code the Week 5 API returns as `409 ILLEGAL_ACTION`; the shared contract's finer reasons are `WALL` and
  `EDGE`. The corrected rules agree with the shared fixtures F01–F11 under that mapping.
- W3.07–W3.10 and P3 use the contract rule evaluator `evaluate(board, state, action)` with the exact
  `WALL`/`EDGE` reasons; `npm run fixtures` in the W3.10 starter checks it against all 13 fixtures.
- The hint envelope follows the book: `{ hint: { action: { type, direction }, explanation } | null, source,
  requestId }` from `POST /api/hint` with `{ boardId, state, stateVersion }`.
