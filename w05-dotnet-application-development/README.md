# Week 5 · .NET Application Development

The browser game you built in Weeks 1–4 now runs behind a real server. Week 5 puts the unchanged
Week 4 C# treasure rules behind an ASP.NET Core API, stores sessions in SQLite with Entity Framework
Core, tests the API over HTTP, records action telemetry, and releases the result through a classroom
GitOps workflow. Week 5 ends with Project 5, an integrated and deployed academy game.

## Sessions

| Session | Title | Owned work | Lab | Package |
|---|---|---|---|---|
| W5.01 | ASP.NET Core and HTTP contracts | `Api/Routes.cs`: `Create` | [labs/w5-01](labs/w5-01/README.md) | session-api |
| W5.02 | Dependency injection and service boundaries | `Api/Registrations.cs`: three registrations | [labs/w5-02](labs/w5-02/README.md) | session-api |
| W5.03 | Validated actions from browser to API | `Api/Routes.cs`: `Act`; `Api/wwwroot/client.js`: `sendAction` | [labs/w5-03](labs/w5-03/README.md) | session-api |
| W5.04 | Data persistence with SQLite and Entity Framework Core | `Api/GameDb.cs`: `SessionMapping.ToRow`; `Api/SqliteStore.cs`: `LoadAsync`, `SaveAsync` | [labs/w5-04](labs/w5-04/README.md) | session-api |
| W5.05 | Asynchronous persistence and consistent updates | `Api/SqliteStore.cs`: transaction and commit | [labs/w5-05](labs/w5-05/README.md) | session-api |
| W5.06 | API integration tests | `Tests/Program.cs`: rejected-flow assertions | [labs/w5-06](labs/w5-06/README.md) | integrated-release |
| W5.07 | .NET logging and OpenTelemetry | `Api/Program.cs`: action tags and structured log | [labs/w5-07](labs/w5-07/README.md) | integrated-release |
| W5.08 | Collaborative delivery and pipeline gates | review note, corrected diff, pipeline/configuration evidence | [labs/w5-08](labs/w5-08/README.md) | integrated-release |
| W5.09 | Deployment health and recovery | image/configuration commits, readiness and recovery evidence | [labs/w5-09](labs/w5-09/README.md) | integrated-release |
| W5.10 | Project preparation: release acceptance and handover | acceptance checklist, bounded gaps, handover outline | [labs/w5-10](labs/w5-10/README.md) | integrated-release |
| P5 | Integrated and deployed academy game (540 minutes) | at most three agreed gaps | [projects/p5](projects/p5/README.md) | integrated-release |

Every session is 120 minutes: 10 retrieval/prediction, 20 concepts, 20 two worked demonstrations,
45 one practical challenge, 15 comparison/repair, 10 individual knowledge check.

## How the labs are organised

* `assets/session-api/` (W5.01–W5.05). `prepare.py NN DEST` copies the session starter
  (`labs/w5-NN/starter`, the shared checkpoint with only today's owned code left incomplete) to a new
  directory and refuses to overwrite existing work. `prepare.py checkpoint DEST` copies the complete
  checkpoint used for demonstrations and recovery. Each work copy contains `check.py` (the HTTP
  acceptance checker), `fixtures/` (the shared F01–F11 fixtures, byte-identical) and the solution
  `Academy.slnx` (`Rules`, `Rules.Tests`, `Api`).
* `assets/integrated-release/` (W5.06–W5.10, P5): the reviewed integrated package.
  * `prepare.py NN DEST`: owned-scope starters for 06 and 07, the complete checkpoint for 08–10.
  * `run.py test|rehearse|serve|telemetry --workspace DIR [--source SRC] [--hint-mode success|validation|timeout]`:
    builds the source, creates `DIR/data/game.db`, applies the migration explicitly, starts the local
    hint server (simulated model only) and the API, and stops everything it started.
  * `release.py init|pipeline|select|sync|check|stop --workspace DIR`: the classroom GitOps adapter.
  * `peer-change.py`: the simulated peer change for W5.08/W5.09.
  * `source/`: browser page, ASP.NET Core API, C# rules, EF Core migration, hint server, HTTP runner
    (`Tests/Program.cs`, `Tests/FixtureSupport.cs`), `Containerfile`; `gitops/`: deployment YAML;
    `collector/` and `grafana/`: the local telemetry path; `browser/`: the Chromium checker.
* `labs/w5-NN/`: `README.md` (the lab brief), `starter/` and `evidence.md` (your evidence template).
* `examples/w5-NN/`: the worked demonstrations as runnable command scripts with expected output.

## Prerequisites and tool versions

| Tool | Course pin | Notes |
|---|---|---|
| .NET SDK | 10.0.401 (`net10.0`) | `global.json` allows any 10.0.1xx+ feature band (`rollForward: latestFeature`); verified locally with 10.0.102 |
| EF Core / SQLite | `Microsoft.EntityFrameworkCore.Sqlite` 10.0.12 | restored from NuGet by `dotnet restore` |
| OpenTelemetry | `OpenTelemetry.Extensions.Hosting` 1.19.0 | integrated package only |
| xUnit | `xunit` 2.9.3, `Microsoft.NET.Test.Sdk` 17.14.1 | fixture parity tests (`dotnet test`) |
| Python | 3.x | standard library only (`check.py`, `prepare.py`, `run.py`, `release.py`) |
| Node.js | 22.23.2 | the local hint server; the browser checker needs Playwright 1.61.0 + Chromium |
| Git | any recent | W5.08–W5.10 |
| Podman | 5.x | W5.07 Loki/Grafana; W5.08/W5.09 image builds (a labelled local-archive fallback exists) |

On Windows, run the commands in Git Bash. If `python3` is not available there, define
`python3() { python "$@"; }` once per terminal, or type `python` instead. The `STORE=memory dotnet run ...`
form sets an environment variable for one command in Bash; in PowerShell use
`$env:STORE='memory'; dotnet run ...`.

## The HTTP contract used this week

| Route | Success | Failures |
|---|---|---|
| `POST /api/sessions` `{ "boardId": "reference" }` | `201` + `Location: /api/sessions/{id}` + envelope | `400 INVALID_REQUEST`, `404 NOT_FOUND` |
| `GET /api/sessions/{id}` | `200` envelope | `404 NOT_FOUND` |
| `POST /api/sessions/{id}/actions` `{ "type": "move", "direction": "east" }` | `200` envelope | `400 INVALID_REQUEST`, `409 ILLEGAL_ACTION`, `409 GAME_COMPLETE`, `404 NOT_FOUND`, `500 SAVE_FAILED` |
| `POST /api/sessions/{id}/hint` (integrated package) | `200 { hint: { action: { type: "move", direction }, explanation } \| null, source, requestId }` (the W3.07 envelope) | `404 NOT_FOUND`, `503 HINT_UNAVAILABLE` |
| `GET /api/boards/reference` | `200` board | `404 NOT_FOUND` |
| `GET /health` and `GET /healthz` | `200 Healthy` | `503` when the SQLite schema is missing |

The envelope is `{ "sessionId", "boardId", "state", "id" }` (`id` repeats `sessionId` for the shared
API contract). Every error body is `{ "code", "message", "requestId" }`; the same request ID is in the
`X-Request-Id` header. Every response also carries `X-Lab-Release` and `X-Lab-Environment`.

## Data protection and limits

No live model, provider key, credential or BP environment is used. Hints come from a deterministic
simulated model. The classroom Git daemon, Kubernetes cluster and Argo CD connection (W1.08) are
facilitator-supplied; without them `release.py sync` performs a clearly labelled local reconcile.
Do not copy private environment files or kubeconfig into your work.
