#!/usr/bin/env bash
# W5.10 Demo 1 and Demo 2 rehearsals (success, timeout, validation). The retained serve/restart step is
# interactive: see README.md.
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$here/../_lib/w5env.sh"

step "Demo 1 -- connected normal flow, simulated model success"
python3 "$W5_PACKAGE/run.py" rehearse --workspace "$W5_ATTEMPT/normal" --hint-mode success
echo "exit $?"

step "Demo 2 -- deterministic model timeout"
python3 "$W5_PACKAGE/run.py" rehearse --workspace "$W5_ATTEMPT/timeout" --hint-mode timeout
echo "exit $?"

step "Other supplied failure gate -- validation"
python3 "$W5_PACKAGE/run.py" rehearse --workspace "$W5_ATTEMPT/validation" --hint-mode validation
echo "exit $?"
echo
echo "Next (interactive): python3 \"\$W5_PACKAGE/run.py\" serve --workspace \"$W5_ATTEMPT/retained\" --hint-mode timeout"
