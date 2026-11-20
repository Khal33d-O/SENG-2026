# W3.06 · Integration tests and engineering documentation

**Duration:** about 120 minutes, including one 45-minute mixed challenge (code + short note) and an
8-minute knowledge check.

A correct rule can still sit inside an incorrect feature. The session must keep the state returned by that
rule, and opening another session must not change a session that is already in use. Today you connect an
integration check to a short design note that another engineer can assess.

## Outcomes

- Compare unit tests with tests that exercise collaborating components.
- Explain how repeatable setup and controlled external responses support reliable integration tests.
- Write an integration check for the current feature using the supplied test harness.
- Write a short design note covering the feature's contract, assumptions and verification steps.

## Supplied and owned

| Path | Role |
|---|---|
| `code/starter/tests/ownership.test.mjs` | **You own** exactly one unskipped integration test (starts with an intentional `assert.fail`) |
| `document/note-template.md` | **You own** the 180–300-word note plus result table |
| `code/starter/src/session.ts` (`openSession`), `decoder.ts` (`decodeSave`), `rules.ts`, `board.ts` | Real opener, decoder, session and corrected rule |
| `code/starter/src/responses.ts` (`controlledResponses`) | Controlled-response factory: the only replaced collaborator (records requested slot and body reads) |
| `code/starter/tests/session.test.mjs` | Complete single-session and direct checks |
| `code/harness.py` (`make test`) | Compiles four fresh stages with your check: two valid, two broken collaborators |
| `code/demo.py`, `document/demo-note.md` | Worked examples: known red/green/refactor stages and the complete demonstration note |
| `code/fixtures/reference/` | Copies of every supplied file for restoration |
| `document/brief.md`, `document/rubric.md`, `code/README.md` | Document brief, rubric, code instructions and hints |

## Setup

Node 22.23.2, TypeScript 5.9.3 and Python 3 (prepared environment; if the compiler is missing run `npm ci`
once in `code/starter`). No account, model call or live service. Work in a copy of this lab. From the lab root:

```bash
make test
```

(Windows without make: `python code/harness.py`.) The starter compiles but its one missing-check assertion
fails — this establishes the starting environment, not a defect in the corrected rule.

## Retrieve and predict

From the initial six-move state, east leaves five; south then hits the wall and must preserve the complete
public state. **Predict:** the rule returns a correct new state, but the session forgets to retain it. A direct
rule test passes. What does the session snapshot show after east? Which observation would reveal the defect:
the returned move result, the session snapshot, or a copy of the stub response?

## Concepts

A unit test can call `evaluateMove` directly. An integration check can load a response through the supplied
decoder, open a real session, call its move method and inspect the state that session exposes — covering a
relationship between components. Create a fresh controlled-response factory for each intended save and
await `openSession`; the decoder and session remain real. A fresh process clears process state between runs;
it does not prove that two sessions alive within one process have separate state. Capture an expected
snapshot **before** the operation that might change it.

## Worked example 1: identify the decoder/session/rule path

```
controlled save response→real decoder→real session
```

→ real rule → session snapshot. Open `code/starter/tests/session.test.mjs` and `code/starter/src/session.ts`:
the first accepted move must appear in the session snapshot before the rejected move is examined. Run the
known red, green and refactor stages from the lab root:

```bash
python3 code/demo.py
```

The driver compiles each temporary stage and runs both direct and integration checks. The known baseline
fails the five-move expectation; the existing correction and reviewed refactor pass. Read the named
assertion before treating the nonzero baseline as expected.

## Worked example 2: turn observations into a feature note

Read [`document/demo-note.md`](document/demo-note.md): the single-session contract, the controlled service
response, the actual stage commands and results — and what it does **not** claim (two sessions at once, a
live save service, all game rules). Compare "the feature is reliable" with "the loaded session retains an
accepted move and preserves its public state after this rejected wall action."

## Guided practice

1. **Classify three checks:** direct `evaluateMove` gives five moves; a controlled response returns exactly
   the JSON supplied to it; a loaded session exposes the accepted position. Which component does each reach,
   and what can it not support?
2. **Diagnose a misleading green result:** `game.move('east')` returns the right position, but the next call
   starts from the old one. Which extra observation distinguishes retaining from returning?
3. **Choose what to control:** the storage endpoint is unavailable; a teammate proposes mocking
   `openSession`. Which supplied seam keeps the decoder, session and rule under test?
4. **Tighten a documentation claim:** rewrite "The integration suite proves that storage and all sessions
   always work." with the actual path, one limit and the command to run.

## Lab challenge: integration check and feature note (45 minutes)

1. **Confirm the baseline — 5 min.** Identify `openSession`, its real decoder/rule path and the controlled
   response; explain the expected starter assertion.
2. **Choose an ownership observation — 8 min.** Two simultaneously live sessions must retain their own state.
   Design one check that can expose both a caller discarding returned state and state shared between live
   sessions; sketch loads, moves and observations and the wrong behaviour each could expose.
3. **Implement the check — 12 min.** Edit only `code/starter/tests/ownership.test.mjs`, using the supplied
   imports and async callback. Keep exactly one unskipped test; do not inspect stage labels, process
   arguments or source text.
4. **Verify and diagnose — 12 min.** `make test`: your check must pass the current implementation and the
   valid refactor, and fail real assertions for lost caller state and shared session state. A compiler error
   does not count as detection. Preserve the actual result before revising.
5. **Write the note and explain — 8 min.** Complete [`document/note-template.md`](document/note-template.md)
   (180–300 words plus result table).

## Acceptance criteria

- My single check reaches the supplied opener, decoder, session and rule through a controlled external response.
- My setup and public observations distinguish caller propagation from state shared between overlapping live sessions.
- My check passes both valid implementations and detects both broken collaborators through assertions.
- I preserve supplied source/test-support bytes and use fresh setup rather than another test's state.
- My note states contract, boundaries/assumptions, actual verification and limits in the required range.
- My individual explanation connects an observation to extra coverage beyond a direct rule unit test.

Hints: see [`code/README.md`](code/README.md#hints) (use Hint 1 only after writing a prediction).

## Knowledge check (8 minutes)

1. A rule unit test passes, but the session discards the rule's returned state. Which check can expose the
   missing behavior? A) Check the controlled response contains the same JSON that its factory was given.
   B) Load the supplied session, make an accepted move and inspect the state that session exposes. C) Rename
   the direct rule test integration.test.mjs without changing its calls. D) Accept the feature because any
   passing unit test implies its callers are correct.
2. A teammate checks every session in a new process and claims that two simultaneously live sessions cannot
   share mutable state. What is missing? A) A setup that keeps the relevant sessions alive together and
   observes whether their state remains separate. B) A random starting state on every run. C) A real external
   storage account. D) An assertion that both response factories return identical JSON.
3. The storage endpoint is unavailable while a learner writes the integration check. Which change retains
   evidence about decoding and session behavior? A) Replace `openSession` with an object containing a
   prewritten correct snapshot. B) Delete the public-state assertion. C) Generate the expected snapshot by
   calling the same possibly broken session a second time. D) Pass the controlled save-response service to
   the supplied `openSession` function and retain the application assertions.
4. A check passes against two valid stages and fails assertions for two supplied broken callers. It used
   controlled responses in one process. Which note accurately records the result? A) All live storage
   configurations are proven compatible. B) The source is approved for release. C) The named check
   distinguishes the supplied ownership failures under this setup; the note records its command, actual stages
   and live-service limit. D) Only the final green summary matters.

**Check whether the observation finished:** an async test starts `openSession` but neither returns nor
awaits the promise containing its snapshot assertion. Can its apparent completion establish the promised
observation?

## Recovery and teardown

Keep a copy of your owned test and note outside the lab before changing setup. The harness compiles in
temporary directories and removes them after each run. If a supplied file was edited, restore it from
`code/fixtures/reference/` (see `code/README.md`) and rerun; do not repair an assertion failure by altering
the rule or reference expectations. Nothing keeps running afterwards.

## Optional extension

Examine returned snapshot ownership (does mutating a returned snapshot change the session?) or a malformed
save (`decodeSave` rejects it). Explain the additional claim before changing a check.
