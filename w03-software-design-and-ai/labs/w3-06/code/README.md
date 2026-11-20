# W3.06 code instructions

From the lab root (Windows without make: `python` instead of `make`/`python3`):

| Command | What it does |
|---|---|
| `make test` (`python3 code/harness.py`) | Compiles four fresh stages with your `ownership.test.mjs` and reports pass/fail per stage |
| `make demo` / `python3 code/demo.py` | Worked example 1: red (baseline), green (correction), refactor with the supplied single-session checks |
| `cd code/starter && npm ci` | Only if the prepared compiler is missing (TypeScript 5.9.3) |

## The path under test

`controlledResponses(saved)` → `openSession(slot, service)` → `decodeSave(text)` → session `move()` →
`evaluateMove` → session `snapshot()`. Only the external save service is controlled. The factory's
`requestedSlots` and `bodyReads` are setup observations: they confirm what the opener consumed, not that the
session retained or separated state.

## Stages (`make test`)

| Stage | Session | Rule | Your check should |
|---|---|---|---|
| current | supplied | existing correction | pass |
| valid-refactor | supplied | reviewed refactor (`stages/rules.refactor.ts`) | pass |
| lost-state | `stages/session.lost-state.ts` | correction | fail by assertion |
| shared-state | `stages/session.shared-state.ts` | correction | fail by assertion |

## Restoring supplied files

Every supplied file has a byte-identical copy in `fixtures/reference/` (same relative path). Example
(from `code/`): `cp fixtures/reference/src/session.ts starter/src/session.ts` (PowerShell:
`Copy-Item fixtures/reference/src/session.ts starter/src/session.ts`). Save your own
`starter/tests/ownership.test.mjs` first; restoring `fixtures/reference/tests/ownership.test.mjs` brings back
the blank scaffold.

## Hints

- **Hint 1 (after a written prediction):** which single observation would differ for a session that
  forgets the rule's returned state? Make an accepted move and look at that session's snapshot.
- **Hint 2:** shared state only shows up while two sessions are alive. Open the second session with a
  *different* save and then look at the first.
- **Hint 3:** capture or write the first session's expected snapshot before opening/advancing the second,
  then compare after each operation on the second.
