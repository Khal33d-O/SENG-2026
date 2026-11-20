#!/usr/bin/env bash
# W5.05 Demo 2 · Starter without the outer transaction: the failure check FAILS (row advanced despite 500);
# add begin/dispose and commit (the checkpoint's SqliteStore.cs), rebuild and rerun: PASS.
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${1:-/tmp/academy-w5-05-demo2}"
bash "$here/../_lib/before-after.sh" 05 failure "$DEST" Api/SqliteStore.cs -- STORE=sqlite GAME_DB="$DEST/exercise.db"
