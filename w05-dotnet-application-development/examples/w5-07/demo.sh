#!/usr/bin/env bash
# W5.07 Demo 1 and Demo 2 (non-interactive: --no-wait exits after the checks instead of waiting for Ctrl+C).
# Needs Podman for Loki/Grafana; without it run.py uses the labelled local mock (NOT Grafana evidence).
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$here/../_lib/w5env.sh"

step "Demo 1 -- complete action telemetry path (expected PASS request-filtered data-source check)"
python3 "$W5_PACKAGE/run.py" telemetry --workspace "$W5_ATTEMPT/demo-view" --no-wait
echo "exit $?"

step "Demo 2 -- supplied missing-fields version (expected FAIL: no requestId tag)"
python3 "$W5_PACKAGE/prepare.py" 07 "$W5_ATTEMPT/owned"
python3 "$W5_PACKAGE/run.py" telemetry --source "$W5_ATTEMPT/owned" --workspace "$W5_ATTEMPT/before-view" --no-wait
echo "exit $? (inspect $W5_ATTEMPT/before-view/action-spans.jsonl and grafana-query.json)"
