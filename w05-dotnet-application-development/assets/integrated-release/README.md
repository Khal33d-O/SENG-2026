# Week 5 integrated release package (manifest)

Used by W5.06–W5.10 and Project 5. The package supplies the reviewed session API in a separate stage
plus the plumbing the sessions name. Set it up from the academy repository root (the course `source/`
folder):

```bash
export W5_PACKAGE="$PWD/learner/units/w05-dotnet-application-development/assets/integrated-release"
export W5_ATTEMPT="$(mktemp -d)"
```

(The course book prints the first line wrapped after `integrated-`; it is one path.)

## Commands

| Command | What it does |
|---|---|
| `python3 "$W5_PACKAGE/prepare.py" NN DEST` | copies a source checkpoint: 06 (rejected-flow tests incomplete), 07 (action tags/log incomplete), 08–10 (complete). Refuses to overwrite. |
| `python3 "$W5_PACKAGE/run.py" test --workspace DIR [--source SRC]` | build, new `DIR/data/game.db`, explicit `--migrate`, hint server + API, then the HTTP runner `Tests/Program.cs` (with `TRAINING_FAILURES=1`). Exit code = test result. |
| `python3 "$W5_PACKAGE/run.py" rehearse --workspace DIR --hint-mode success\|validation\|timeout` | `test` plus server-authoritative hint checks (forged client state is ignored), the Chromium checker when Playwright is installed, and an API restart on the same database. Writes `DIR/rehearsal.json`. |
| `python3 "$W5_PACKAGE/run.py" serve --workspace DIR --hint-mode MODE [--port 5055]` | runs the game at `http://127.0.0.1:5055/` until Ctrl+C. Reuses `DIR/data/game.db`, so repeating the same command reloads retained sessions. |
| `python3 "$W5_PACKAGE/run.py" telemetry --workspace DIR [--source SRC]` | collector bridge, Loki + Grafana (Podman pod, own containers only), API with the JSON exporter; one accepted action and one injected `SAVE_FAILED`; queries the Grafana data source and saves `grafana-query.json`. `--no-containers` uses a labelled local mock. |
| `python3 "$W5_PACKAGE/release.py" init\|pipeline\|select\|sync\|check\|stop --workspace DIR [--image IMG]` | classroom GitOps adapter (see the docstring in `release.py`). |
| `python3 "$W5_PACKAGE/peer-change.py" SOURCE [--candidate-only]` | simulated peer change: release label `known-good` → `candidate` and (without `--candidate-only`) the rejected-action status 409 → 200. |

Test, rehearse and telemetry refuse an existing non-empty workspace: each attempt needs a new path so
earlier evidence is preserved. Build trees go to a short temporary folder and are removed afterwards;
logs (`build.log`, `migrate.log`, `api.log`, `hint.log`, `tests.log`), the database and the records stay
in the workspace.

## Contents

| Path | Purpose |
|---|---|
| `source/Api/` | ASP.NET Core API (`net10.0`): `Program.cs` (release label, action telemetry middleware), `Routes.cs` (sessions, actions, hint), `Registrations.cs`, `GameDb.cs`, `SqliteStore.cs`, `Migrations/` (InitialSessions), `Telemetry.cs`, `HintClient.cs`, `wwwroot/` (page) |
| `source/Rules/`, `source/Rules.Tests/` | C# treasure rules and xUnit fixture parity (F01–F11, 13 files) |
| `source/Tests/` | HTTP runner: `Program.cs` (accepted flow, rejected flow, atomic save) and `FixtureSupport.cs` |
| `source/hint-server/` | Week 3 hint handler: simulated model modes, validation, deterministic fallback (N, E, S, W) |
| `source/Containerfile` | API image recipe (publish output → `mcr.microsoft.com/dotnet/aspnet:10.0.2`) |
| `gitops/` | configuration repository template: Deployment (1 replica, Recreate, migrate init container, `/data` hostPath), Service, Kustomization, Argo CD Application template |
| `collector/collector.py` | JSON span bridge → Loki push (not OTLP) |
| `grafana/` | provisioned "Academy Loki" data source and the "Hint request evidence" dashboard |
| `browser/` | Playwright 1.61.0 Chromium checker used by `rehearse` |
| `w5lib.py` | shared helpers |

## Routes (Week 5 contract)

`POST /api/sessions` → 201; `GET /api/sessions/{id}` → 200/404; `POST /api/sessions/{id}/actions` →
200, 400 `INVALID_REQUEST`, 409 `ILLEGAL_ACTION`, 409 `GAME_COMPLETE`, 404 `NOT_FOUND`, 500
`SAVE_FAILED`; `POST /api/sessions/{id}/hint` → 200 `{ hint: { action: { type: "move", direction }, explanation } | null, source, requestId }` (W3.07 envelope; explanation 1–160 string units) or 503
`HINT_UNAVAILABLE`; `GET /health` (also `/healthz`) → `Healthy`, 503 without schema.

## Facilitator-supplied (pending)

The W1.08 classroom Git daemon, Kubernetes cluster and Argo CD connection. `release.py sync` uses them
when `W5_GITOPS_REMOTE` (Git remote URL), `W5_ARGOCD_APP` (default `academy-w5`) and `W5_SERVICE_URL`
(the Service URL reachable from the learner shell) are set; otherwise it performs a clearly labelled
local reconcile. No BP tenant, credential or live model is involved.
