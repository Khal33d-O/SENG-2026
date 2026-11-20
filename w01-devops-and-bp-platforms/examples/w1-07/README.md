# W1.07 worked examples: run and trace the pipeline; repair a seeded build failure

Instructor demonstration from the lab folder [`../../labs/w1-07/`](../../labs/w1-07/) with the scanner prepared:

```bash
export W107_TRIVY=/path/to/trivy          # facilitator-supplied paths, not credentials
export W107_TRIVY_CACHE=/path/to/trivy-cache
export LAB_ENGINE=podman
```

## Worked Example 1: run and trace the complete pipeline

```bash
python3 pipeline.py init --fixture demo --workspace work/demo
python3 pipeline.py run --workspace work/demo --out runs/demo-1
```

Open `runs/demo-1/run.json`: build, test, scan, publish and deploy are `passed`. Compare the full `commit` and
`image_id` with `runs/demo-1/publication/receipt.json`, and the scan `archive_sha256` with the receipt's
`archive_sha256`. Open the printed URL and read **Equipment release blue**. Use a new `--out` for any rerun.

## Worked Example 2: repair a seeded build failure

```bash
python3 pipeline.py init --fixture guided --workspace work/guided
python3 pipeline.py run --workspace work/guided --out runs/guided-1
```

The guided `Dockerfile` names `web/missing.html` while the committed input contains `web/index.html`; the build fails
(pipeline exit 10) before test or scan. Change only the Dockerfile's source path to `web/index.html`, stage and commit:

```bash
git -C work/guided diff
git -C work/guided add Dockerfile
git -C work/guided diff --cached
git -C work/guided -c user.name="Learner" -c user.email="learner@example.invalid" commit -m "Copy the committed page"
python3 pipeline.py run --workspace work/guided --out runs/guided-2
```

The rerun has a different selected commit and its own image identity; it passes test, scan, publish and deploy.

## Stop only the local deployment you created

```bash
python3 pipeline.py down --out runs/my-repaired-run
```

Use the run directory that created the container (for example `runs/demo-1`, `runs/guided-2`).

## Sample records

[`sample-records/`](sample-records/) contains `run.json` and `receipt.json` files captured from the author's verified runs
on 2026-10-10 (demo pass, starter first failure, repaired pass, blocked comparison) with local paths removed. They are
historical evidence for reading practice, not results of your run.
