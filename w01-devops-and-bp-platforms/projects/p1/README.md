# Project 1: Deploy the game foundation

540 minutes: Thursday afternoon 180 minutes and Friday 360 minutes. Work in pairs, alternate operator at each
milestone, and retain an individual demonstration. Your outcome is a reproducible deployment of the supplied foundation
page and board API, with an explained failure and recovery. No TypeScript or C# programming is required.

## Starting point and scope

Use the actual W1.10 application ([`../code/app/`](../code/app/), release `foundation-observe-a`) and its supplied
browser page. It serves the familiar 3 × 3 reference board, six initial moves, a health route and correlated request
records. Front end and API are packaged in one image and one Deployment: the page calls `/api/boards/reference` on the
same origin, and the Service exposes both through port 8080 — no separate API host or CORS configuration. You configure
the public environment, caller deadline and Service route; do not implement networking or game rules. Before the first
milestone, state your intended later game's action, state and completion condition (treasure hunt remains the
reference); do not implement it now.

This project uses a prepared local classroom Kubernetes/Argo CD environment (continuing W1.08's GitOps workflow) and the
W1.10 Loki/Grafana request schema. **BP Yalla is the intended organisational target, but its approved CLI walkthrough is
unavailable**: local success earns the local project evidence; it does not establish BP scaffolding or deployment. Carry
your W1.09 plan forward with BP items pending.

## Preparation (facilitator, before learner time)

.NET SDK 10.0.401, Podman, the cached ASP.NET 10.0.12 base image, Git, kubectl, Argo CD, a personal `p1-...`
namespace/Application, prepared Git transport and accessible Loki/Grafana views. An environment session supplies
`P1_NAMESPACE`, `P1_REPO_NAMESPACE`, `P1_REPO_POD`, `P1_LOCAL_LOKI_URL`, `P1_CLUSTER_LOKI_URL`, `P1_GRAFANA_URL` and
`P1_SESSION`; `kubectl` and `argocd --core` are already configured. These are classroom variables, not Yalla commands.
Access credentials and kubeconfig stay outside your project and submission. The facilitator imports each built image
into the classroom nodes without rebuilding it and reports its runtime image identity. If this equipment is unavailable,
preserve the preparation failure, complete the local image/plan milestones and mark classroom deployment evidence pending.

## Work and timeboxes

| Milestone | Minutes | Observable checkpoint |
|---|---|---|
| 1. Plan and establish a baseline | 45 | Board/API expectations, assigned destination, game intention |
| 2. Package and run locally | 90 | Your built image serves both page and API |
| 3. Review the deployment proposal | 45 | Reviewed source/image identity and configuration commit |
| 4. Deploy through classroom GitOps | 90 | Selected commit reconciled; Service/browser/API verified |
| 5. Diagnose and recover one configuration failure | 90 | Prediction, failed evidence, correction and fresh receipt |
| 6. Reproduce and hand over | 90 | Peer follows your README; identical image/version checked |
| 7. Individual demonstrations and reflection | 90 | Each learner traces and explains their release |
| **Total** | **540** | Thursday milestones 1–3; Friday milestones 4–7 |

Templates: [`starter/project-readme-template.md`](starter/project-readme-template.md) (your handover README) and
[`starter/evidence-log.md`](starter/evidence-log.md).

## 1. Plan and establish a baseline (45 minutes)

Identify page, API, health, environment and logs. Reuse W1.10's completed observations as historical baseline. Write
fresh project smoke expectations: page loads; clicking Reference receives HTTP 200 and the specified board; `/healthz`
returns Healthy; received release is `foundation-observe-a`; environment matches your intended setting; missing-board
404 separately. Record who reviews your change and which namespace is assigned. Draw browser → Service → selected Pod →
page/API, with the log destination separately; the browser calls a relative API path, not the cluster-internal hostname.

## 2. Package and run locally (90 minutes)

From this project directory, create a personal project folder outside the distributed lab (choose a fresh unique path if
it exists) and copy the supplied application unchanged:

```bash
mkdir /tmp/p1-my-team
cp -R ../code/app /tmp/p1-my-team/app
cp guided/Containerfile guided/runtime.env /tmp/p1-my-team/
cp guided/client.json /tmp/p1-my-team/app/wwwroot/client.json
mkdir -p /tmp/p1-my-team/configuration/app
cp guided/resources.yaml /tmp/p1-my-team/configuration/app/
cp guided/submit.sh /tmp/p1-my-team/
cd /tmp/p1-my-team
```

Choose a public blue or green environment in `runtime.env`. In `client.json` choose a 40–650 ms deadline and 0–2 retries
with `deadlineMs × (retries + 1) ≤ 650`; justify the supplied 450/0 starting point using your W1.10 evidence. Then:

```bash
dotnet publish app/Foundation.csproj -c Release -o publish --nologo
podman build --pull=never -f Containerfile -t localhost/$P1_NAMESPACE:foundation-a .
podman image inspect localhost/$P1_NAMESPACE:foundation-a --format '{{.Id}}'
podman run -d --name "$P1_NAMESPACE-local" --network host --env-file runtime.env -e LAB_SESSION="$P1_SESSION" -e LOCAL_LOKI_URL="$P1_LOCAL_LOKI_URL" -e ASPNETCORE_URLS=http://127.0.0.1:18080 localhost/$P1_NAMESPACE:foundation-a
```

```bash
curl --fail --show-error http://127.0.0.1:18080/healthz
curl --fail --show-error -D local-headers.txt http://127.0.0.1:18080/api/boards/reference -o
    local-board.json
```

Port 18080 must be reserved in your environment (the facilitator supplies another if shared). Open
`http://127.0.0.1:18080`, click Reference and compare the complete body, release and environment; preserve its request
ID. Save `podman logs "$P1_NAMESPACE-local"` with your evidence and find the request in Grafana by its exact `request_id`
and session. Your packaging gate follows W1.07: a failed build or smoke test means the image is not ready; repair and
rerun before review. Record source version, Containerfile/configuration changes and image ID.

> Local alternative: where `--network host` does not reach your browser (for example a Podman machine on Windows or
> macOS), publish the port instead: replace `--network host ... -e ASPNETCORE_URLS=http://127.0.0.1:18080` with
> `-p 127.0.0.1:18080:8080`. Record which form you used.

## 3. Review the deployment proposal (45 minutes)

Ask the facilitator to import your locally checked image, preserving the image ID. Edit
`configuration/app/resources.yaml`: replace the image placeholder with the exact imported label, the Loki URL with
`P1_CLUSTER_LOKI_URL`, set `LAB_SESSION` to your `P1_SESSION`, and choose `LAB_ENV`. Keep the resource names, one replica
and the processor-count setting. Explain the Service selector, port and named target, `imagePullPolicy: Never` (prepared
local import, not a BP registry policy) and the health probe. If you later change the ConfigMap, increment the
`academy/config-revision` annotation in the Pod template in the same commit.

```bash
cd configuration
git init --initial-branch=main
git add app/resources.yaml
git diff --cached
git commit -m "Deploy reviewed foundation image to classroom"
git rev-parse HEAD
```

Write a short review request (outcome, source/image identity, destination, changed fields, executed checks, recovery
plan); a peer/facilitator records the decision. No BP pull request or hosted CI has been executed by these commands.

## 4. Deploy through classroom GitOps (90 minutes)

From `configuration`, set `P1_REVISION` to the full reviewed commit. The supplied transport
([`guided/submit.sh`](guided/submit.sh)) copies a bare Git repository into the prepared classroom Git server; it neither
approves the change nor mutates the application.

```bash
../submit.sh "$P1_REVISION"
argocd --core app sync "$P1_NAMESPACE" --revision "$P1_REVISION"
argocd --core app wait "$P1_NAMESPACE" --sync --health --timeout 90
argocd --core app get "$P1_NAMESPACE"
kubectl -n "$P1_NAMESPACE" get deployment,pods,service,endpointslices
kubectl -n "$P1_NAMESPACE" get pods -o json > ../running-pods.json
kubectl -n "$P1_NAMESPACE" port-forward service/foundation 18081:8080
```

Keep port-forward running. In another terminal request `http://127.0.0.1:18081/healthz` and `/api/boards/reference`,
then open the page and click Reference. Match the Argo revision, Pod runtime image ID, ready Service endpoint, board
body, release and environment. Explain which connection the port-forward exercises (it is not a public BP ingress). Use
`kubectl -n "$P1_NAMESPACE" logs deployment/foundation`, then query the prepared Grafana Loki datasource:

```text
{job="academy-w110", session="YOUR_P1_SESSION"} | json | request_id="YOUR_ACTUAL_REQUEST_ID"
```

Replace the two prompts with actual values. `LOCAL_RECORD_UNAVAILABLE` or an empty query requires checking
URL/session/time/delivery; do not relabel raw stdout as a Grafana observation.

## 5. Diagnose and recover (90 minutes)

Preserve the known-good commit and evidence. Change only the Service selector `app: foundation` to
`app: foundation-missing`, predicting why the Pod may stay healthy while the Service lacks a backing endpoint. Review,
commit, publish and synchronize it; stop any old port-forward first; retain the failed port-forward, empty endpoints and
healthy Pod status. Explain why rebuilding the image would not repair the selector. Restore the selector with a new
reviewed corrective commit (or revert the bad commit), publish, synchronize, start a fresh port-forward and repeat
browser/API/health/log correlation. Then change the public environment blue → green as a separate predicted exercise:
increment the Pod-template annotation, review, reconcile and check the header from a fresh request.

## 6. Reproduce and hand over (90 minutes)

Write a concise project README (template in `starter/`): starting files/source version, prerequisites, build command,
image identity, public configuration, deployment revision/review, startup/verification steps and recovery, with actual
evidence for page/API/health/Grafana and the controlled failure. Do not submit `publish/`, local runtime state,
kubeconfig or credentials. A peer follows it from a fresh folder; record the new image identity and compare
source/configuration if it differs. Stop your local application with `podman stop "$P1_NAMESPACE-local"` and your
port-forward with Ctrl-C; the facilitator releases the Application/namespace after evidence review.

## 7. Individual demonstration (90 minutes)

Each person traces source → built image → reviewed configuration → Argo revision → selected Pod → actual browser/API
response → matching log, predicts an unseen variation (healthy Pod with no Service endpoints; changed environment file
without a replacement Pod), shows the failed and recovered request path, explains one rejected repair, and identifies the
BP-specific evidence still unavailable. Oral explanation or a recording is equivalent to prose.

## Completion criteria

- [ ] Your image packages the supplied page and API and passes local build/receipt checks.
- [ ] Your configuration explains same-origin routing, Service selection/port and intended public environment.
- [ ] A reviewed configuration revision selects the imported image through actual classroom Argo reconciliation.
- [ ] Fresh browser/API/health evidence and a matched Grafana request establish the deployed result.
- [ ] A bounded failure has an explained cause, a justified correction and successful fresh verification.
- [ ] Another learner can follow your README and distinguish selected version, actual runtime and receipt.
- [ ] Each learner demonstrates understanding; local completion and unavailable BP actions are labelled accurately.

If something is pending, name the failed check or missing dependency and retain its evidence.
