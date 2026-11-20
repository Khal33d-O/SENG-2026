#!/usr/bin/env bash
# W5.01 Demo 2 · Add the bounded route around the library: starter 501 -> Create completed -> PASS.
# Run from the course source/ folder: bash learner/units/w05-dotnet-application-development/examples/w5-01/demo2.sh [DEST]
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../_lib/before-after.sh" 01 start "${1:-/tmp/academy-w5-01-demo2}" Api/Routes.cs -- STORE=memory
