#!/usr/bin/env bash
# Shared setup for the W5.06-W5.10 demo scripts. Source it from the course source/ folder.
# Sets W5_PACKAGE (one line: the book prints it wrapped after "integrated-") and W5_ATTEMPT.
set -uo pipefail
if ! python3 -c "" >/dev/null 2>&1; then python3() { python "$@"; }; fi  # Windows: python3 may be a Store stub
export W5_PACKAGE="$PWD/learner/units/w05-dotnet-application-development/assets/integrated-release"
if [ ! -f "$W5_PACKAGE/run.py" ]; then echo "Run this from the course source/ folder." >&2; exit 2; fi
export W5_ATTEMPT="${W5_ATTEMPT:-$(mktemp -d)}"
echo "W5_ATTEMPT=$W5_ATTEMPT"
step() { echo; echo "######## $*"; }
