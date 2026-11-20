#!/usr/bin/env bash
# W5.05 Demo 1/2 · Complete checkpoint with SQLite and TRAINING_FAILURES=1: python3 check.py --case failure PASS.
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${1:-/tmp/academy-w5-05-demo}"
bash "$here/../_lib/checkpoint-demo.sh" failure "$DEST" STORE=sqlite GAME_DB="$DEST/exercise.db" TRAINING_FAILURES=1
