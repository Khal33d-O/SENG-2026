# Foundation deployment plan (W1.09 template)

Status labels to use for every observation: **intended** / **historical (date, scope)** / **executed locally (date)** /
**unavailable on BP - requires approved walkthrough**. Do not report a BP deployment.

## 1. Scope and access (10 min)
* Service: supplied foundation page + reference-board API (same image; page calls `/api/boards/reference` same-origin).
* Practical route for project work: supplied local classroom route (Kubernetes/Argo CD as in W1.08).
* Relationships, using the fictional classroom record (not BP identifiers):
  | Question | Fictional classroom answer | Real BP detail (status) |
  |---|---|---|
  | Where does the service belong (tenant)? | Academy practice | unverified - requires approved walkthrough |
  | Who may change it? | Learner proposes; facilitator approves | |
  | Which repository records the change? | foundation-app / foundation-training-config | |
  | Where may the result run? | Assigned personal classroom namespace | |
* BP details still needing verification (short list):

## 2. Configuration and review (15 min)
| Field (W1.08 guided YAML) | Owning resource | Current value | Value the project must supply |
|---|---|---|---|
| Image | Deployment template container | | approved image identity (project) |
| Service selector | Service | | |
| Listener / target port | Service + container port | | |
| Non-secret environment configuration | ConfigMap | | |

* Application source / build artifact / configuration revision - one sentence each:

### Review request (draft)
* Requested outcome:
* Changed fields:
* Chosen artifact (image identity, not just a tag):
* Destination (assigned, verified?):
* Verification performed / planned:
* Approver (person or group from the training workflow):
* Rollback route (known-good configuration revision):

## 3. Verification and recovery (10 min)
* Why a healthy Pod can coexist with the wrong board response:
| Check | Command or action | Expected observation | Status |
|---|---|---|---|
| Browser | open page, Load board (Reference) | HTTP 200, 3x3 board, 6 moves, release, environment | intended |
| API contract | GET /api/boards/reference; GET /api/boards/missing | 200 board; 404 NOT_FOUND | intended |
| Health | GET /healthz | 200 Healthy (narrow liveness only) | intended |
| Correlated log | find request_id in structured logs / Grafana | matching row (request_id, session) | intended |
* Restore the last reviewed configuration and verify again:

## 4. Review and individual check (10 min)
* Reviewer's ambiguous target or unsupported claim, and my revision:
* My explanation of approval vs build vs deployment:
* One missing BP prerequisite:
* Assistance used:
