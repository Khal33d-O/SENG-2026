# W5.04 worked examples · Data persistence with SQLite and Entity Framework Core

| Script | Demonstration | Expected |
|---|---|---|
| [demo1.sh](demo1.sh) | Demo 1 · Follow an envelope into a keyed row (complete checkpoint, `/tmp/academy-w5-demo/game.db`) | `Applied migrations: ..._InitialSessions`; `PASS action`; one row `(SessionId, 'reference', '{"position":...}')` and `[('<id>_InitialSessions',)]` |
| [demo2.sh](demo2.sh) | Demo 2 · Complete mapping and retain a known session | before: `500 SAVE_FAILED`; after: `PASS action`; restart on the same file: `PASS reload <id> equals F02`; reapplying `--migrate`: `No pending migrations` |
| [inspect_db.py](inspect_db.py) | the book's read-only `python3 -c 'import sqlite3; ...'` command as a script | as above |

The book's commands:

```bash
STORE=sqlite GAME_DB=/tmp/academy-w5-04/exercise.db dotnet run --no-build --project Api -- --migrate
STORE=sqlite GAME_DB=/tmp/academy-w5-04/exercise.db TRAINING_FAILURES=1 dotnet run --no-build --project Api -- --urls http://127.0.0.1:5055
```

```bash
python3 -c 'import sqlite3; c=sqlite3.connect("/tmp/academy-w5-demo/game.db"); print(c.execute("select SessionId, BoardId, StateJson from Sessions limit 1").fetchone()); print(c.execute("select MigrationId from __EFMigrationsHistory").fetchall())'
```

Offline trace: migrate → InitialSessions applied; create → `201`; east → `200`/F02; stop/start same
file; GET original ID → `200`/F02. New filename is a new empty database, not recovery.
