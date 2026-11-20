#!/usr/bin/env bash
# Shared helpers for the W5.01-W5.05 demo scripts. Source it; do not run it directly.
# The scripts are run from the course `source/` folder (the pack/repository root in the book).
set -euo pipefail

PY=python3; python3 -c "" >/dev/null 2>&1 || PY=python  # Windows: python3 may be a Store stub
PREPARE="learner/units/w05-dotnet-application-development/assets/session-api/prepare.py"
BASE="http://127.0.0.1:5055"

# build_copy DEST : restore and build a prepared work copy
build_copy() {
  (cd "$1" && dotnet restore Api/Api.csproj >/dev/null && dotnet build Api/Api.csproj --no-restore >/dev/null)
  echo "built $1"
}

# start_host DIR [ENV=VALUE ...] : start the API in the background on port 5055 and wait for /health
start_host() {
  local dir="$1"; shift
  (cd "$dir" && env "$@" dotnet run --no-build --project Api -- --urls "$BASE" >>host.log 2>&1 &)
  for _ in $(seq 1 90); do
    if curl -fs "$BASE/health" >/dev/null 2>&1; then echo "host ready ($*)"; return 0; fi
    sleep 1
  done
  echo "host did not start; see $dir/host.log" >&2; return 1
}

# stop_host : stop whatever listens on port 5055 (dotnet run starts a child process)
stop_host() {
  if command -v powershell >/dev/null 2>&1; then
    powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5055 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id \$_.OwningProcess -Force }" || true
  else
    pkill -f "urls $BASE" || true
  fi
  sleep 1
}
