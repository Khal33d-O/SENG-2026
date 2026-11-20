#!/usr/bin/env bash
# checkpoint-demo.sh CASE DEST [ENV=VALUE ...] : run the complete checkpoint and its checker case.
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$here/host.sh"
CASE="$1"; DEST="$2"; shift 2
ENVS=("$@"); [ ${#ENVS[@]} -eq 0 ] && ENVS=(STORE=memory)
"$PY" "$PREPARE" checkpoint "$DEST"
build_copy "$DEST"
if printf '%s\n' "${ENVS[@]}" | grep -q '^STORE=sqlite'; then (cd "$DEST" && env "${ENVS[@]}" dotnet run --no-build --project Api -- --migrate | tail -2); fi
start_host "$DEST" "${ENVS[@]}"
trap stop_host EXIT
if [ "$CASE" = "start" ]; then
  curl -s -i -H 'Content-Type: application/json' -d '{"boardId":"reference"}' http://127.0.0.1:5055/api/sessions; echo
fi
(cd "$DEST" && "$PY" check.py --case "$CASE")
