#!/usr/bin/env bash
# W5.08 Demo 1 and Demo 2: simulated peer diff -> failing pipeline -> one-line correction -> passing
# pipeline -> configuration commit. The review note itself is your work, not this script's.
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$here/../_lib/w5env.sh"

step "Demo 1 -- inspect the simulated peer diff"
python3 "$W5_PACKAGE/release.py" init --workspace "$W5_ATTEMPT/release"
python3 "$W5_PACKAGE/peer-change.py" "$W5_ATTEMPT/release/source"
git -C "$W5_ATTEMPT/release/source" --no-pager diff
git -C "$W5_ATTEMPT/release/source" add Api/Program.cs Api/Routes.cs
git -C "$W5_ATTEMPT/release/source" commit -m 'Peer candidate for bounded review'
python3 "$W5_PACKAGE/release.py" pipeline --workspace "$W5_ATTEMPT/release"
echo "exit $? (expected nonzero at the rejected response assertion)"

step "Demo 2 -- correct the one status back to 409, keep the candidate label"
sed -i 's/return Error(context, 200, result.Reason!/return Error(context, 409, result.Reason!/' "$W5_ATTEMPT/release/source/Api/Routes.cs"
git -C "$W5_ATTEMPT/release/source" add Api/Routes.cs
git -C "$W5_ATTEMPT/release/source" commit -m 'Preserve rejected-action HTTP contract'
python3 "$W5_PACKAGE/release.py" pipeline --workspace "$W5_ATTEMPT/release"
commit="$(git -C "$W5_ATTEMPT/release/source" rev-parse HEAD)"
W5_IMAGE="$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['image'])" "$W5_ATTEMPT/release/pipeline-$commit/result.json")"
export W5_IMAGE
echo "W5_IMAGE=$W5_IMAGE"
python3 "$W5_PACKAGE/release.py" select --workspace "$W5_ATTEMPT/release" --image "$W5_IMAGE"
git -C "$W5_ATTEMPT/release/configuration" --no-pager show HEAD
