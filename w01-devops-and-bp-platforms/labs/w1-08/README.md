# W1.08 lab: Trace the declared release to the Service

Annotate the few fields used in supplied YAML, change an image reference and trace the result in Argo CD. Your request
is to run supplied **B: Harbour briefing** in `main-page` and serve it through `page`, while keeping the supplied
preview available on **A: North gate briefing**. The preview is a separate running checkpoint: keep its image, resource
identities, replica counts, ports, configuration and availability intact.

## Timing

| Block | Minutes |
|---|---|
| Retrieval, concepts and worked examples | about 45 |
| Guided practice (annotate owners, repeat the image change, compare evidence) | 15 |
| Challenge: Task 1 10, Task 2 10, Task 3 15, Task 4 10 | 45 |
| Individual evidence, recap and knowledge check (8 protected minutes) | 15 |
| Recovery and consolidation | 10 |

## Outcomes

* Describe the roles of the few Kubernetes resources used by the supplied application.
* Explain how Argo CD reconciles a declared configuration with running resources.
* Describe Crossplane's place in the wider platform without needing to configure it.
* Annotate and change the supplied YAML fields, then verify the resulting application version.

## Brief and ownership

You own the main Deployment's image field, the Service's selector and your annotations
([`annotations.md`](annotations.md), copied into your workspace by `init`; evidence sheet [`evidence.md`](evidence.md)).
The prepared helper ([`code/lab.py`](code/lab.py)) performs the Git, Kubernetes, Argo CD and HTTP operations. You do not
implement a controller, author a Dockerfile, configure Crossplane or install a cluster. Work in pairs, rotating operator
and observer after Task 2.

## Setup: prepared environment and command meanings

The facilitator supplies Python 3.13.5, PyYAML 6.0.2, Git, kubectl 1.35.5, Argo CD 3.5.2 and the prepared local
Kubernetes cluster. `W108_ENV` points to a local preparation record containing tool paths, the kubeconfig path and
verified image identities; the kubeconfig stays with that environment and is excluded from submitted files. No BP account
or approved BP Yalla command is implied by this local route.

**Local mock (labelled).** If `W108_ENV` is not set, the same commands use a local mock back end that prints
`LOCAL MOCK - not Kubernetes/Argo CD` on every view. It reads your committed YAML and simulates Argo comparison, Pods,
Service selection and the Service response from the prepared image files. Use it to rehearse or when the classroom
environment is blocked; mock results are not evidence of a live cluster.

From a personal copy of this lab, open a terminal in `code`:

```bash
cd code
python3 lab.py init --scenario challenge --workspace work/my-release
git -C work/my-release/configuration rev-parse HEAD
```

Copy that exact value into the next command after inspecting the initial configuration. REVISION is a replacement
prompt, not a value to type literally. `sync` rejects a shortened, stale or different revision and rejects uncommitted YAML.

```bash
python3 lab.py sync --workspace work/my-release --revision REVISION
```

Wait for the current revision to become Synced and Healthy. The initial Service returns release A. A missing tool,
unavailable prepared image or reconciliation timeout is a preparation problem to preserve and escalate.
`python3 starter/run.py ...` from the lab folder delegates to the same adapter. Worked examples and the YAML excerpts:
[`../../examples/w1-08/README.md`](../../examples/w1-08/README.md). The guided file is
[`code/guided/resources.yaml`](code/guided/resources.yaml).

## Read the supplied structure

Your file is `work/my-release/configuration/app/resources.yaml`. A key ends with a colon; indentation determines its
parent; a dash begins a list entry; keep the `kind: List` wrapper. `main-page` and `preview-page` are Deployments with one
replica each; the Service `page` selects ready Pod endpoints and exposes client port 8080, forwarding to named listener
`http` at port 80; `page-settings` is a ConfigMap with a non-secret training value. `inspect` prints the Application
revision/state, Deployment images and availability, Service selector, Pod labels/runtime image IDs, selected
EndpointSlice entries, and the Service response saved by the in-cluster caller.

## Task 1: annotate and predict the declared change (10 minutes)

```bash
python3 lab.py check --workspace work/my-release --expect a
```

Locate five field groups (main image, Pod labels, Service selector, Service port/target port, ConfigMap value) and
annotate their owners and effects. Describe Crossplane separately as wider platform context. Before editing, predict what
changing the main image to `localhost/academy-w108-author:b` changes in the Pod template and running resources, and
write one observation that would disprove your expected user-visible result.

## Task 2: record the image change and trace reconciliation (10 minutes)

```bash
git -C work/my-release/configuration diff
git -C work/my-release/configuration add app/resources.yaml
git -C work/my-release/configuration diff --cached
git -C work/my-release/configuration commit -m "Select supplied release B"
git -C work/my-release/configuration rev-parse HEAD
```

Use the newly printed full revision in `sync`, read the Argo comparison, operation and health, then:

```bash
python3 lab.py check --workspace work/my-release --expect b
```

`check` observes the live environment and applies no repair. Record its named failure, the main image, the Service
response and the preserved preview. Do not rebuild an image, change its label or change an expected page.

## Task 3: choose and test a bounded correction (15 minutes)

```bash
python3 lab.py inspect --workspace work/my-release
```

Trace the Service request to its selected ready Pod; match that endpoint Pod with its labels and runtime image; compare it
with the main Deployment you changed. Before editing, name the field, intended value and observation your correction
should change, plus a plausible alternative and the evidence that makes it insufficient. Apply, commit, synchronize the
exact revision and repeat `check --expect b`, keeping preview A available throughout.

## Task 4: preserve an attempt and hand over the result (10 minutes)

Complete `annotations.md` in your workspace with the final revision, selected endpoint and response, then:

```bash
python3 lab.py backup --workspace work/my-release
```

Each backup creates a new directory (YAML, annotations, selected commit); a missing required file stops the backup.
Compare saved and working files. For a supported restart, keep this workspace and initialise a different one.

## Acceptance criteria

- [ ] Annotations identify resource owners, labels, image, ports and non-secret configuration.
- [ ] The committed image change and pre-edit prediction are retained.
- [ ] Actual Argo revision, synchronization, operation and health are recorded together.
- [ ] The changed case retains a field decision and plausible rejected alternative tied to endpoint selection.
- [ ] Main B and available preview A remain intact while real Service requests return the exact B page and stylesheet.
- [ ] Selected Pod and runtime image identities belong to the current observation.
- [ ] Earlier failures and unique backups remain available without a static capture claimed as live evidence.
- [ ] Each learner records their own explanation, assistance and revisit.

## Three-stage hints

<details><summary>Hint 1: locate the unexplained boundary</summary>

Separate the main Deployment's available Pod from the Service's selected endpoint. Which observation establishes the
component that answered this request? A status on a different resource cannot answer that by itself.
</details>

<details><summary>Hint 2: expose the intermediate selection</summary>

Write adjacent rows: Service selection values; selected endpoint Pod name; that Pod's labels and runtime image. Add the
main Deployment's Pod in another row. Compare them before proposing a field change, preserving the preview's state.
</details>

<details><summary>Hint 3: complete a partly prepared inspection</summary>

Start: Service → selected ready endpoint → Pod ______ → runtime image ______. Complete the blanks from the actual view,
then run `python3 lab.py inspect --workspace work/____` with your workspace path (the blank is a prompt). Mark the field
whose current value produced that selection.
</details>

## Individual evidence

Explain the final trace in your own words: what was declared, what Argo applied, what ran and what the Service returned;
which observation supported your correction; why the rejected alternative was insufficient. New observation: during a
permitted rolling update the Service selects two ready main Pods (old and new image) and one request returned the new
page; the requirement says all ready selected endpoints must be new. Does that response establish completion?

## Knowledge check (8–10 minutes)

1. Which field determines the image used for new Pods created by the supplied Deployment?
   A) The Service's client-facing port. B) The ConfigMap's public training label. C) The image of a container inside the Deployment's Pod template. D) The Deployment's outer metadata name.
2. A public Service selects `app: portal`. Pod P has `app: portal, tier: public` and is ready; Pod Q has `app: portal, tier: internal` and is temporarily not ready. A diagnostics Service selects `tier: internal` and must reach Q when it recovers. Keep both templates; the public route must exclude Q even after recovery. Which action works?
   A) Keep the public selector because its current ready endpoint set contains only P. B) Add `tier: public` to the public Service selector, then verify public membership and Q's diagnostics route after recovery. C) Keep Q permanently unready. D) Remove the diagnostics Service.
3. An application reads `NOTICE` at startup and uses a default only when the key is absent; an empty string is displayed as empty. A ConfigMap change removed `NOTICE` and the app now shows the default. The request is to display no notice. Which declaration expresses that?
   A) Keep the key absent. B) Change the Service target port. C) Add a comment containing an empty notice without defining the key. D) Define `NOTICE` with an empty string and verify a newly started Pod consumes it.
4. Pruning is disabled. A reviewed commit removes an unused ConfigMap; Argo applies it successfully, and inspection still finds the old ConfigMap. Deletion needs the platform owner's approval. What should the handover say?
   A) The commit was applied, but the removed ConfigMap remains live under this policy; report it for the owner's deletion decision. B) Successful synchronization proves the ConfigMap was deleted. C) The remaining ConfigMap proves that no part of the commit was applied. D) Delete it immediately.
5. A maintenance window requires the public Service to keep serving stable release S while a candidate Deployment runs C for private checks. Synced/Healthy; the public Service selects only ready S Pods; a direct candidate check returns C; no cutover is approved. Which interpretation meets the request?
   A) Any difference between the public page and candidate image proves a selector fault. B) Redirect the public Service to C. C) Keep the current route: public S and separately verified candidate C satisfy the stated separation until cutover is approved. D) Replace the stable image with C while keeping its old label.

## Recovery, access and cleanup

If preparation fails, preserve the command and diagnostic, use the facilitator's captured demonstration (or the local
mock, labelled as such) for interpretation and mark the live task environment blocked. After saving evidence, run
`python3 lab.py down --workspace work/my-release`: it checks workspace identity and removes that Application and
namespace only (mock: the simulated state). Source, Git and observations remain. Never use cluster-wide deletion or
engine-wide pruning.

## Optional depth

Compare a Pod restart under the same declared image (paper only): why can the Pod name change while the intended version
does not?
