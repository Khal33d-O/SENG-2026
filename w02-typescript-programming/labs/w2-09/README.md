# W2.09 Lab: Connect and diagnose one application action

**Session:** W2.09 Application integration and observability · **Week 2: TypeScript Programming**

Connect input, rules, rendering and API data into a small play loop, then trace and fix a seeded
state/render mismatch. Your editable implementation is `starter/src/app.ts`. The rules, renderer, markup,
input guard, HTTP adapter and telemetry collection/view stay supplied.

## Outcomes

1. **Explain** the sequence from user input through application logic to the rendered result.
2. **Integrate** input handling, application logic, rendering and an API in a small browser application.
3. **Write** a call to the supplied telemetry helper and locate the resulting event in the prepared view.
4. **Debug** a state/render mismatch and verify the fix against the interaction and its rule tests.

## Timing

Task 1 uses the lesson's 35–50 guided interval. The 50–95 challenge: Task 2 (first 10 minutes, including
its introduction), Task 3 (8), Task 4 (19), Task 5 (8). The 95–110 debrief holds the four-question check
and individual explanation; 110–120 is reserved for recovery.

## Setup and preparation

Use the prepared Node 22.23.2, npm 10.9.8, TypeScript 5.9.3, Playwright 1.61.0, Chromium and .NET SDK
10.0.401 environment (a newer 10.0 SDK rolls forward). Open a terminal in this lab directory:

```bash
cd starter
npm ci
npx playwright install chromium
npm run check:baseline
npm start
```

The baseline compiles the starter and checks the existing rules (12) and the complete demonstrations plus
the counter practice (6 browser checks). `npm start` builds and starts the supplied web/collector process
with its own .NET API; open http://127.0.0.1:4179. If that port is in use, stop the old server or use
`PORT=4189 npm start`. Use a second terminal for `npm run build` after editing, then reload. Stop the
development server with Ctrl+C before `npm test`: the browser tests own their server. `make test` from this
lab directory runs the same full checks when Make is installed. **The full application test intentionally
fails initially** (9 of the 10 application checks fail on the unchanged starter); a missing dependency or
compile error is an environment problem, not the expected assertion. (If the .NET SDK is missing, the
server prints a warning and serves the same reference file itself; record that as an environment note.)

## Supplied operation contract

| Operation | Responsibility and observable result |
|---|---|
| `connectInputs(dispatch)` | Registers buttons and permitted keys once. Later callbacks supply direction and source. Editing/repeated keys remain guarded. |
| `applyMove(before, action)` | Applies existing local rules and returns state. Rejection preserves fields; it does not throw or consume a move. |
| `paint(state)` | Describes the supplied state through board cells, position, moves, score and status. Repainting unchanged state is safe. |
| `inspectBoard()` | Checks the supplied .NET reference API response. It reports unavailable/different data without replacing current play. |
| `recordEvent(event)` | Sends copied scalar before/after values with run, sequence, action and source in one local POST. Its promise reports acceptance or failure of that diagnostic request. |

The API route is `GET /api/boards/reference`. Its `initialMoves` is compared with the local
`initialMoveBudget`; this package accepts only the exact known reference definition. The helper stores
events in the local server's memory and the view (`events.html`) fetches those rows. A new local game creates
a new run identifier and starts sequence at zero; it does not erase older rows. Stopping the server removes
its stored rows. This local path does not establish a BP or Grafana connection, durable delivery or
exactly-once transport.

Files: `src/app.ts` (yours), `src/rules.ts`, `src/render.ts`, `src/inputs.ts`, `src/api.ts`,
`src/telemetry.ts`, `src/demo.ts` + `demo.html`, `src/practice.ts` + `practice.html`, `src/event-view.ts` +
`events.html`, `tools/serve.mjs`, `tools/checkpoint.mjs`, `supplied-runtime/` (.NET API), `tests/`.

## Concepts in code

Connect supplied functions once at startup:

```ts
connectInputs(dispatch);
void inspectBoard();
```

Record an application event with the supplied helper:

```ts
void recordEvent(event)
  .then(() => text('telemetry', 'Recorded locally'))
  .catch(() => text('telemetry', 'Local recording unavailable'));
```

**Worked Example 1: follow one recorded reference action** (`demo.html?mode=working`):

```ts
const before = state;
const after = applyMove(before, action);
state = after;
const event = { runId, sequence: ++sequence, action, source,
  before: summary(before), after: summary(after) };
```

**Worked Example 2: repair the observed render argument** (`demo.html?mode=mismatch`, then `?mode=repaired`).
In Developer Tools → Sources open the served `dist/demo.js`, set a breakpoint in the branch containing
`if (mode === 'mismatch')`, activate East and inspect `before.position.x`, `after.position.x`,
`state.position.x`, `sequence` and `runId` (expected 0, 1, 1, 1 and this page's identifier):

```ts
// Mismatched example:
paint(before);
// Corrected example:
paint(after);
```

*Activity: Predict* — from a fresh reference game, predict East followed by South (position and remaining
moves after each). A recorded event says x changed from zero to one, but the page still shows zero: which
additional value would you inspect before deciding that the rule is wrong? *Activity: Discuss* (practice) —
which field would you quote to establish a second task completion in this run?

Runnable copies and a recorded walkthrough: [`../../examples/w2-09/`](../../examples/w2-09/).

## Lab challenge

### Task 1: inspect the guided event (minutes 35–50)

Run the baseline and open `practice.html`. Predict the task counter's first event, execute it and find the
matching row through its link. Explain the run, sequence, action and before/after count. Open `src/app.ts`
and identify the startup connections and the event-call location. Begin [`../evidence.md`](evidence.md) with
your baseline, predicted fields and assistance used.

### Task 2: connect the supplied boundaries (first 10 minutes of 50–95)

Complete `start`'s input registration and reference inspection. Add the event helper call after the object
has been constructed, keeping its success/failure messages. **Leave the current painting logic unchanged**
while establishing the first observation. Build and reload. Confirm the API region's actual response, then
activate a direction from the fresh game. Record the current run and sequence and locate its new event.
Compare page position, remaining moves, score and status with the event's fields.

### Task 3: locate the executed boundary (next 8 minutes)

Open the served `dist/app.js` in Developer Tools Sources and select the line that controls the call to
`paint`. Trigger your chosen action, then inspect `before`, `after` and current `state` while paused, and the
expression about to be evaluated. Step over or resume to establish whether painting executes and which value
it receives. Remove the breakpoint after collecting the observation.

### Task 4: discriminate between the candidate repairs (next 19 minutes)

Before using hints or running the full interaction tests, choose a second interaction and write predictions
for two explanations of your first symptom: one about the observed execution path, another about a plausible
argument or rule explanation. Select a case in which their predictions differ. Make the bounded change in
`app.ts`, preserving the rule, renderer, event schema and supplied services. Repeat both interactions after
rebuilding and reloading. Explain why a partial display-only change would fail an observation in your
comparison.

### Task 5: verify and explain the repaired loop (final 8 minutes)

Stop the development server and run `npm test`: it builds the current source, runs the twelve rule checks
and exercises the browser, actual API and local event view (16 browser checks when complete, including
unavailable/malformed/different API data, collector failure, new-run filtering, guarded editing, rejection
and completion).

## Acceptance criteria

- [ ] The starter baseline compiles and runs both complete demonstrations before edits.
- [ ] One permitted input reaches the rule once, current state is retained and all visible fields agree after the repair.
- [ ] The fixed-reference API is inspected through its supplied route without resetting local progress on success or failure.
- [ ] Your helper call produces a newly identified event visible in the local view; the actual event and display are compared.
- [ ] A real pause establishes the selected execution boundary, or a recorded fallback is explicitly labelled unperformed live evidence.
- [ ] A learner-chosen second interaction and pre-execution prediction distinguish competing explanations of the same mismatch.
- [ ] The repaired browser interaction and unchanged rule suite pass; partial repair is rejected by a concrete observation.
- [ ] Each person explains the boundary and records assistance; source/evidence survive checkpoint recovery.

## Three-stage hints

**Hint 1: mark the last established observation.** Separate callback invocation, returned rule state,
committed state, recorded fields and post-resume display. Identify the first point where your evidence stops
agreeing.

**Hint 2: inspect the actual path.** Pause before the painting statement and inspect the expression
controlling it. Compare the fields used by that expression with the fields the renderer describes.

**Hint 3: perform one partial comparison.** In the paused Console, evaluate
`({before: before.position.x, after: after.position.x})`. Add the other field needed for your chosen
hypothesis, then compare it with the branch and the matched event. The expression does not repair the adapter.

## Individual evidence and transfer

Give an individual boundary explanation: visible defect, inspected values, matching event, source correction,
repeated interaction and preserved rule result, and the alternative you ruled out. *Transfer:* a task
application records completed count seven while the visible total remains six and the calculation test
passes — which value do you inspect at the view boundary? If instead the total reaches seven but the collector
reports unavailable, which evidence is missing?

## Knowledge check (8 minutes, four questions)

1. A breakpoint is on `paint(after)` after state assignment. While paused, state contains x one and the page
   shows x zero. Which conclusion is supported at that instant?
2. A transport preserves `(runId, sequence)` on replay. The view shows two byte-identical rows for run R,
   sequence four, and the dispatcher counter advances once. How should you assess a report that the input ran twice?
3. A diagnostic object has `read() { return this.attempts++; }`; a watch expression `probe.read()` is
   evaluated twice while paused and attempts rises from three to five. Which change preserves the observation?
4. A helper sends an event, then awaits `response.json()`; the collector stores it and returns 201 with a
   malformed body, and the helper's catch shows Recording unavailable. Which conclusion fits?

## Recovery and teardown

Preserve before using the connected checkpoint (from `starter/`):

```bash
node tools/checkpoint.mjs connected
```

It copies `src/app.ts` and `../evidence.md` into a fresh `backups/attempt-.../` directory (stopping before any
replacement if either is missing), then installs [`checkpoint/app.ts`](checkpoint/app.ts): the taught
integrations with the diagnostic decision still unresolved. `node tools/checkpoint.mjs save` only preserves.

Stop the owned server with Ctrl+C. Save event text before stopping: collector memory is disposable, as are
`dist`, `node_modules`, `.runtime`, `test-results` and the API's `bin`/`obj` directories. Retain
`src/app.ts`, `evidence.md` and preserved attempts.
