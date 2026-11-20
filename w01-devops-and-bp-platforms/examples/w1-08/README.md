# W1.08 worked examples: map the minimal YAML and follow one approved image change

Instructor demonstration from [`../../labs/w1-08/code/`](../../labs/w1-08/code/). In the classroom, `W108_ENV` points at
the facilitator's preparation record (real Kubernetes, Argo CD and in-cluster caller). Without it, the adapter uses the
clearly labelled **LOCAL MOCK** back end, which simulates the same observations for rehearsal.

Prepare the demo workspace (facilitator, before the session):

```bash
cd ../../labs/w1-08/code
python3 lab.py init --scenario guided --workspace work/demo
python3 lab.py sync --workspace work/demo --revision "$(git -C work/demo/configuration rev-parse HEAD)"
```

## Read the YAML fields

The image belongs to a container inside the Deployment's Pod template (excerpt of `code/guided/resources.yaml`):

```yaml
spec:
  template:
    spec:
      containers:
      - name: page
         image: localhost/academy-w108-author:a
         imagePullPolicy: Never
```

The Service selects Pods by label and forwards client port 8080 to the named listener `http` (container port 80):

```yaml
spec:
  selector:
    app: main-page
  ports:
  - name: http
    port: 8080
    targetPort: http
```

## Worked Example 1: map the minimal YAML to the running service

```bash
python3 lab.py inspect --workspace work/demo
python3 lab.py check --workspace work/demo --expect a
```

Expected: `main-page` uses image A; its available Pod carries `app: main-page`; the Service selects that Pod; the
Service request returns `release-A: North gate briefing` and its exact stylesheet; the baseline check passes.

## Worked Example 2: follow one approved image change

In `work/demo/configuration/app/resources.yaml`, replace `localhost/academy-w108-author:a` with
`localhost/academy-w108-author:b`, then:

```bash
git -C work/demo/configuration diff
git -C work/demo/configuration add app/resources.yaml
git -C work/demo/configuration diff --cached
git -C work/demo/configuration commit -m "Select supplied release B"
git -C work/demo/configuration rev-parse HEAD
```

Copy the complete printed revision into the sync command (REVISION is a replacement prompt):

```bash
python3 lab.py sync --workspace work/demo --revision REVISION
```

Then `python3 lab.py check --workspace work/demo --expect b`: current revision Synced, Healthy, operation Succeeded, a
ready B Pod selected by the Service, and the exact B page and stylesheet. Keep the A and B observation directories.
