#!/usr/bin/env bash
# W5.09 Demo 1 and Demo 2: known-good -> candidate -> restore known-good through Git.
# Classroom sync needs the facilitator's W5_GITOPS_REMOTE / W5_ARGOCD_APP / W5_SERVICE_URL; otherwise
# release.py sync performs the labelled LOCAL RECONCILE.
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$here/../_lib/w5env.sh"
image_of() { python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['image'])" "$W5_ATTEMPT/release/pipeline-$(git -C "$W5_ATTEMPT/release/source" rev-parse HEAD)/result.json"; }

step "Demo 1 -- known-good"
python3 "$W5_PACKAGE/release.py" init --workspace "$W5_ATTEMPT/release"
python3 "$W5_PACKAGE/release.py" pipeline --workspace "$W5_ATTEMPT/release"
export W5_GOOD="$(image_of)"; echo "W5_GOOD=$W5_GOOD"
python3 "$W5_PACKAGE/release.py" select --workspace "$W5_ATTEMPT/release" --image "$W5_GOOD"
python3 "$W5_PACKAGE/release.py" sync --workspace "$W5_ATTEMPT/release"

step "Demo 1 -- schema-compatible candidate"
python3 "$W5_PACKAGE/peer-change.py" "$W5_ATTEMPT/release/source" --candidate-only
git -C "$W5_ATTEMPT/release/source" add Api/Program.cs
git -C "$W5_ATTEMPT/release/source" commit -m 'Schema-compatible candidate release label'
python3 "$W5_PACKAGE/release.py" pipeline --workspace "$W5_ATTEMPT/release"
export W5_CANDIDATE="$(image_of)"; echo "W5_CANDIDATE=$W5_CANDIDATE"
python3 "$W5_PACKAGE/release.py" select --workspace "$W5_ATTEMPT/release" --image "$W5_CANDIDATE"
python3 "$W5_PACKAGE/release.py" sync --workspace "$W5_ATTEMPT/release"

step "Demo 2 -- restore the recorded known-good image through Git"
python3 "$W5_PACKAGE/release.py" select --workspace "$W5_ATTEMPT/release" --image "$W5_GOOD"
python3 "$W5_PACKAGE/release.py" sync --workspace "$W5_ATTEMPT/release"
python3 "$W5_PACKAGE/release.py" check --workspace "$W5_ATTEMPT/release"
git -C "$W5_ATTEMPT/release/configuration" --no-pager log --oneline

step "Teardown (storage is kept)"
python3 "$W5_PACKAGE/release.py" stop --workspace "$W5_ATTEMPT/release"
