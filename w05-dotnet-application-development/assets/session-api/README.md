# Week 5 session-API package (W5.01–W5.05)

```bash
python3 learner/units/w05-dotnet-application-development/assets/session-api/prepare.py 01 /tmp/academy-w5-01
python3 learner/units/w05-dotnet-application-development/assets/session-api/prepare.py checkpoint /tmp/academy-w5-demo
```

* `prepare.py NN DEST` copies `labs/w5-NN/starter` (this checkpoint with that session's owned code left
  deliberately incomplete). It refuses to overwrite an existing destination.
* `prepare.py checkpoint DEST` copies [`checkpoint/`](checkpoint/), the complete demo/recovery
  reference.

## What a work copy contains

| Path | Purpose |
|---|---|
| `Api/Api.csproj` | ASP.NET Core API, `net10.0`, `Microsoft.EntityFrameworkCore.Sqlite` 10.0.12 |
| `Api/Program.cs` | supplied startup: `STORE`, `GAME_DB`, `TRAINING_FAILURES`, `--migrate`, `--urls` |
| `Api/Routes.cs` | `Create` (W5.01), `Get`, `Act` (W5.03), `Error`, supplied `RequestParser` |
| `Api/Registrations.cs` | service registrations (W5.02) and the supplied `STORE` branch |
| `Api/Contracts.cs` | `Session` envelope, `ReferenceBoard`, `IGameRules`/`GameRules`, `ISessionStore`, `SaveFailure` |
| `Api/MemoryStore.cs`, `Api/TracedMemoryStore.cs` | memory and traced stores |
| `Api/GameDb.cs`, `Api/SqliteStore.cs`, `Api/Migrations/` | EF Core context and mapping (W5.04), SQLite store (W5.04/W5.05), InitialSessions migration |
| `Api/Plumbing.cs` | request IDs and lab headers, error mapping (`SAVE_FAILED`), request gate, `/health`, migrator |
| `Api/wwwroot/` | page: `index.html`, `app.js` (renderer, `perform`), `client.js` (`request`, `sendAction` W5.03) |
| `Rules/`, `Rules.Tests/` | unchanged W4 rules; xUnit fixture parity (`dotnet test`) |
| `fixtures/` | shared F01–F11 (13 files) and `board-reference.json` |
| `check.py` | HTTP acceptance checker: `--case start|action|failure|reload` |

Environment: `STORE=memory|traced|sqlite`, `GAME_DB=<absolute path>` (SQLite), `TRAINING_FAILURES=1`
(enables the `X-Training-Failure: after-write` hook), `LAB_ENV` (public label for `X-Lab-Environment`).
