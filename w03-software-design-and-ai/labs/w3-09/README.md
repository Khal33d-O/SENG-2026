# W3.09 · Observability for AI features

**Duration:** about 120 minutes, including one 45-minute code challenge and an 8-minute knowledge check.

The hint remains usable when the model path fails because the handler can return fallback advice. That
continuity can hide the reason from a person looking only at the screen. Observability connects the
visible request to a small, interpretable record of what happened.

## Outcomes

- Describe latency, success/failure outcomes and fallback use as useful signals for an LLM integration.
- Explain how request identifiers connect a user-visible failure to server-side evidence.
- Write instrumentation that records these signals without recording credentials or unnecessary request content.
- Debug a seeded model-adapter failure using the supplied logs and telemetry views.

## Supplied and owned

| Path | Role |
|---|---|
| `starter/src/instrumentation.ts` | **You own `recordHint`** (the marked terminal event operation) |
| `starter/tests/diagnosis.test.mjs` | **You own exactly one awaited selected-repeat check** |
| `starter/tests/evaluation.test.mjs` (24), `starter/tests/signals.test.mjs` (5) | Fixed response and signal checks |
| `starter/src/handler.ts` | Supplied handler with the clock and the completion hook that calls `recordHint` |
| `starter/src/scenarios.ts` | Supplied named scenarios (`valid-advice`, `invalid-advice`, `controlled-timeout`, `seed-a`, `seed-b`) and `controlledClient` |
| `starter/browser/` | Page with scenario and wait controls (0–1000 ms) |
| `launch.py`, `collector/` | Local view: application on http://127.0.0.1:4309, Loki + Grafana (prepared images) on http://127.0.0.1:3009 |
| `demo/src/instrumentation.ts`, `demo/README.md` | Complete demonstrated operation and labelled prior captures |

## Setup

Node, TypeScript 5.9.3, Python and Make; `npm ci` once in this lab directory. The local view needs the
prepared Podman images (`docker.io/grafana/loki:3.5.0`, `docker.io/grafana/grafana:12.1.0`, or names set in
`W309_LOKI_IMAGE` / `W309_GRAFANA_IMAGE`). The launcher never downloads images; without them the
application still runs and every terminal event is kept in the printed run directory as **local**
evidence (not Grafana evidence). No model account, credential or provider is involved. From this lab
directory:

```bash
make test
```

The starter compiles, then fails the missing event and selected-repeat assertions (expected). `make demo`
(`python check.py demo`) runs the complete known implementation and its 29 fixed checks. Windows without
make: `python check.py starter`, `python check.py demo`, `python launch.py starter`.

## What to observe

| Field | Question it helps answer |
|---|---|
| `requestId` | Is this evidence for the request I am investigating? |
| `latencyMs` | How long did the documented handler interval take? |
| `outcome` | Which supplied terminal path completed? |
| `fallback` | Did the returned envelope use the fallback path? |

The supplied clock starts at handler entry and stops when validation or fallback selection finishes;
`finishedMs - startedMs` is elapsed milliseconds. It excludes Loki delivery, the return trip and browser
rendering. Outcomes: `model-success`, `validation-failure`, `timeout`, `provider-failure`, `no-action`.
Use the identifier from the actual browser envelope to select its event, never the newest row.

**Predict:** two requests both return a permitted fallback; one timed out, one failed validation. What does
the screen establish, and what remains unknown?

## Worked example 1: add the complete outcome operation

At the completion hook the handler knows the result, outcome and clock readings. The complete operation
(`demo/src/instrumentation.ts`) emits once:

```ts
export function recordHint(facts: Facts,
  emit: (event: Event) => void): void {
  emit({
    requestId: facts.requestId,
    latencyMs: facts.finishedMs - facts.startedMs,
    outcome: facts.outcome,
    fallback: facts.result.source === 'fallback'
  });
}
```

Run `make demo`: 29 checks, including exact interval calculation, minimal fields, client failures and
no-action completion. A passing event check establishes field values for its executed input; it does not
prove that a collector received the event.

## Worked example 2: follow success into Grafana

Start `python3 launch.py demo` and open the printed application and Grafana links. Choose `valid-advice`
with wait 0 and request a hint. Copy the response's request ID into the Grafana **Request ID** field
(dashboard "W3.09 hint request events", session `learner-01` unless `LAB_SESSION` is set). The matching
record has `model-success`, `fallback` false and the measured local handler duration. Then run
`controlled-timeout` with a 70 ms wait and `invalid-advice` with zero wait: both browsers show fallback;
their events name `timeout` and `validation-failure`. Retain each ID and the query/time range. If the
collector images are not prepared, use the terminal lines in the run directory and mark your own Grafana
observation unverified (see `demo/README.md` for the labelled local capture).

## Guided practice

1. **Connect a symptom to a record:** the newest row says model success but has a different request ID
   from the browser envelope. What is unsupported, and what is the next action?
2. **Name the interval:** a browser observation lasts longer than the event duration. Why must you not add
   a guessed number to the event?
3. **Reject an unsupported diagnosis:** "Both screens show fallback, so they must have the same cause."

## Lab challenge: instrument and diagnose the hint request (45 minutes)

1. **Identify the owned operation — 5 min.** You own `starter/src/instrumentation.ts` and exactly one
   awaited check in `starter/tests/diagnosis.test.mjs`. The event contains only `requestId`, `latencyMs`,
   `outcome` and `fallback`; do not record request/response content, a credential or the facts object.
2. **Instrument and inspect the seeded requests — 8 min.** Complete the event operation; run `make test`
   and separate the fixed signal results from the incomplete custom check. Start the view:

```bash
python3 launch.py starter
```

   Run **Seed A** with a 15 ms wait and **Seed B** with a 180 ms wait. For each, retain the browser request
   ID, public result, matching Grafana (or terminal) record and query/time range. Record an initial
   diagnosis in the comment beside your owned test.
3. **Choose and predict a discriminating repeat — 10 min.** Record scenario, wait and independent
   prediction before running: what changes, what is held constant, and which event relationship could
   contradict a competing explanation.
4. **Execute the repeat — 12 min.** Implement one awaited test using `handleHint`, `controlledClient` and
   `initialState`; capture the event through the callback; assert the predicted public result, exact
   request correlation, unchanged input and the predicted relationship. Run the same repeat in the view and
   retain its new request ID.
5. **Verify and explain — 10 min.** `make test`: 24 response checks, five signal checks and your one
   selected-repeat check. Explain how the request evidence distinguishes timeout from validation failure,
   how the duration is measured and what your repeat tested. Stop the view with Ctrl+C after saving.

## Acceptance criteria

- The two owned files are complete, compile and retain the supplied interfaces.
- Exactly one event records the four permitted fields and the defined elapsed interval for completed paths.
- All 29 fixed response and signal checks retain their original expectations and pass.
- The actual seeded browser requests are linked to their own collected records and query/time range, or missing execution is stated explicitly.
- One controlled repeat and an independently predicted discriminating relationship are recorded before execution.
- One awaited custom test and the selected actual view request support or contradict that prediction without changing supplied controls.
- The individual diagnosis separates terminal cause, elapsed interval and fallback, and explains the limits of the evidence.

## Hints

- **Hint 1 (observation boundary):** the screen shows continuity; only the event for the same request ID
  shows the terminal cause.
- **Hint 2 (intermediate evidence):** each scenario has its own configured deadline (see
  `starter/src/scenarios.ts`). Compare each wait with that request's deadline, not with the other request.
- **Hint 3 (partial operation):** `const { client, timeoutMs } = controlledClient('seed-a', /* wait */);`
  then `await handleHint(body, { requestId, client, timeoutMs, emit: (e) => events.push(e) });`

## Knowledge check (8 minutes)

1. A browser measures 240 ms while its matched event records 175 ms. The event covers handler entry through
   validation/fallback and excludes collector delivery and the return trip. What is supported? A) The event
   must be wrong. B) Add 65 ms to every event. C) The measurements cover different intervals; identify their
   boundaries before interpreting the difference. D) The 175 ms value proves that the provider itself took exactly 175 ms.
2. The browser returns fallback with ID request-81. The newest Grafana row says model-success with ID
   request-80. What should you do first? A) Select the actual request-81 evidence and verify the session/time
   range before diagnosing its cause. B) Treat the newest row as authoritative. C) Rewrite the browser ID to
   match the existing row. D) Conclude that every fallback is a provider timeout.
3. The terminal hook provides clock readings, the actual ID, outcome and a public result containing
   explanation text. Which event follows the minimal-content boundary? A) Spread every available fact into
   the event. B) Emit only the explanation. C) Include a synthetic credential in teaching and replace it with
   an actual credential at delivery. D) Emit the ID, finish-minus-start milliseconds, supplied outcome and whether the result source is fallback.
4. A teammate's event assertions pass, but their explanation says "The longer fallback must be a timeout."
   No controlled repeat or prediction was recorded. What is the best next step? A) Accept the diagnosis.
   B) Match the actual cause evidence and choose a controlled repeat with a prediction that could contradict
   the diagnosis. C) Rename every long event to timeout. D) Remove latency from the contract.

## Recovery and teardown

If the view is unavailable, preserve your owned code, prediction, command output and setup error; use the
labelled capture in `demo/README.md` for interpretation and record that your own Grafana request was not
verified. Restore a fresh copy if fixed files changed and transfer only your two owned files. Ctrl+C in the
launcher terminal stops only its own process and labelled containers; the run directory under `runs/` is
kept as evidence.

## Optional extension

Identify a different legitimate controlled repeat and state what it would test. Do not add telemetry
fields, a dashboard or a second required task.
