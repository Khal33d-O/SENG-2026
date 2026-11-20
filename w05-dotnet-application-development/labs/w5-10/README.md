# W5.10 · Rehearse and bound the final release

**Session:** W5.10 · Project preparation: release acceptance and handover · 120 minutes
**Driving question:** Which parts of the integrated game already work, and what remains for the capstone?

One challenge · 45 minutes owned work inside the 120-minute module.

## Outcomes

* Identify what the copied checkpoint already connects: browser, server-authoritative C# rules, SQLite
  persistence, action telemetry and the Week 3 hint adapter.
* Verify gameplay, retained state and hint fallback together, keeping runtime gates separate from human
  usefulness judgements.
* Choose which tests and telemetry demonstrate validation and failure handling.
* Prepare the release and recovery information another engineer needs in a handover.

## Supplied and owned

**Owned scope: your executed acceptance checklist, one chosen gap with an owner/timebox, and handover
outline. All first integrations are supplied.** Templates in [starter/](starter/):
[release-checklist.md](starter/release-checklist.md), [gaps.md](starter/gaps.md),
[handover-outline.md](starter/handover-outline.md).

How the hint path works: the browser sends a session ID to `/api/sessions/{id}/hint`. The .NET route
loads the authoritative session through the store and forwards only that board/state to the local hint
server; it ignores any client-supplied state. The hint server computes permitted actions and validates
the simulated model output, falling back (first permitted direction in N, E, S, W order, or null) on
validation failure or timeout. Hint output never applies an action. `success`, `validation` and
`timeout` are labelled simulations, with no live provider or credentials. Stopping the hint process
gives `503 HINT_UNAVAILABLE`, which is different from a model timeout.

## Starting point

```bash
export W5_PACKAGE="$PWD/learner/units/w05-dotnet-application-development/assets/integrated-
    release"
```

The book wraps that line; type it as one line:

```bash
export W5_PACKAGE="$PWD/learner/units/w05-dotnet-application-development/assets/integrated-release"
export W5_ATTEMPT="$(mktemp -d)"
```

Browser checks in `rehearse` use Playwright with Chromium (facilitator setup: `npm ci` and
`npx playwright install chromium` in `assets/integrated-release/browser`). If Playwright is not
installed, `rehearse` says `SKIP browser` and still runs every HTTP, hint, failure and restart check;
then do the browser steps by hand with `serve`.

## Worked demonstrations

Script: [examples/w5-10](../../examples/w5-10/README.md).

### Demo 1 · rehearse the connected normal flow

```bash
python3 "$W5_PACKAGE/run.py" rehearse --workspace "$W5_ATTEMPT/normal" --hint-mode success
```

Expect actual Chromium start/East/render, rejected South with unchanged display/GET, a validated
simulated-model hint and retained last confirmed state. The after-write HTTP failure check also proves
atomicity. No live model/provider is called.

### Demo 2 · repeat with deterministic model timeout

```bash
python3 "$W5_PACKAGE/run.py" rehearse --workspace "$W5_ATTEMPT/timeout" --hint-mode timeout
python3 "$W5_PACKAGE/run.py" serve --workspace "$W5_ATTEMPT/retained" --hint-mode timeout
```

Expect browser hint source `fallback`; hint request must not move the player. In the printed browser
(`http://127.0.0.1:5055/`) create a session, move East and retain the ID/state. Stop with Ctrl+C and
repeat the exact serve command against `retained`; load the original ID and compare every field. Use
`--hint-mode validation` in a fresh rehearsal path to see the other supplied failure gate.

Offline trace: East F02; South 409 leaves F02; timeout hint suggests East/fallback but state remains
F02; restart/load same ID returns F02.

## Practical challenge

Run the checklist in this lab, record actual evidence, and choose at most three remaining P5 gaps.
Each gap needs criterion, owner, timebox and evidence path. Review one actual hint using the three
usefulness questions (does the hint fit the state, suggest a permitted action and give a relevant
explanation without promising a win?). Prepare the handover outline and negotiate a 540-minute project
plan using the [P5 brief](../../projects/p5/README.md). Each learner explains one gap and demonstrates
its current failing/incomplete observation; an unchanged supplied rehearsal is not the capstone
deliverable.

### Acceptance criteria

* `starter/release-checklist.md` copied to your evidence with every row's result filled from actual
  runs (or marked not run with the reason).
* At most three gaps, each written as criterion → owner → timebox → evidence path, with a current
  failing or incomplete observation.
* One hint reviewed against the three usefulness questions, recorded separately from runtime gates.
* A handover outline another learner could follow.

## Staged hints

1. Separate gameplay acceptance, runtime fallback and human usefulness judgments.
2. Obtain state through the session API; a browser-supplied score is never authoritative.
3. Use a specific missing completed-game test or recoverability explanation as a bounded gap, not
   "build the integration".

## Check and recovery

Show normal/failure browser evidence, retained restart/load, one correlated action record (W5.07
`run.py telemetry`) and the owner/timebox for each remaining gap. Record it in
[evidence.md](evidence.md).

If blocked, preserve the attempt and commands first. Use a new prepared copy for comparison, then
explain the difference before applying a repair to your owned work.

## Individual knowledge check

1. Name the four already-connected browser/API/storage/hint boundaries.
2. Where does the hint service obtain trusted state, and why ignore client state?
3. Distinguish a runtime fallback gate from a human usefulness judgment.
4. Turn "finish release" into one criterion, owner, timebox and evidence path.
5. Individually identify a rehearsal gap and show the test, telemetry or handover evidence that will
   close it during P5.
