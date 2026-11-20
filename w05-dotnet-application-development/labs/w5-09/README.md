# W5.09 · Deploy a compatible candidate and restore known-good

**Session:** W5.09 · Deployment health and recovery · 120 minutes
**Driving question:** How do readiness signals differ from a working game action?

One challenge · 45 minutes owned work inside the 120-minute module.

## Outcomes

* Distinguish readiness (`/health` queries the Sessions table; 503 when the schema is missing),
  Kubernetes readiness, Argo Healthy and a real create/action/GET through the Service.
* Check the same action after deploying a schema-compatible candidate image.
* Restore a known-good image through the supplied GitOps workflow (select, then sync).
* Explain why image restoration is not a database rollback and when a schema change needs separate
  recovery planning.

## Supplied and owned

**Owned scope: the selected image/configuration commits and readiness, functional and recovery
observations. Database and migration topology stay supplied.** The configuration
(`gitops/apps/academy-w5/deployment.yaml`) uses one replica, the `Recreate` strategy, an explicit
migration init container and a retained `/data` directory (including SQLite sidecars). Template:
[starter/recovery-record.md](starter/recovery-record.md).

**Classroom versus local.** In the classroom, `release.py sync` pushes the configuration to the
prepared W1.08 Git daemon and asks Argo CD to reconcile it (facilitator-supplied: `W5_GITOPS_REMOTE`,
`W5_ARGOCD_APP`, `W5_SERVICE_URL`). Without that connection it performs a **local reconcile**, clearly
labelled "not Argo CD": a local Podman pod (or local processes) with a retained data volume, Recreate
semantics, the explicit `--migrate` init step and the same readiness and functional checks.

## Starting point

```bash
export W5_PACKAGE="$PWD/learner/units/w05-dotnet-application-development/assets/integrated-
    release"
```

The book wraps that line; type it as one line:

```bash
export W5_PACKAGE="$PWD/learner/units/w05-dotnet-application-development/assets/integrated-release"
export W5_ATTEMPT="$(mktemp -d)"
```

## Worked demonstrations

Script: [examples/w5-09](../../examples/w5-09/README.md).

### Demo 1 · prepare known-good, then candidate

```bash
python3 "$W5_PACKAGE/release.py" init --workspace "$W5_ATTEMPT/release"
python3 "$W5_PACKAGE/release.py" pipeline --workspace "$W5_ATTEMPT/release"
```

Copy the printed result's image into `W5_GOOD`, preserving it for recovery. Select/sync it:

```bash
export W5_GOOD='replace-with-known-good-image-from-result-json'
python3 "$W5_PACKAGE/release.py" select --workspace "$W5_ATTEMPT/release" --image "$W5_GOOD"
python3 "$W5_PACKAGE/release.py" sync --workspace "$W5_ATTEMPT/release"
python3 "$W5_PACKAGE/peer-change.py" "$W5_ATTEMPT/release/source" --candidate-only
git -C "$W5_ATTEMPT/release/source" add Api/Program.cs
git -C "$W5_ATTEMPT/release/source" commit -m 'Schema-compatible candidate release label'
python3 "$W5_PACKAGE/release.py" pipeline --workspace "$W5_ATTEMPT/release"
```

Copy the new result image into `W5_CANDIDATE`. Select and sync it:

```bash
export W5_CANDIDATE='replace-with-candidate-image-from-result-json'
python3 "$W5_PACKAGE/release.py" select --workspace "$W5_ATTEMPT/release" --image "$W5_CANDIDATE"
```

```bash
python3 "$W5_PACKAGE/release.py" sync --workspace "$W5_ATTEMPT/release"
```

Expect Argo's selected configuration revision Synced/Healthy (classroom) or the local reconcile record,
one ready Pod, health release `candidate`, prior session equality, East x=1/five moves and a legal
simulated timeout fallback.

### Demo 2 · restore the recorded known-good image through Git

```bash
python3 "$W5_PACKAGE/release.py" select --workspace "$W5_ATTEMPT/release" --image "$W5_GOOD"
python3 "$W5_PACKAGE/release.py" sync --workspace "$W5_ATTEMPT/release"
python3 "$W5_PACKAGE/release.py" check --workspace "$W5_ATTEMPT/release"
```

Expect a new configuration revision, health release `known-good`, the original image and the prior
saved session retained. Offline trace: C1/A ready + session S; C2/B ready + S unchanged; C3/A
restored + S unchanged. No schema rollback occurs.

## Practical challenge

Execute the candidate and restoration sequence, predicting health and retained session before each
sync. Keep the before/candidate/restored deployment JSON records (`deployments/deployment-00N.json`)
and explain all four identities (source, image, configuration, runtime). Independently replay the
functional check after restore. Compare the unchanged migration and volume configuration in Git
(`git -C "$W5_ATTEMPT/release/configuration" log -p`). If sync fails, retain actual conditions,
reselect the known-good image and reconcile; do not delete storage to obtain a pass.

### Acceptance criteria

* Three configuration commits after the initial one: known-good, candidate, known-good again.
* Three deployment records: ready, `healthRelease` `known-good` → `candidate` → `known-good`, with the
  runtime image ID matching the pipeline `imageId`.
* Every check after the first shows `ok prior session <id> equals the retained envelope`, East x=1 and
  five moves, GET agreement and a legal hint with no state change.
* The migration init image and volume lines are unchanged between the candidate and restore commits.

## Staged hints

1. Save the known-good image from its result before creating the candidate.
2. Readiness checks the table; the functional check independently checks rule/state behaviour through
   the Service.
3. Restore with select then sync; neither command deletes the retained database or reverses
   migrations.

## Check and recovery

Show the selected Git revision, ready runtime image and equality of the prior session after restore.
Explain why the answer would differ after a destructive schema migration. Record it in
[evidence.md](evidence.md).

**Teardown:** `python3 "$W5_PACKAGE/release.py" stop --workspace "$W5_ATTEMPT/release"` stops the
local runtime and keeps the retained storage.

## Individual knowledge check

1. Why can readiness pass while a game action is wrong?
2. Which unchanged schema and storage assumptions make this candidate compatible?
3. Why restore the image in Git rather than editing a live Pod?
4. What data would an image restore fail to recover after a destructive migration?
5. Individually show restored revision, running image and retained session/action evidence; explain why
   this is not a database rollback.
