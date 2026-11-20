#!/usr/bin/env bash
# W5.06 Demo 1 and Demo 2. Run from the course source/ folder:
#   bash learner/units/w05-dotnet-application-development/examples/w5-06/demo.sh
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$here/../_lib/w5env.sh"

step "Demo 1 -- complete accepted-flow and rejection example (expected exit 0)"
python3 "$W5_PACKAGE/run.py" test --workspace "$W5_ATTEMPT/demo-tests"
echo "exit $?"

step "Demo 2 -- owned missing test scope (expected nonzero: Complete owned rejected-flow assertions)"
python3 "$W5_PACKAGE/prepare.py" 06 "$W5_ATTEMPT/owned"
python3 "$W5_PACKAGE/run.py" test --source "$W5_ATTEMPT/owned" --workspace "$W5_ATTEMPT/before"
echo "exit $? (keep this failed exit as evidence)"
