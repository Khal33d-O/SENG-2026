# W5.09 worked examples · Deployment health and recovery

[demo.sh](demo.sh) runs the known-good → candidate → restore sequence and stops the local runtime at
the end (storage is kept).

```bash
python3 "$W5_PACKAGE/release.py" init --workspace "$W5_ATTEMPT/release"
python3 "$W5_PACKAGE/release.py" pipeline --workspace "$W5_ATTEMPT/release"
```

```bash
export W5_GOOD='replace-with-known-good-image-from-result-json'
python3 "$W5_PACKAGE/release.py" select --workspace "$W5_ATTEMPT/release" --image "$W5_GOOD"
python3 "$W5_PACKAGE/release.py" sync --workspace "$W5_ATTEMPT/release"
python3 "$W5_PACKAGE/peer-change.py" "$W5_ATTEMPT/release/source" --candidate-only
git -C "$W5_ATTEMPT/release/source" add Api/Program.cs
git -C "$W5_ATTEMPT/release/source" commit -m 'Schema-compatible candidate release label'
python3 "$W5_PACKAGE/release.py" pipeline --workspace "$W5_ATTEMPT/release"
```

```bash
export W5_CANDIDATE='replace-with-candidate-image-from-result-json'
python3 "$W5_PACKAGE/release.py" select --workspace "$W5_ATTEMPT/release" --image "$W5_CANDIDATE"
python3 "$W5_PACKAGE/release.py" sync --workspace "$W5_ATTEMPT/release"
```

```bash
python3 "$W5_PACKAGE/release.py" select --workspace "$W5_ATTEMPT/release" --image "$W5_GOOD"
python3 "$W5_PACKAGE/release.py" sync --workspace "$W5_ATTEMPT/release"
python3 "$W5_PACKAGE/release.py" check --workspace "$W5_ATTEMPT/release"
```

Expected local-reconcile output for each sync (values differ):

```
init container: localhost/academy-w5-api:known-good-<S1> --migrate (volume academy-w5-rel-<id>-data)
LOCAL RECONCILE (not Argo CD): Recreate on this machine
configuration revision <C>; image <selected image>
runtime image ID <id>; ready True; health release known-good | candidate | known-good
  ok   prior session <id> equals the retained envelope     (from the second sync onwards)
  ok   create 201
  ok   East 200, x=1, five moves
  ok   GET agrees with East
  ok   hint 200, legal direction (east, source fallback)
  ok   hint did not change state
PASS functional check through http://127.0.0.1:<port>
```

`git -C "$W5_ATTEMPT/release/configuration" log --oneline` then shows: initial configuration, select
known-good, select candidate, select known-good. The migration init image line stays the known-good
image throughout. Offline trace: C1/A ready + session S; C2/B ready + S unchanged; C3/A restored + S
unchanged. No schema rollback occurs.
