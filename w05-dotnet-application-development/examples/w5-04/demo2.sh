#!/usr/bin/env bash
# W5.04 Demo 2 · Complete mapping and retain a known session: SAVE_FAILED -> mapping/save/load -> PASS,
# then stop/restart on the SAME GAME_DB and reload the original ID (F02).
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$here/../_lib/host.sh"
DEST="${1:-/tmp/academy-w5-04-demo2}"
bash "$here/../_lib/before-after.sh" 04 action "$DEST" Api/GameDb.cs Api/SqliteStore.cs -- STORE=sqlite GAME_DB="$DEST/exercise.db"
ID=$("$PY" -c "import sqlite3,sys;print(sqlite3.connect(sys.argv[1]).execute('select SessionId from Sessions').fetchall()[-1][0])" "$DEST/exercise.db")
echo "== restart on the same file and reload $ID"
start_host "$DEST" STORE=sqlite GAME_DB="$DEST/exercise.db"
(cd "$DEST" && "$PY" check.py --case reload --id "$ID" --expect F02)
stop_host
echo "== reapply --migrate while the host is stopped: already applied, the row remains"
(cd "$DEST" && STORE=sqlite GAME_DB="$DEST/exercise.db" dotnet run --no-build --project Api -- --migrate | tail -2)
