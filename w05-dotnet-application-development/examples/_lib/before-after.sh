#!/usr/bin/env bash
# before-after.sh NN CASE DEST FILE... [-- ENV=VALUE ...]
# Prepares the W5.NN starter in DEST, runs `check.py --case CASE` (expected FAIL), then copies the named
# FILEs from the complete checkpoint (the instructor's live edit), rebuilds and reruns (expected PASS).
# SQLite sessions pass STORE=sqlite GAME_DB=... and get an explicit --migrate first.
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$here/host.sh"
NN="$1"; CASE="$2"; DEST="$3"; shift 3
FILES=(); while [ $# -gt 0 ] && [ "$1" != "--" ]; do FILES+=("$1"); shift; done
[ "${1:-}" = "--" ] && shift
ENVS=("$@"); [ ${#ENVS[@]} -eq 0 ] && ENVS=(STORE=memory)
CHECKPOINT="learner/units/w05-dotnet-application-development/assets/session-api/checkpoint"

"$PY" "$PREPARE" "$NN" "$DEST"
build_copy "$DEST"
migrate() { if printf '%s\n' "${ENVS[@]}" | grep -q '^STORE=sqlite'; then (cd "$DEST" && env "${ENVS[@]}" dotnet run --no-build --project Api -- --migrate | tail -2); fi; }
migrate
start_host "$DEST" "${ENVS[@]}" TRAINING_FAILURES=1
echo "== BEFORE (starter): expected FAIL"
(cd "$DEST" && "$PY" check.py --case "$CASE") || echo "(exit $? retained as the failed observation)"
stop_host
for f in "${FILES[@]}"; do cp "$CHECKPOINT/$f" "$DEST/$f"; echo "applied the module's statements: $f"; done
build_copy "$DEST"
start_host "$DEST" "${ENVS[@]}" TRAINING_FAILURES=1
echo "== AFTER: expected PASS"
(cd "$DEST" && "$PY" check.py --case "$CASE")
stop_host
