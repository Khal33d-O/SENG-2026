# P5 · Integrated and deployed academy game

**540 minutes: Thursday PM 180 minutes + Friday 360 minutes.** Complete a bounded playable slice and a
handover another engineer can run. Start with the already-working Week 5
browser/.NET/SQLite/hint/telemetry package and your W5.10 rehearsal checklist. You are extending a
proven integration; the unchanged supplied checkpoint is not your project submission.

## What is supplied

The integrated package (`assets/integrated-release`, see its [manifest](../../assets/integrated-release/README.md))
supplies C# rules, session routes, explicit migration, storage transaction, browser rendering,
authoritative hint handoff, simulated model modes, collector, HTTP runner, container recipe and
classroom GitOps adapter. Keep those boundaries.

The supplied integration supports the reference treasure-hunt contract. Changing fixtures alone does
not adapt it to another genre: the browser, routes, rule models and hint action shape also assume the
reference game. A target-range or other incompatible game needs a matching facilitator-prepared
browser/API/rule/hint adapter and independent fixtures before P5; that alternative adapter is not
supplied or verified in this release. Confirm availability at project planning. If it is unavailable,
use the supplied reference integration for the Week 5 engineering work and retain your own-game P4
library/fixtures as a separate artefact; do not claim your own game was integrated. No live model,
credentials or BP environment is required.

## Agree bounded scope

Choose at most three gaps from the rehearsal. At minimum, own one user-visible
completion/error/reload improvement and its meaningful automated acceptance test. For example, add a
clear completed-game message and disabled move controls; add a browser test that plays
East/East/South/South to win, then proves a completed-session action cannot change stored state.
Another valid gap is a tested session-reload recovery flow with a clear hint-unavailable message. Do not
expand to authentication, multiplayer, a new database, provider or deployment platform.

Write each gap as criterion → owner → timebox → evidence path ([starter/project-plan.md](starter/project-plan.md)).
Keep an initial failing or incomplete observation before implementation. Share implementation, but
every learner owns a named code/test/review contribution and independently explains the whole request
path. Identify help and supplied code honestly.

## Milestones

| Time | Milestone | Reviewable output |
|---|---|---|
| Thursday 0–30 · 30 min | Scope from rehearsal | At most three criteria, individual owners, starting revision and known-good image |
| Thursday 30–120 · 90 min | Complete one user flow | Owned change with a failing-before and passing-after acceptance test |
| Thursday 120–180 · 60 min | Integrate and review | Independent bounded review, correction and passing HTTP/persistence tests |
| Friday 0–90 · 90 min | Close remaining agreed gaps | Normal, invalid/completed action and hint failure evidence |
| Friday 90–150 · 60 min | Diagnose and rehearse recovery | Correlated action record; retained restart; known-good image restore |
| Friday 150–210 · 60 min | Release through prepared workflow | Passing pipeline, configuration revision, ready image and Service action |
| Friday 210–270 · 60 min | Handover and peer replay | Architecture, usage, storage/reset/recovery commands a peer can follow |
| Friday 270–330 · 60 min | Demonstrate individually | Playthrough, failure explanation, owned code/test/review explanation |
| Friday 330–360 · 30 min | Repair demonstrated blockers and reflect | Final evidence index, limitations and individual revisit plan |

Total: 540 minutes. Keep a small playable slice if a criterion proves too large; renegotiate the gap
explicitly and preserve failed evidence. Recover through the known-good checkpoint while retaining your
work. A facilitator setup failure does not count as a successful deployment.

## Runnable working path

Use the setup variables in W5.10 (`W5_PACKAGE` as one line ending `assets/integrated-release`, and
`export W5_ATTEMPT="$(mktemp -d)"`). Prepare a source copy and run its checks:

```bash
python3 "$W5_PACKAGE/prepare.py" 10 "$W5_ATTEMPT/project"
python3 "$W5_PACKAGE/run.py" test --source "$W5_ATTEMPT/project" --workspace "$W5_ATTEMPT/project-http"
```

```bash
python3 "$W5_PACKAGE/run.py" rehearse --source "$W5_ATTEMPT/project" --workspace "$W5_ATTEMPT/project-fallback" --hint-mode timeout
```

```bash
python3 "$W5_PACKAGE/run.py" serve --source "$W5_ATTEMPT/project" --workspace "$W5_ATTEMPT/project-retained" --hint-mode success
```

Add an owned test to `Tests/Program.cs` or a named browser test beside the supplied checker (for
example `browser-tests/completed-game.mjs`, run with
`W5_BROWSER_DIR="$W5_PACKAGE/browser" node browser-tests/completed-game.mjs http://127.0.0.1:5055`).
Document its exact executable command and expected failure before implementation. Keep actions
deterministic and compare responses with an independent GET. Stop/restart the same serve command to
verify the same session survives. Use new paths for isolated test attempts.

For release, initialise a fresh `release.py` workspace as W5.09 teaches, then copy your owned
source/test changes into its `source` directory, inspect the diff and commit. Preserve the known-good
pipeline image before building the candidate. Follow pipeline → review result → select image → sync →
check. Restore by selecting the recorded known-good image and syncing again; keep the retained database.
Record the final release choice explicitly after recovery.

## Acceptance evidence

1. Complete a playable browser flow using C# rules through .NET. For the reference game,
   East/East/South/South wins with score 10; UI and subsequent GET agree.
2. Reject malformed input, a wall action and an action after completion. Show exact
   status/code/requestId and unchanged subsequent stored state. Include a test you authored.
3. Stop/restart with the database retained and load the original ID. Show every state field, explicit
   migration behaviour and the distinction between New game and deleting storage.
4. Demonstrate a validated simulated-model hint plus validation and timeout fallback. Show server-side
   authoritative state, permitted advice and no game-state mutation. Record three human usefulness
   judgments separately from runtime gates.
5. Correlate a failed action requestId through .NET logging and the prepared Grafana datasource; use its
   response and stored-state check to explain failure.
6. Show independent review, source commit, passing pipeline/image identity, configuration revision and
   actual ready Service operation. Restore known-good without resetting storage.
7. Provide an evidence index with exact commands, exits, sample responses and honest limitations. Label
   supplied/offline traces; they cannot replace runtime evidence.

Templates: [starter/evidence-index.md](starter/evidence-index.md), [starter/handover.md](starter/handover.md).

## Handover outline

Include purpose/controls; architecture diagram of browser → API/rules → SQLite and API → hint adapter;
API start/action/get examples; startup and tests; simulated modes; source/image/configuration
identities; retained directory and reset semantics; migration assumptions; restore commands; request-ID
diagnosis; limitations and follow-up owners. Exclude credentials, kubeconfig and private environment
records.

## Individual demonstration and assessment

Each learner performs part of the playthrough, locates their owned code/test diff and explains its
expected failure, traces a rejected request to unchanged storage, identifies authoritative hint state,
and explains image versus database recovery without a partner narrating. Each shows their own bounded
review decision. Assessment considers working behaviour, justified tests, accurate diagnosis,
recoverable release evidence and usable handover; visual polish alone does not meet the brief.

If a flow is broken, preserve the error, state the unmet criterion and demonstrate diagnosis and
known-good recovery. Do not claim a pass from code inspection. Finish with what you can do
independently, help received and the next specific practice need.
