#!/usr/bin/env sh
# Learner-side equivalent of the authoring repository's designer/build/tooling/environment.sh
# (that designer file is not published). It only CHECKS the prepared terminal; it changes nothing.
# Usage (any directory):  sh environment.sh      or      source environment.sh
echo "dotnet: $(dotnet --version 2>/dev/null || echo 'NOT FOUND - use the prepared terminal')"
echo "node:   $(node --version 2>/dev/null || echo 'not found (needed in W4.10 and P4 only)')"
echo "python: $( (python3 --version || python --version) 2>/dev/null || echo 'not found (needed for checkers)')"
echo "Course pins: .NET SDK 10.0.401 (runtime 10.0.12), Node 24.13.0, Python 3. Any 10.0.x SDK works with the lab global.json."
export DOTNET_NOLOGO=1 DOTNET_CLI_TELEMETRY_OPTOUT=1
