#!/usr/bin/env bash
# W5.02 Demo 1 · Register library and memory services: transient GET 404 -> singleton PASS.
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
bash "$here/../_lib/before-after.sh" 02 start "${1:-/tmp/academy-w5-02-demo1}" Api/Registrations.cs -- STORE=memory
