#!/usr/bin/env bash
# W5.03 Demo 1 · Implement the action boundary: starter 501 -> Routes.Act completed -> check --case action PASS.
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../_lib/before-after.sh" 03 action "${1:-/tmp/academy-w5-03-demo1}" Api/Routes.cs Api/wwwroot/client.js -- STORE=memory
