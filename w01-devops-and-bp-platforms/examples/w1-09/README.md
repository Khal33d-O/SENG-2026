# W1.09 guided preparation demonstration (worked example)

All names below are fictional classroom examples, not BP identifiers. BP Yalla scaffolding is **pending** (approved
walkthrough not supplied); nothing here executes a platform action.

## Step 1: relationships in the fictional record

| Question | Answer from the fictional record | Needs BP confirmation? |
|---|---|---|
| Where does the service belong? | Tenant "Academy practice" | Yes - real tenant and membership |
| Who may change it? | Learner proposes; workshop facilitator approves | Yes - real roles |
| Which repository records the change? | foundation-app (source), foundation-training-config (configuration) | Yes - permitted repositories |
| Where may the result run? | Assigned personal classroom namespace | Yes - deployment environment |

A readable repository is not an authorised deployment target: reading foundation-app grants neither approval nor
deployment access.

## Step 2: trace a fictional release

| Observation | Value | What it establishes |
|---|---|---|
| Source revision A | built image I-A | a build result exists |
| Configuration C1 (approved) | selects I-old | **running version before approval: I-old** |
| Proposed C2 | selects I-A, awaiting review | intention only |
| After approval + reconciliation, still needed | Argo revision = C2, Synced/Healthy; selected Pod runtime image = I-A; Service endpoint; browser/API response | the six-step trace |

## Step 3: inspect the W1.08 guided YAML and draft two sentences

From `../../labs/w1-08/code/guided/resources.yaml`: image `localhost/academy-w108-author:a` (Deployment main-page
template container `page`), Pod label / Service selector `app: main-page`, Service port 8080 → targetPort `http`
(containerPort 80), ConfigMap `page-settings` `TRAINING_SITE` (non-secret).

* Proposed change: "Select recorded image I-A for the foundation Deployment's `page` container in the assigned classroom
  namespace, leaving selector, ports and ConfigMap unchanged."
* Verification: "After reconciliation, confirm the Argo revision, the selected Pod's runtime image ID equals I-A, and a
  browser request receives HTTP 200 with the 3x3 reference board, plus `/healthz` Healthy and a matching request log."
