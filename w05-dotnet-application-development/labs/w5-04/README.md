# W5.04 lab · Map, save and reload one session

**Session:** W5.04 · Data persistence with SQLite and Entity Framework Core · 120 minutes
**Driving question:** What changes when a session moves from memory to retained storage?

One 45-minute practical challenge within the module's 120 minutes: 10 minutes retrieval/prediction,
20 concepts, 20 two worked demos, 45 the practical challenge, 15 comparison/repair, 10 individual
knowledge check.

## Outcomes

* Explain retention: SQLite writes a file that outlives the process; the same path means the same
  database, a new filename is a new database.
* Describe the `Sessions` table, a `SessionRow`, the `SessionId` primary key and `StateJson` (the
  whole state as JSON text, not another table and not a second HTTP shape).
* Use the supplied EF Core `GameDb` mapping to save and load one envelope by key.
* Apply the explicit migration and verify save/reload across a restart without confusing schema
  creation with data recovery.

## Supplied and owned

**Your independent work is `Api/GameDb.cs`: `SessionMapping.ToRow`; `Api/SqliteStore.cs`:
`LoadAsync` and `SaveAsync`.** The `GameDb` context, the schema decisions (table, key, required
columns), the `InitialSessions` migration in `Api/Migrations/`, `SessionMapping.FromRow`, startup and
the `--migrate` command are supplied. Do not change the schema today.

The starter compiles and migrates, but saving reports `500 SAVE_FAILED` until the mapping and
save/load methods are completed.

## Prepare your runnable copy

```bash
python3 learner/units/w05-dotnet-application-development/assets/session-api/prepare.py 04 /tmp/academy-w5-04
```

```bash
cd /tmp/academy-w5-04
dotnet restore Api/Api.csproj
dotnet build Api/Api.csproj --no-restore
STORE=sqlite GAME_DB=/tmp/academy-w5-04/exercise.db dotnet run --no-build --project Api -- --migrate
```

```bash
STORE=sqlite GAME_DB=/tmp/academy-w5-04/exercise.db TRAINING_FAILURES=1 dotnet run --no-build --project Api -- --urls http://127.0.0.1:5055
```

The first `dotnet run` applies the migration (`MigrateAsync`, not `EnsureCreated`) and exits; the
second starts the host on the same absolute `GAME_DB` path. `exercise.db` is created by these commands;
it is never part of the starter.

## Concepts you will apply

Use the supplied web serializer options so every state field survives:

```csharp
StateJson = JsonSerializer.Serialize(session.State, Json)
```

`await db.Sessions.AsNoTracking().SingleOrDefaultAsync(s => s.SessionId == id)` queries by key and
returns a row or null; `SessionMapping.FromRow(row)` performs the supplied reverse conversion. When
saving, find by key, `Add` a new mapped row or assign both mapped fields to the existing row, then
`await db.SaveChangesAsync()`. Add the `async` modifier to the starter methods:
`public async Task<Session?> LoadAsync(string id)` and
`public async Task SaveAsync(Session session, bool failAfterWrite = false)`.

## Worked demonstrations

Scripts: [examples/w5-04](../../examples/w5-04/README.md).

### Demo 1 · Follow an envelope into a keyed row

Run the complete checkpoint's explicit migration and SQLite host (database
`/tmp/academy-w5-demo/game.db`). `python3 check.py --case action` creates a session and prints its F02
envelope. In a second terminal inspect the retained file (read-only observation):

```bash
python3 -c 'import sqlite3; c=sqlite3.connect("/tmp/academy-w5-demo/game.db"); print(c.execute("select SessionId, BoardId, StateJson from Sessions limit 1").fetchone()); print(c.execute("select MigrationId from __EFMigrationsHistory").fetchall())'
```

Expect one key, reference board ID and JSON text containing all GameState fields, plus the
InitialSessions migration ID. The first row may be another earlier demo session; locate your recorded
ID when comparing state. Explain the conversion rather than treating StateJson as a second HTTP shape.

### Demo 2 · Complete mapping and retain a known session

Prepare the W5.04 starter. It compiles and migrates, but saving reports SAVE_FAILED until the mapping
and save/load methods are completed. Map ID/board/state, query by key, Add or update the mapped fields
and await saving. Run the guided migration, then create a browser session and click East. Record its
session ID. Stop/restart using the same `GAME_DB` path and choose Load session for the original ID.
Expect F02: (1,0), score 0, five moves, no treasure, playing. Reapply `--migrate` while the host is
stopped: the same migration is already applied and the row remains.

Offline trace: migrate → InitialSessions applied; create → 201; east → 200/F02; stop/start same file;
GET original ID → 200/F02. New filename is a new empty database, not recovery.

## Your one challenge

Complete the value mapping and bounded keyed save/load using the supplied context and migration. Apply
the migration, create and move a session, stop/restart the host on the same database file and retrieve
the original ID.

```bash
python3 check.py --case action
```

After the restart you can also run `python3 check.py --case reload --id <sessionId> --expect F02`.

### Acceptance criteria

* `python3 check.py --case action` passes against `STORE=sqlite`.
* After stopping and restarting with the same absolute `GAME_DB`, the original session ID returns
  F02 in every field (browser Load session or `check.py --case reload`).
* Reapplying `--migrate` reports no pending migrations and the row remains.

## Hints, in order

1. Copy SessionId and BoardId; serialize the complete state with the supplied Json options.
2. Load by key using SingleOrDefaultAsync and map a row only when it exists.
3. On save, Add when absent; otherwise assign BoardId and StateJson, then await SaveChangesAsync.

## Evidence

Submit your changed functions, an annotated request/storage trace and observed output with
before/after state. Record the original session ID and exact database path across restart. Use
[evidence.md](evidence.md).

## Compare, individual check and recovery

Each learner must reload their recorded session after restarting the process. A fresh session after
restart proves only creation, not retention. Do not copy a live SQLite file or delete your evidence to
recover from an error; first stop the host and preserve your work. A new filename is a clean reset, not
restoration.

**Teardown:** stop the host; keep `exercise.db` until your evidence is recorded.

## Knowledge check (final ten minutes, individually)

1. What is the primary key and what does it identify?
2. Does StateJson change the HTTP response shape?
3. What does SaveChangesAsync do?
4. Can a migration recover a deleted session?
5. Reload your recorded session after restarting the process.

## Optional depth

Open `Api/Migrations/*_InitialSessions.cs` and match each `CreateTable` line to `GameDb.OnModelCreating`.
