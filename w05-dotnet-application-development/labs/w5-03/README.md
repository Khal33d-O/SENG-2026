# W5.03 lab · Connect one validated browser action

**Session:** W5.03 · Validated actions from browser to API · 120 minutes
**Driving question:** Why does the API validate an action and calculate its outcome?

One 45-minute practical challenge within the module's 120 minutes: 10 minutes retrieval/prediction,
20 concepts, 20 two worked demos, 45 the practical challenge, 15 comparison/repair, 10 individual
knowledge check.

## Outcomes

* Explain why the API accepts only an action (`{ "type": "move", "direction": "east" }`) and loads
  the session's authoritative state instead of trusting a browser-asserted state or score.
* Distinguish input-shape validation (`400 INVALID_REQUEST`) from domain validation (`409
  ILLEGAL_ACTION`, `409 GAME_COMPLETE`) and a missing session (`404`).
* Submit an action from the browser and render only the server's confirmed response.
* Verify that a rejected action produces a useful error and leaves stored state unchanged.

## Supplied and owned

**Your independent work is `Api/Routes.cs`: `Act` after supplied shape validation/load, and
`Api/wwwroot/client.js`: `sendAction`.** Startup, parser, rules, fixtures, renderer (`app.js`) and
migration infrastructure are supplied. In the starter, creation already works; the incomplete action
route returns `501 EXERCISE_INCOMPLETE` and `sendAction` throws.

## Prepare your runnable copy

```bash
python3 learner/units/w05-dotnet-application-development/assets/session-api/prepare.py 03 /tmp/academy-w5-03
```

```bash
cd /tmp/academy-w5-03
dotnet restore Api/Api.csproj
dotnet build Api/Api.csproj --no-restore
STORE=memory dotnet run --no-build --project Api -- --urls http://127.0.0.1:5055
```

## Concepts you will apply

The route evaluates with the unchanged library, returns before saving on rejection, and saves the
accepted envelope:

```csharp
var result = rules.Apply(ReferenceBoard.Value, session.State, new MoveAction(type, direction));
```

```csharp
if (!result.Accepted) return Error(context, 409, result.Reason!, "Move rejected; confirmed state is unchanged.");
```

```csharp
var updated = session with { State = result.State };
await store.SaveAsync(updated);
return Results.Ok(updated);
```

The record `with` expression creates a new envelope. The null-forgiving `!` uses the supplied rule
contract that a rejection has a reason; it does not validate anything at runtime. In your work copy
keep the supplied failure parameter wiring: the save line is `await store.SaveAsync(updated, failAfterWrite);`
(the training-failure flag is taught in W5.05; it is supplied plumbing, not your input validator).

In the browser, `sendAction` awaits the supplied `request` helper with the session action path and an
action-only body. This deliberately replaces W2's local `applyMove` call:

```javascript
return await request(`/api/sessions/${sessionId}/actions`, { type: 'move', direction }, fail);
```

The supplied `perform` function in `app.js` disables buttons while pending, assigns `confirmed` only
after success and shows a recoverable error on rejection. No automatic state-changing retries.

## Worked demonstrations

Scripts: [examples/w5-03](../../examples/w5-03/README.md).

### Demo 1 · Implement the action boundary

In the work copy, creation already works. Its incomplete action route returns 501. Read the supplied
validation and load first, then implement the module's evaluate/reject/copy/save/OK pattern in
`Routes.Act`. Rebuild/restart in memory mode. In a second terminal:

```bash
python3 check.py --case action
```

Expect East 200/F02, South `409 ILLEGAL_ACTION`, malformed bodies `400 INVALID_REQUEST` and a missing
session 404, each error with `requestId`. GET after rejection still equals F02.

### Demo 2 · Connect and inspect the browser

Complete `sendAction` with the module's action-only request call. Open `http://127.0.0.1:5055`, open
Network, choose New game, East, then South. Expect (1,0), five moves and score 0 after East. South
displays `ILLEGAL_ACTION` and a request ID; every displayed state field remains unchanged. Choose Load
session and compare it again. Inspect the request body: type/direction only. `app.js` assigns
confirmed state only after the awaited request succeeds.

Offline trace: east → 200, (1,0), moves 5; south → 409 `ILLEGAL_ACTION`; subsequent GET returns exactly
the East envelope. A missing direction is 400, not the wall's 409.

## Your one challenge

Complete rule evaluation, rejected early return, accepted envelope/save/200 and the action-only client
request. Show browser East then South, inspect the request and response, and reload the session to
prove retained state. Rebuild and restart after C# edits; reload the browser after client edits.

```bash
python3 check.py --case action
```

### Acceptance criteria

* `python3 check.py --case action` prints `PASS action: East 200/F02, South 409 ILLEGAL_ACTION, malformed 400, missing 404`.
* Browser: East shows (1,0), 5 moves, score 0; South shows `ILLEGAL_ACTION` with a request ID and the
  display is unchanged; Load session shows the same state.
* The Network panel shows an action-only request body.

## Hints, in order

1. Use the stored state, not anything asserted by the browser.
2. Return immediately on a rejected result; only the accepted branch saves.
3. The client request must return the awaited success envelope; let its error reach perform.

## Evidence

Submit your changed functions, an annotated request/storage trace and observed output with
before/after state. Record the browser error and subsequent GET as well as the checker result. Use
[evidence.md](evidence.md).

## Compare, individual check and recovery

Use 15 minutes to compare observations and repair one discrepancy. Each learner must demonstrate an
error and prove stored state is unchanged. The browser showing its old state alone would not prove
that the store remained unchanged: use Load session or the checker's GET.

If blocked, preserve your work, prepare a new directory, compare the named function with the
intentional demo and explain the smallest repair. **Teardown:** Ctrl+C stops the host.

## Knowledge check (final ten minutes, individually)

1. Why must the browser not send an asserted score?
2. Which response fits a missing direction?
3. Which response fits a south move into the wall?
4. Where does confirmed state change in the browser?
5. Demonstrate an error and prove stored state is unchanged.

## Optional depth

Play East, East, South, South to win, then send one more action: expect `409 GAME_COMPLETE` and an
unchanged GET.
