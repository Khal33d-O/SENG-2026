# W5.05 lab · Preserve confirmed state when a save fails

**Session:** W5.05 · Asynchronous persistence and consistent updates · 120 minutes
**Driving question:** How do asynchronous database operations fit into an API request?

One 45-minute practical challenge within the module's 120 minutes: 10 minutes retrieval/prediction,
20 concepts, 20 two worked demos, 45 the practical challenge, 15 comparison/repair, 10 individual
knowledge check.

## Outcomes

* Explain how `await` lets the route wait for database work, and why the route must await saving
  before returning 200 (no fire-and-forget, no `.Result`, no automatic retry).
* Explain atomicity for position, score, moves and collected IDs.
* Save related changes together inside an explicit outer transaction.
* Demonstrate that a failed operation leaves the previous state intact.

## Supplied and owned

**Your independent work is `Api/SqliteStore.cs`: transaction lifetime and commit in `SaveAsync`.**
The row lookup, mapping, the teaching failure after `SaveChangesAsync` and the request middleware that
maps it to `500 SAVE_FAILED` are supplied. The starter intentionally lacks the outer transaction: its
failed-save check fails because the row advanced despite the error.

## Prepare your runnable copy

```bash
python3 learner/units/w05-dotnet-application-development/assets/session-api/prepare.py 05 /tmp/academy-w5-05
```

```bash
cd /tmp/academy-w5-05
dotnet restore Api/Api.csproj
dotnet build Api/Api.csproj --no-restore
STORE=sqlite GAME_DB=/tmp/academy-w5-05/exercise.db dotnet run --no-build --project Api -- --migrate
```

```bash
STORE=sqlite GAME_DB=/tmp/academy-w5-05/exercise.db TRAINING_FAILURES=1 dotnet run --no-build --project Api -- --urls http://127.0.0.1:5055
```

`exercise.db` is created by these commands. Use an isolated database for this lab.

## Concepts you will apply

Surround the supplied operations with the prepared EF transaction pattern:

```csharp
await using var transaction = await db.Database.BeginTransactionAsync();
// supplied row lookup, mapping and added/modified fields
await db.SaveChangesAsync();
if (failAfterWrite) throw new SaveFailure();
await transaction.CommitAsync();
```

`await using` disposes the transaction asynchronously at scope exit. An exception before commit leaves
it uncommitted; disposal rolls it back. Commit happens only after all related work succeeds. Do not
catch and ignore the exception or return 200 anyway.

With `TRAINING_FAILURES=1`, the header `X-Training-Failure: after-write` on one accepted action (the
browser's **Fail next save** box) triggers the supplied failure after SQL has written candidate values
but before commit. The hook is request-local.

## Worked demonstrations

Scripts: [examples/w5-05](../../examples/w5-05/README.md).

### Demo 1 · Browser action with persistent storage

Use a fresh migrated file and the complete checkpoint with `STORE=sqlite`, that absolute `GAME_DB` and
`TRAINING_FAILURES=1`. In the browser choose New game, East, then South. Expect F02 followed by
`409 ILLEGAL_ACTION` with F02 retained. Choose Load session to observe the persistent state.

### Demo 2 · Fail after writing and before commit

On that session tick Fail next save and click East. Expect `500 SAVE_FAILED` with `requestId`, while
position stays (1,0), score 0, moves 5 and collected IDs empty. Load session must agree. In the second
terminal:

```bash
python3 check.py --case failure
```

Expected `PASS failed save retains every state field`. Then run the starter on a separate migrated
file: this check initially fails because its missing outer transaction allows the candidate row to
remain after the error. Add begin/dispose and commit as taught, rebuild/restart and rerun. Explicitly
choose a later normal East to confirm recovery: (2,0), score 10, moves 4, collected IDs `["t1"]`. No
automatic retry should appear in Network.

Offline trace: before F02; attempted East writes candidate F02+treasure; injected exception before
commit → 500; disposal rolls back; GET remains F02. In the broken starter GET has moved despite 500,
so the check fails.

## Your one challenge

Repair the supplied async operation so the after-write failure rolls back. Capture browser error,
before/after GET equality and a later explicitly requested successful action. Explain the
await/save/commit ordering.

```bash
python3 check.py --case failure
```

### Acceptance criteria

* Before your repair: `FAIL failure: failed save retained candidate state` (keep this output).
* After: `PASS failed save retains every state field; later East succeeds`.
* Browser: `SAVE_FAILED` with a request ID, display and Load session still F02, then a normal East
  succeeds with (2,0), score 10, moves 4, `["t1"]`.

## Hints, in order

1. Locate the failure relative to SaveChangesAsync.
2. Keep an outer transaction alive until after that failure guard.
3. Use await using for disposal and await CommitAsync only on the successful path.

## Evidence

Submit your changed functions, an annotated request/storage trace and observed output with
before/after state. Record the browser error and subsequent GET as well as the checker result. Use
[evidence.md](evidence.md).

## Compare, individual check and recovery

Each learner must show browser and stored state after the injected failure. The repaired demonstration
proves rollback in this single-instance training host; it does not establish distributed transactions,
production readiness or a BP recovery service.

**Teardown:** stop the host; keep `exercise.db` until your evidence is recorded.

## Knowledge check (final ten minutes, individually)

1. Why must the route await saving before returning success?
2. What does atomic mean for treasure, score and moves?
3. Why is this outer transaction needed despite SaveChanges?
4. When does an uncommitted transaction roll back?
5. Show browser and stored state after the injected failure.

## Optional depth

If storage were later extended to multiple related rows, every write would go in the same transaction.
That extension is not today's build.
