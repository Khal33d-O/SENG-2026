#!/usr/bin/env bash
# W5.04 Demo 1 · Follow an envelope into a keyed row (complete checkpoint, SQLite, explicit migration).
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${1:-/tmp/academy-w5-demo}"
PY=python3; python3 -c "" >/dev/null 2>&1 || PY=python  # Windows: python3 may be a Store stub
bash "$here/../_lib/checkpoint-demo.sh" action "$DEST" STORE=sqlite GAME_DB="$DEST/game.db" TRAINING_FAILURES=1
"$PY" "$here/inspect_db.py" "$DEST/game.db"
