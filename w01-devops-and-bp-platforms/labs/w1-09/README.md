# W1.09 lab: prepare a reviewable foundation deployment plan

> **Delivery scope.** Concepts and preparation are available. The approved BP Yalla walkthrough and exact CLI commands
> have **not** been supplied. Live scaffolding, a BP pull request and a BP deployment remain unavailable in this lesson
> (pending / facilitator-supplied). Complete the preparation exercise below; it is not evidence of executing those
> platform actions. Do not try guessed commands, create a tenant, or treat the local W1.08 adapter as Yalla.

## Timing

| Block | Minutes |
|---|---|
| Concepts (Yalla and tenants; users, repositories and environments; scaffolding; approval to deployment) | 35 |
| Guided preparation demonstration (three steps) | 20 |
| One challenge (four parts: 10/15/10/10) | 45 |
| Recap and knowledge check | 10 |

## Outcomes

* Explain tenant/repository/user/environment relationships.
* Distinguish the three delivery responsibilities: application code, pipeline execution and GitOps configuration.
* Prepare a reviewable service plan with verification and recovery.
* (Pending) Create the real training configuration and submit it through BP's approval route — requires the missing walkthrough.

## Supplied and owned

You own the target/access checklist, the review request and the evidence plan in a copy of
[`starter/deployment-plan-template.md`](starter/deployment-plan-template.md). Supplied: the
[fictional classroom record](starter/fictional-record.md), the W1.08 guided YAML
(`../w1-08/code/guided/resources.yaml`) and your earlier lab observations. No programming or BP access is required.

## Guided preparation demonstration (20 minutes)

1. With the fictional record, point to the tenant, permitted repositories, learner role, approver and destination. Mark
   which details need BP confirmation; compare a readable repository with an authorised deployment target.
2. Trace a fictional release: source A builds image I-A; configuration C1 still selects I-old; proposed C2 selects I-A
   but is awaiting review. Predict the running version before approval, then list the observations needed after
   reconciliation. None of these labels is a real execution record.
3. Inspect the actual configuration fields in the W1.08 supplied YAML, then draft one proposed-change sentence and one
   verification sentence. See [`../../examples/w1-09/README.md`](../../examples/w1-09/README.md).

## Challenge: prepare a reviewable foundation deployment plan (45 minutes)

Your service is the supplied board page and reference-board API. Copy the template into your own work folder.

1. **Scope and access (10 min).** Identify the foundation page/API and choose the supplied local classroom route for
   practical work. Use the fictional record to explain tenant/user/repository/environment relationships. Keep a separate
   short list of real BP details needing verification.
2. **Configuration and review (15 min).** Inspect W1.08's guided YAML. Identify image, Service selector, listener/target
   port and non-secret environment configuration, with their owning resources. Draft a review request for deploying the
   supplied foundation rather than reusing the static page image; name the approved-image and destination information the
   project must supply. Distinguish application source, build artifact and configuration revision.
3. **Verification and recovery (10 min).** Predict why a healthy Pod can coexist with the wrong board response. Specify a
   browser check, API contract check, health check and correlated request-log check. State how you would restore the last
   reviewed configuration and verify it again. Use prior real evidence only with its original scope and date.
4. **Review and individual check (10 min).** Exchange plans. Your reviewer identifies one ambiguous target or unsupported
   completion claim; revise it. Each learner explains the approval/build/deployment distinction and one missing BP
   prerequisite. Record assistance; oral or recorded explanations may replace prose.

**Finished** means a concise plan with one review request and a usable checklist, not a collection of screenshots. The
plan says which observations are intended, historical, actually executed locally or unavailable on BP. If you cannot
inspect a prior workspace, use the distributed YAML and label its values as supplied examples.

## Acceptance criteria

- [ ] Tenant, user, repository and environment relationships explained with the fictional record; real BP details listed as unverified.
- [ ] Image, selector, port and non-secret configuration identified with their owning resources.
- [ ] One review request: outcome, changed fields, artifact identity, destination, checks, approver, rollback route.
- [ ] Browser, API contract, health and correlated log checks with expected observations.
- [ ] Every observation labelled intended / historical / executed locally / unavailable on BP; no BP deployment claimed.
- [ ] Peer revision recorded; individual explanation and assistance recorded.

## Knowledge check (10 minutes)

1. You can read an application repository but have no confirmed training destination. What is the supported next step?
   A) Deploy to the first environment named training. B) Verify the permitted tenant, destination and your role against the approved training instructions. C) Treat repository read access as deployment approval. D) Create a new BP tenant yourself.
2. Source revision A built image I-A successfully. The approved configuration still selects I-old. What can you conclude?
   A) The build proves I-A is running. B) The pipeline approved the configuration automatically. C) I-A exists as a build result; establish which configuration and runtime image are actually selected. D) The application repository is the live environment.
3. The approved walkthrough is unavailable, but a colleague recalls a likely CLI command. What should your plan record?
   A) Run it in any accessible tenant. B) Mark scaffolding complete because the command looks plausible. C) Substitute the W1.08 adapter and call it Yalla. D) Leave BP scaffolding pending and complete the local preparation/checklist.
4. Argo reports the selected revision synchronized and the Pod healthy. The browser receives the wrong page. Which evidence most directly helps next?
   A) The selected Service endpoints, Pod identities and actual browser request/response. B) Another copy of the build-success badge alone. C) The tenant display name alone. D) A claim that health guarantees the right response.
5. Which proposed review request is most useful?
   A) Deploy latest; somebody can check later. B) Select recorded image I-A in the assigned training destination; identify changed fields, reviewer, checks performed and the known-good configuration to restore. C) All systems are ready because the YAML file exists. D) Include your kubeconfig so reviewers can impersonate your session.

## Carry forward

Carry the plan into the Week 1 project with BP items pending. Once the approved walkthrough arrives, the facilitator
will schedule the outstanding live scaffold, generated-file review and approval/status evidence.
