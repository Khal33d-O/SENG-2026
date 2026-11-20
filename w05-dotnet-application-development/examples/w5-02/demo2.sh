#!/usr/bin/env bash
# W5.02 Demo 2 · Replace through the interface: STORE=traced, same HTTP result plus "Training store: load <id>".
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${1:-/tmp/academy-w5-02-demo2}"
bash "$here/../_lib/checkpoint-demo.sh" start "$DEST" STORE=traced
grep "Training store" "$DEST/host.log" || true
