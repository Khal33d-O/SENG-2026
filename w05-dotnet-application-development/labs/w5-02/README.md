# W5.02 lab · Register and replace the services

**Session:** W5.02 · Dependency injection and service boundaries · 120 minutes
**Driving question:** What is dependency injection, and why use it?

One 45-minute practical challenge within the module's 120 minutes: 10 minutes retrieval/prediction,
20 concepts, 20 two worked demos, 45 the practical challenge, 15 comparison/repair, 10 individual
knowledge check.

## Outcomes

* Explain dependency injection: the handler receives `IGameRules` and `ISessionStore` instead of
  constructing them; the service collection is the registration list.
* Divide responsibility: routes parse bodies and choose HTTP responses, the rule adapter delegates to
  `Rules.EvaluateMove(board, state, action)`, the store loads/saves envelopes by key.
* Explain singleton, scoped and transient lifetimes, and why a singleton must not capture a scoped
  database context.
* Register and replace a service (`STORE=memory` / `STORE=traced`) without changing domain logic.

## Supplied and owned

Starting point: starter overlay plus the required shared checkpoint and tooling. **Your independent
work is `Api/Registrations.cs`: the three marked library/memory/interface registrations.** Startup,
parser, rules, fixtures, renderer and migration infrastructure are supplied, including
`TracedMemoryStore` and the `STORE` configuration branch.

The starter registers all three services as **transient**, so every request resolves a fresh
`MemoryStore` dictionary: `POST` returns 201 but the following `GET` returns 404.

## Prepare your runnable copy

Stop any earlier host on port 5055. From the pack/repository root:

```bash
python3 learner/units/w05-dotnet-application-development/assets/session-api/prepare.py 02 /tmp/academy-w5-02
```

```bash
cd /tmp/academy-w5-02
dotnet restore Api/Api.csproj
dotnet build Api/Api.csproj --no-restore
STORE=memory dotnet run --no-build --project Api -- --urls http://127.0.0.1:5055
```

The starter deliberately lacks today's target behaviour, so its acceptance check initially fails. It
should still build and serve `/health`.

## Worked demonstrations

Scripts: [examples/w5-02](../../examples/w5-02/README.md).

### Demo 1 · Register library and memory services

Prepare W5.02 and run memory mode. `python3 check.py --case start` initially fails: the POST returns
201 but the following GET returns 404 because the starter resolves a fresh dictionary per request.
Point to the transient registrations. Apply the three singleton registration statements explained in
the module, rebuild/restart and rerun:

```csharp
services.AddSingleton<IGameRules, GameRules>();
services.AddSingleton<MemoryStore>();
services.AddSingleton<ISessionStore>(sp => sp.GetRequiredService<MemoryStore>());
```

The supplied factory lambda obtains the same registered `MemoryStore` instance for the interface; `sp`
is the service provider. Expect `PASS F01 create 201 + retrieve 200`. The same store object now serves
both requests.

### Demo 2 · Replace through the interface

Stop the host, then run the repaired copy or complete checkpoint:

```bash
STORE=traced dotnet run --no-build --project Api -- --urls http://127.0.0.1:5055
```

Second terminal: `python3 check.py --case start`. Expect the same 201/F01 and 200/retained envelope,
with `Training store: load <id>` in host output. Inspect `TracedMemoryStore` and the configuration
registration branch. Neither route nor rule changed. Use a fresh session because switching processes
resets memory.

Offline trace: transient dictionary: `POST` → `201`; `GET` returned ID → `404`. Singleton/decorator:
`POST` → `201`; `GET` returned ID → `200`, F01 unchanged.

## Your one challenge

Repair the lifetimes so a session survives a second request. Run the traced replacement using supplied
configuration and show that the external creation/retrieval contract is unchanged. Draw or annotate
route → interface → implementation.

At minute 10 identify your owned code and predict one result. By minute 25 run the normal case. Use the
remaining time for the rejection/failure or retention observation, evidence and explanation.

Second terminal in your work directory:

```bash
python3 check.py --case start
```

### Acceptance criteria

* Memory mode: `python3 check.py --case start` prints `PASS F01 create 201 + retrieve 200`.
* `STORE=traced`: the same check passes and the host output shows `Training store: load <id>` for the
  ID the checker created.
* No route, rule or store implementation was changed: only the three registrations.

## Hints, in order

1. Trace how many dictionary instances the three registrations create.
2. Use the same singleton MemoryStore for the interface mapping.
3. Switch STORE to traced, create a fresh session, and compare HTTP output with the load log.

## Evidence

Submit your changed functions, an annotated request/storage trace and observed output with
before/after state. Also run the same start check under `STORE=traced` and retain its load log. Use
[evidence.md](evidence.md).

## Compare, individual check and recovery

Use 15 minutes to compare observations with the demo's named contract values and repair one
discrepancy. Each learner must show the same HTTP result with memory and traced stores. A partner's
working copy or a supplied checkpoint alone is not your evidence.

If blocked, preserve your work on a branch or copy, prepare a new directory, compare the named function
with the intentional demo and explain the smallest repair. Record the concept still needing practice.

**Teardown:** stop the host with Ctrl+C; memory sessions disappear with the process.

## Knowledge check (final ten minutes, individually)

1. What does dependency injection supply to the route?
2. Which service must survive requests in memory mode?
3. Why is GameDb scoped later?
4. Does replacing a store require changing EvaluateMove?
5. Show the same HTTP result with memory and traced stores.

## Optional depth

Read the `sqlite` branch in `Registrations.cs`: `GameDb` (via `AddDbContext`) and `SqliteStore` are
scoped, one per request. Predict what would go wrong if `SqliteStore` were registered as a singleton.
