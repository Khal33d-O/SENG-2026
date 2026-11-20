# W5.08 · Review and integrate a bounded API change

**Session:** W5.08 · Collaborative delivery and pipeline gates · 120 minutes
**Driving question:** What evidence is needed before integrating a change?

One challenge · 45 minutes owned work inside the 120-minute module.

## Outcomes

* Review a bounded diff against the shared action contract: trigger, observed or predicted incorrect
  behaviour, requested correction and the check that will show it works.
* Explain how review, HTTP tests, publishing and container checks complement each other.
* Connect a source commit to the image built from it (tag, OCI revision label, image ID).
* Turn an approved change into a separate configuration commit that selects the image.

## Supplied and owned

**Owned scope: your independent review note, the corrected peer diff, and selected
pipeline/configuration evidence. The adapter supplies image and Git plumbing** (`release.py`,
`peer-change.py`). `peer-change.py` generates a small review fixture when no second author is
available: label it a **simulated peer review**. Starter templates: [starter/review-note.md](starter/review-note.md).

## Starting point

```bash
export W5_PACKAGE="$PWD/learner/units/w05-dotnet-application-development/assets/integrated-
    release"
```

The book wraps that line; type it as one line, then create the attempt folder:

```bash
export W5_PACKAGE="$PWD/learner/units/w05-dotnet-application-development/assets/integrated-release"
export W5_ATTEMPT="$(mktemp -d)"
```

`release.py pipeline` needs Git, the .NET SDK, Node and (for a real image) Podman. Without a Podman
engine it builds a clearly labelled `local-archive` image instead.

## Concepts and syntax

`git diff` shows changed lines, `git show HEAD` shows a committed diff, and `git rev-parse HEAD` names
the full immutable source commit. Commit the reviewed source before `release.py pipeline`. The adapter
rejects an uncommitted source tree, runs HTTP tests and publish, then builds a unique image tag
containing that commit and an OCI revision label. `pipeline-<commit>/result.json` records
`sourceCommit`, `image` and `imageId`. A tag is a lookup name; the image ID is content identity.
`release.py select --image` writes the selected image into a separate Git configuration repository and
commits that change; it leaves the schema and the known-good migration init image unchanged.
`release.py sync` transports that repository and asks Argo to reconcile (W5.09).

## Worked demonstrations

Script: [examples/w5-08](../../examples/w5-08/README.md).

### Demo 1 · inspect the supplied simulated peer diff before testing

```bash
python3 "$W5_PACKAGE/release.py" init --workspace "$W5_ATTEMPT/release"
python3 "$W5_PACKAGE/peer-change.py" "$W5_ATTEMPT/release/source"
git -C "$W5_ATTEMPT/release/source" diff
```

The diff changes a release label and one rejected-action HTTP status. Predict which changed line
violates the contract. Write the review before discussion. Commit this candidate and demonstrate the
pipeline gate:

```bash
git -C "$W5_ATTEMPT/release/source" add Api/Program.cs Api/Routes.cs
git -C "$W5_ATTEMPT/release/source" commit -m 'Peer candidate for bounded review'
python3 "$W5_PACKAGE/release.py" pipeline --workspace "$W5_ATTEMPT/release"
```

Expect nonzero exit at the rejected response assertion (`Check failed: South into the wall returns
409`); no passing image record is created (`pipeline-<commit>-failed-1/`).

### Demo 2 · correct that one status back to 409

Correct that one status back to 409 in `source/Api/Routes.cs`, retaining the candidate release label,
then run:

```bash
git -C "$W5_ATTEMPT/release/source" add Api/Routes.cs
git -C "$W5_ATTEMPT/release/source" commit -m 'Preserve rejected-action HTTP contract'
python3 "$W5_PACKAGE/release.py" pipeline --workspace "$W5_ATTEMPT/release"
```

Read the printed `pipeline-<commit>/result.json`. Copy its exact image value into `W5_IMAGE`, then
select it:

```bash
export W5_IMAGE='replace-with-image-from-result-json'
python3 "$W5_PACKAGE/release.py" select --workspace "$W5_ATTEMPT/release" --image "$W5_IMAGE"
git -C "$W5_ATTEMPT/release/configuration" show HEAD
```

Expect a separate configuration commit selecting the same image; selection alone does not deploy it.
Offline trace: source S1 fails rejected-status test; correction S2 passes; image tag includes S2 and
result records image ID; configuration C1 references that image.

## Practical challenge

Independently review the bounded change from a partner (or label the supplied fixture simulated).
Write a PR-style note with trigger, changed behaviour, exact correction, test evidence and decision.
Recheck the corrected diff before recording acceptance. Run the pipeline on the committed correction
and select its image. Explain source commit → image identity → configuration commit using your actual
records. Swap reviewer/author explanations; each person owns their review decision.

### Acceptance criteria

* A review note written before discussion, naming the `Error(context, 200, ...)` line as the contract
  violation and the check that verifies the correction.
* A preserved failing pipeline (`pipeline-<S1>-failed-1/result.json`, stage `http-tests`).
* The correction diff (one line back to 409; candidate release label kept) and a passing
  `pipeline-<S2>/result.json` whose image tag contains S2.
* A configuration commit (`git show HEAD`) selecting exactly that image.

## Staged hints

1. Review Routes.Act against the contract before relying on a build.
2. The body can contain an error while HTTP status incorrectly reports success.
3. Select accepts only an image with a passing result from this workspace; never invent a success
   record.

## Check and recovery

Show the independent review, preserved failing pipeline, correction diff, passing result and selected
configuration. No merge/approval claim without a real peer decision; use simulated-review wording when
appropriate. For a transient tool/preparation failure, fix the cause and rerun the same pipeline
command. Failed evidence is retained with a `-failed-N` suffix; no success record is fabricated. A
passing pipeline is reused through its recorded image; a new candidate needs a new source commit.

Record everything in [evidence.md](evidence.md).

## Individual knowledge check

1. What can code review detect that compilation cannot?
2. Why do HTTP state assertions and container checks provide different evidence?
3. Distinguish source commit, image tag, image ID and configuration commit.
4. What exact correction would you request for the supplied rejected-action diff, and which check
   verifies it?
5. Individually justify your accept/request-correction decision using changed lines and pipeline
   evidence, then trace the integrated image to configuration.
