# W5.01 lab · Add the session creation route

**Session:** W5.01 · ASP.NET Core and HTTP contracts · 120 minutes
**Driving question:** What changes when I implement the server behind a familiar HTTP request?

One 45-minute practical challenge within the module's 120 minutes: 10 minutes retrieval/prediction,
20 concepts, 20 two worked demos, 45 the practical challenge, 15 comparison/repair, 10 individual
knowledge check.

## Outcomes

By the end you can:

* Explain how ASP.NET Core selects a handler from an HTTP method and path (`POST /api/sessions`,
  `GET /api/sessions/{id}`) and why `{id}` is a route parameter, not a JSON field.
* Relate routes, request bodies and responses to the agreed contract: 201 Created with a Location,
  400 `INVALID_REQUEST`, 404 `NOT_FOUND`, each error with code, message and `requestId`.
* Distinguish the internal C# model (`MovesRemaining`) from the external envelope (`sessionId`,
  `boardId`, `state` with camelCase `movesRemaining`).
* Verify a route against the F01 fixture with an independent GET before connecting a browser action.

## Supplied and owned

Starting point: starter overlay plus the required shared checkpoint and tooling. The complete
checkpoint is a supplied demo/recovery reference. **Your independent work is `Api/Routes.cs`:
`Create` after the supplied board validation.** Startup, parser, rules, fixtures, renderer and
migration infrastructure are supplied.

| Path in your work copy | Status |
|---|---|
| `Api/Routes.cs` → `Create` (between the `W5.01 owned` markers) | **you complete it** (starter returns `501 EXERCISE_INCOMPLETE`) |
| `Api/Program.cs`, `Api/Plumbing.cs`, `Api/Contracts.cs`, `Api/Registrations.cs`, `Api/MemoryStore.cs` | supplied |
| `Rules/` (unchanged W4 rules), `Rules.Tests/` (fixture parity) | supplied |
| `check.py`, `fixtures/F01.json` … `fixtures/F11.json` | supplied |

The [starter](starter/) folder is exactly what `prepare.py 01` copies.

## Prerequisites

.NET SDK 10.0.401 (course pin; any 10.0 SDK with `rollForward` works), Python 3, curl. Stop any
earlier host on port 5055. On Windows use Git Bash (see the [week README](../../README.md)).

## Prepare your runnable copy

Choose a new destination if the example already exists; the preparation command refuses to overwrite
your work. From the pack/repository root (the `source/` folder of this course):

```bash
python3 learner/units/w05-dotnet-application-development/assets/session-api/prepare.py 01 /tmp/academy-w5-01
```

```bash
cd /tmp/academy-w5-01
dotnet restore Api/Api.csproj
dotnet build Api/Api.csproj --no-restore
STORE=memory dotnet run --no-build --project Api -- --urls http://127.0.0.1:5055
```

The starter deliberately lacks today's target behaviour, so its acceptance check initially fails. It
should still build and serve `/health`.

## Worked demonstrations

Predict the named fields/status before running each command. Scripts for both demos are in
[examples/w5-01](../../examples/w5-01/README.md).

### Demo 1 · Run the supplied in-memory route

Start the complete checkpoint in memory mode (`prepare.py checkpoint /tmp/academy-w5-demo`, then the
commands above in that folder). In a second terminal there:

```bash
curl -i -H 'Content-Type: application/json' -d '{"boardId":"reference"}' http://127.0.0.1:5055/api/sessions
```

```bash
python3 check.py --case start
```

Predict 201, a Location containing the new ID and F01. Observe the external camelCase fields. The
checker additionally retrieves that ID (200) and tries missing/unknown board input (400/404 with
error/message/requestId).

### Demo 2 · Add the bounded route around the library

In a fresh W5.01 work copy, run the starter and repeat the POST: expected `501 EXERCISE_INCOMPLETE`, a
clearly marked exercise response rather than the contract solution. In `Routes.Create`, after supplied
validation, use the three route statements explained in the module: create the envelope from
`rules.Start`, await save and return Created.

```csharp
var session = new Session(Guid.NewGuid().ToString("N"), boardId,
    rules.Start(ReferenceBoard.Value));
```

```csharp
await store.SaveAsync(session);
return Results.Created($"/api/sessions/{session.SessionId}", session);
```

`Guid` ID generation and the interpolation that builds Location are supplied patterns; only the
envelope/save/response lines are your route task. Stop, rebuild and run again; `python3 check.py --case start`
must now pass. Compare `state` with `fixtures/F01.json`. Annotate why the library state alone was not
the complete response.

Offline trace: `POST {}` → `400 INVALID_REQUEST`; `POST {boardId:reference}` → `201`, Location
`/api/sessions/<id>`, state F01; `GET <id>` → `200`, same envelope.

## Your one challenge

Create the envelope from the library, await saving it, and return Created with its Location. Annotate
method/path, request body, status, Location and each response envelope field.

At minute 10 identify your owned code and predict one result. By minute 25 run the normal case. Use the
remaining time for the rejection/failure or retention observation, evidence and explanation. Rebuild
and restart after C# edits.

Second terminal in your work directory:

```bash
python3 check.py --case start
```

### Acceptance criteria

* `python3 check.py --case start` prints `PASS F01 create 201 + retrieve 200` and exits 0.
* The POST returns `201` with `Location: /api/sessions/<sessionId>`; the body is the envelope with
  `state` equal to F01: `(0,0)`, six moves, score 0, no collected IDs, `playing`.
* `GET /api/sessions/<sessionId>` returns `200` and the same envelope.
* `POST {}` returns `400 INVALID_REQUEST`; an unknown board returns `404 NOT_FOUND`; both carry
  `code`, `message` and `requestId`.

## Hints, in order

1. Read the envelope constructor parameters: ID, board ID, state.
2. Use `rules.Start` rather than handwriting a new initial state.
3. Await `SaveAsync` before `Results.Created`; Location points to the GET route.

## Evidence

Submit your changed functions, an annotated request/storage trace and observed output with
before/after state. Include the 201 Location and explain each envelope field. Use
[evidence.md](evidence.md) and retain one failed observation (the starter's 501) with your repair
explanation.

## Compare, individual check and recovery

Use 15 minutes to compare observations with the demo's named contract values and repair one
discrepancy. Each learner must show the route and explain why its initial state matches F01. A
partner's working copy or a supplied checkpoint alone is not your evidence.

If blocked, preserve your work on a branch or copy, prepare a new directory, compare the named function
with the intentional demo and explain the smallest repair. Record the concept still needing practice.
An alternative agreed game uses its own explicit normal/invalid/completion fixtures while retaining
these boundaries; no new engine, database design or interface is required.

**Teardown:** stop the host with Ctrl+C. Memory mode keeps nothing; delete `/tmp/academy-w5-01` only
after your evidence is recorded.

## Knowledge check (final ten minutes, individually)

1. Why is a successful creation 201?
2. How does MovesRemaining appear externally?
3. Why are boardId and sessionId separate?
4. What does the GET after creation check?
5. Show the route and explain why its initial state matches F01.

## Optional depth

* Run `dotnet test` in the work copy: `Rules.Tests` runs all 13 shared fixtures through the C# rules.
* Try `STORE=traced` (W5.02) and compare the host output for the same check.
