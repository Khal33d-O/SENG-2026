# W1.07 lab: Trace and repair a committed build

Follow the supplied pipeline from commit to image, then use its logs to repair one seeded build failure. The
application is the familiar static Game foundation checkpoint. Its approved release is **Harbour pipeline release**.
The supplied runner builds, checks, scans, publishes and deploys locally; your job is to explain its evidence and correct
the bounded source input.

## Timing

| Block | Minutes |
|---|---|
| Retrieval, concepts and two worked examples | about 45 |
| Guided practice (stage record, repeat the repair, build vs scan evidence) | 15 |
| Challenge: Task 1 10, Task 2 10, Task 3 15, Task 4 10 | 45 |
| Knowledge check, individual evidence and transfer | 15 |
| Recovery and consolidation | 10 |

## Outcomes

* Describe the build, test, scan, publish and deployment stages of the supplied pipeline.
* Explain how an image tag identifies the artifact being deployed.
* Compare a build failure with a container-scanning block and describe the relevant support route.
* Debug a seeded build failure using pipeline logs and rerun the corrected pipeline.

## Brief and ownership

You may edit the Dockerfile's COPY source and choose which supplied application file enters your next commit. Preserve
the pinned base reference, application file contents, [`approval.json`](approval.json), the pipeline implementation
([`pipeline.py`](pipeline.py)), the scan threshold and the local deployment scope. Do not change a test expectation or
weaken scanning to obtain a pass. No CI account, remote repository, registry credentials or BP deployment is required.
Work in pairs; rotate operator and observer after Task 2. Evidence sheet: [`evidence.md`](evidence.md).

## Setup and prepared tools

The facilitator prepares Python 3.13.5, Git, Podman 5.4.2, Trivy 0.74.0 and a usable vulnerability database before
teaching (re-tested 2026-10-10 with Podman 5.7.0, Trivy 0.74.0). `W107_TRIVY` names the prepared scanner executable and
`W107_TRIVY_CACHE` its prepared database cache — local paths, not credentials. The eligible base is official NGINX
1.30.4 on Alpine 3.24.1, pinned by digest; the comparison fixture retains the earlier trixie base. Both images must be
available before teaching because the build uses `--pull=never`. Run from this lab folder (use a personal copy):

```bash
python3 pipeline.py init --fixture starter --workspace work/my-build
python3 pipeline.py run --workspace work/my-build --out runs/first
```

The first build deliberately fails with pipeline exit 10. Read the printed stage and open `runs/first/run.json` plus
`build.log`. A missing tool or unavailable base is a different preparation issue. Every rerun needs a new `--out`
directory. A successful deployment normally opens `http://127.0.0.1:4317/`; if that port is occupied, ask for a free
port and pass `--port`. `python3 starter/run.py ...` is an equivalent entrypoint to the same controller.

Worked examples: [`../../examples/w1-07/README.md`](../../examples/w1-07/README.md). Illustrative hosted-CI
equivalent of the same stages (not executed here): [`ci/github-actions-pipeline.yml`](ci/github-actions-pipeline.yml).

## Task 1: trace the starting run (10 minutes)

Record the full selected commit, the first failed stage and the actual states of the later stages. Compare the failed
command's working directory and input list in `run.json` with the folder in your editor:

```bash
git -C work/my-build status --short
```

```bash
git -C work/my-build ls-tree -r --name-only HEAD
git -C work/my-build show HEAD:Dockerfile
```

`status --short` reports working-directory changes and untracked files; `ls-tree` lists files in the selected revision;
`show HEAD:Dockerfile` displays the Dockerfile recorded in that revision. A file visible in the editor is not
automatically evidence that the exported build context contained it.

## Task 2: choose a correction from the evidence (10 minutes)

Before editing, write one proposed correction and a reason tied to the failed command's actual inputs, the observation
you expect to change, and a plausible alternative with the result that would reveal it fails the approved-release
requirement or leaves the selected input unchanged. The earlier North gate page is a supplied file; its existence is not
permission to substitute it for the approved release.

## Task 3: commit the correction and complete the rerun (15 minutes)

Apply your chosen bounded correction. Choose the files for `git add` from your recorded diagnosis, then:

```bash
git -C work/my-build diff
git -C work/my-build diff --cached
git -C work/my-build -c user.name="Learner" -c user.email="learner@example.invalid" commit -m "Repair the approved build input"
```

```bash
python3 pipeline.py run --workspace work/my-build --out runs/repaired
```

The required rerun passes build, approved-page test, actual critical scan, local publication and local deployment.
Compare the commit recorded by the run with your new commit, then the built image ID, scanner image identity, published
archive hash and deployed image identity. Open the printed URL and record **Harbour pipeline release** in an actual
browser response. If the prepared database unexpectedly blocks the eligible artifact, keep the block and ask for review.

## Task 4: compare a real policy block and hand over the trace (10 minutes)

```bash
python3 pipeline.py init --fixture blocked --workspace work/comparison
python3 pipeline.py run --workspace work/comparison --out runs/comparison
```

Expect pipeline exit 7 from the completed scan. Read the critical finding count, report identity and later-stage states.
Explain why another change to your COPY input would not resolve findings in the supplied base, and write a support
record (owner, commit, image, scan command, database date, finding) without credentials. Contrast it with a scanner
preparation failure (exit 11: no policy decision exists). Distinguish failed, blocked, skipped and passed.

## Acceptance criteria

- [ ] The original failed run names its selected commit, failed build command, context and later skipped stages.
- [ ] The correction is justified before editing, with a plausible rejected alternative tied to an observable result.
- [ ] Only permitted source inputs and Git selection change; approved release, base and scan policy remain fixed.
- [ ] The corrected commit completes the actual build, test, scan, local publication and local deployment path.
- [ ] Full commit, image identity, scanned/published archive identity and deployed image form one consistent trace.
- [ ] An actual browser request displays Harbour pipeline release from the repaired run.
- [ ] The executed blocked-image comparison retains its critical-policy block and skipped publication/deployment.
- [ ] Scanner preparation failure is distinguished from a completed scan block and a source/build fault.
- [ ] Each learner records an individual explanation, assistance and scheduled revisit.

## Three-stage hints

<details><summary>Hint 1: identify the build-input boundary</summary>

Locate the directory passed to the actual build command. Compare its recorded input with the source folder in your
editor. Does the failed command report a problem with the approved file's contents, its availability to that build, or
a later policy check?
</details>

<details><summary>Hint 2: expose the two source views</summary>

Place the short Git status beside the committed file list. Mark the source path requested by the Dockerfile in each
view, without changing either. Explain what the next exported revision must contain if the COPY operation is to
receive the approved page.
</details>

<details><summary>Hint 3: complete a partly prepared operation</summary>

Complete the source filename in `git -C work/my-build add delivery/____`, using the approved file already supplied in
your workspace (an editing prompt, not a runnable command). Then inspect `git diff --cached` and explain why the staged
selection addresses the failed build input without substituting an older page.
</details>

## Individual evidence

Distinguish a source/build failure from a scan or access block using pipeline evidence: the first relevant stage, the
selected input and the operation that produced its result. New observation: a build and scan passed, but the
publication receipt refers to a different archive hash from the scanned archive. What remains unproven, and which
handoff evidence do you inspect before allowing deployment?

## Transfer: a booking page

A booking preview can build and start while serving an older availability page. Explain how an independent release
check rejects that content before a scan or deployment proceeds.

## Knowledge check (8 minutes)

1. A teammate runs the local pipeline successfully, then writes "the BP registry and tenant now contain this release." The receipt names a local archive directory and deployment names a loopback URL. What follows?
   A) Every environment has the release because the image's tag contains a commit prefix.
   B) The local pipeline's recorded stages passed; a BP registry upload and tenant deployment remain unestablished.
   C) No real publication occurred because publication can only mean a remote registry push.
   D) The browser response proves the remote scanner ran even without a scanner record.
2. The scanner checked `image.tar` and recorded its hash. A helper compresses it as `image.tar.gz`; an unpack command restores a tar before deployment. The policy requires deployed tar bytes to match scanned tar bytes. Which comparison decides?
   A) Reject the handoff solely because the compressed file's hash differs from the tar hash.
   B) Accept the handoff because both filenames contain image.
   C) Unpack the received file and compare the restored tar's hash with the recorded scanned-tar hash before using it.
   D) Compare only the image tag.
3. A checklist requires database data updated after 12:00 UTC. A scan at 15:00 found zero criticals, but the database metadata says UpdatedAt 10:00. What is supported?
   A) The checklist is satisfied because the command finished after noon.
   B) The scan has a result, but does not meet the stated data-freshness condition; request prepared data and a new scan of the same identified artifact.
   C) The image definitely contains a critical vulnerability.
   D) Rebuild the image without changing scanner data.
4. "Retry deployment" reuses a run's published archive; "New run" exports the selected commit and performs every stage. Run A published release A but could not start (port occupied). The selected commit now contains approved release B; the request is to deliver B. Which operation?
   A) Retry A's deployment.
   B) Rename A's publication receipt to B and retry without checking the archive.
   C) Start a new run for the selected B commit, preserving A's record and verifying B through every required stage.
   D) Change the scan threshold so a deployment retry reads newer source files.
5. A logging wrapper runs the scanner with the critical policy and displays the logger's exit (0), while the scanner's report contains a critical finding and its own exit is 7. Next action?
   A) Mark the scan clean because the wrapper displays 0.
   B) Treat the scanner as unable to start, ignoring its completed report.
   C) Remove the critical-policy flags so both operations can report 0.
   D) Keep publication blocked by the completed scan and ask the runner owner to correct which operation's result the wrapper reports.

## Recovery, access and cleanup

Save your attempted source and every run directory before using the instructor's corrected checkpoint in another
personal folder. If the engine, image or scanner is unavailable, use [`captures/`](captures/) for interpretation and mark
environment blocked; a capture is not a live learner pipeline result. After saving your browser observation:

```bash
python3 pipeline.py down --out runs/my-repaired-run
```

(use your own run directory, e.g. `runs/repaired`). It stops only the recorded container and keeps logs, artifacts and
commits. Never use an engine-wide prune operation.

## Optional depth

Two retained run records name different image IDs under similar tags: explain which additional identifier you would
retain and why. Paper comparison only.
