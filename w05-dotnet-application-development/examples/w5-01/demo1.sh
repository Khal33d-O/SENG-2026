#!/usr/bin/env bash
# W5.01 Demo 1 · Run the supplied in-memory route (complete checkpoint, memory mode).
# Run from the course source/ folder: bash learner/units/w05-dotnet-application-development/examples/w5-01/demo1.sh [DEST]
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../_lib/checkpoint-demo.sh" start "${1:-/tmp/academy-w5-demo-01}" STORE=memory
