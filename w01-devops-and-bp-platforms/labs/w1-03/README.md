# W1.03 lab: Review a configuration proposal

Use a guided branch-and-pull-request workflow to submit and review one small configuration change. Tasks 1–2 use the
supplied initial request [R1](document/requests/R1.md). Task 3 introduces a further request record,
[R2](document/requests/R2.md) — open it only when Task 3 starts. Keep each record with the actual diff and check; the
supplied candidate is material to inspect, not a completed review decision.

## Timing

| Block | Minutes |
|---|---|
| Retrieval, concepts and two worked examples | about 45 |
| Guided floor (setup, guided proposal, line-2 comment) | 15 |
| Challenge: pointer 1, Task 1 8, Task 2 10, Task 3 12, Task 4 14 | 45 |
| Debrief: individual evidence, transfer and the 8-minute knowledge check (minutes 102–110) | 15 |
| Recovery and consolidation | 10 |

## Outcomes

* Explain how a branch and pull request allow a change to be checked before integration.
* Describe which repository contains the supplied deployment configuration.
* Write a short pull-request description stating the change and its verification.
* Annotate a peer's small diff using the supplied review checklist.

## Ownership and output

You own the branch's `configuration/service.ini` edit, the proposal description, the peer annotation and your
individual explanation. The application program, Git initializer, training interface ([`code/training.py`](code/training.py))
and tests are supplied. Keep both main branches unchanged and stop at a reviewed proposal: no merge, conflict
resolution, application-code edit or deployment. Submit the workspace's `proposal.json` with your completed response
(`description.md`, `review.md`, `approval.md`, [`evidence.md`](evidence.md)). Forms: [`document/`](document/).

The interface prints `LOCAL PR TRAINING`. Its role names are local practice labels, not authenticated identities. It
never calls GitHub or BP; the two origins are local directories. A local pass demonstrates the recorded behaviour, not
provider access or deployment.

## Setup and guided floor

Linux/Bash terminal with Git and Python 3 (authoring rehearsal: Git 2.47.3, Python 3.13.5; re-tested with Git 2.49 and
Python 3.13). No packages, credentials or global configuration changes. Work in a **personal copy** of this lab folder;
the workspaces are created as sibling folders. On Windows keep the path short (Git's 260-character limit).

```bash
pwd
LAB_DIR="$PWD"
LAB_WORK="$PWD/../w1-03-guided"
export PYTHONDONTWRITEBYTECODE=1
python3 "$LAB_DIR/code/training.py" init --dest "$LAB_WORK" --scenario guided
python3 "$LAB_DIR/code/training.py" baseline --workspace "$LAB_WORK"
```

Inspect `application/README.md`, `configuration/README.md`, both remote addresses and the configuration file:

```ini
[deployment]
notice = Welcome to the workshop.
replicas = 1
environment = training
```

Enter the guided configuration clone and create its branch:

```bash
cd "$LAB_WORK/configuration"
git remote -v
git switch -c change/notice
```

Change only the notice to `Use the side entrance.` and save. Use Task 2's inspect/stage/commit/push/open/check commands
in this guided workspace (Task 1's new initialization and candidate copy belong to the challenge). Predict the
preview, run the check and give a reasoned line-2 comment using Task 3's annotation command. Clarify the description
if necessary and `update` the proposal. Use the [review checklist](document/review-checklist.md). Worked examples:
[`../../examples/w1-03/README.md`](../../examples/w1-03/README.md).

## Task 1: Establish the challenge branch (8 minutes)

```bash
cd "$LAB_DIR"
LAB_WORK="$PWD/../w1-03-challenge"
python3 "$LAB_DIR/code/training.py" init --dest "$LAB_WORK" --scenario challenge
python3 "$LAB_DIR/code/training.py" baseline --workspace "$LAB_WORK"
cd "$LAB_WORK/configuration"
git status
git remote -v
git rev-parse main
git switch -c change/notice
cp "$LAB_DIR/code/starter/fixtures/candidate.ini" service.ini
git diff
```

`cp` copies the supplied candidate into this fresh clone. Read the entire diff: a minus line is from the base and a plus
line from the candidate. Record which effects R1 requests and whether this candidate implements them before checking
it. Keep the application clone unchanged; the tool rejects an application proposal, but locating the correct
repository is your responsibility.

## Task 2: Open and check the candidate (10 minutes)

```bash
git add -- service.ini
git diff --cached
git commit -m "Propose the reference board notice"
git push -u origin change/notice
git diff main HEAD
cp "$LAB_DIR/document/description-template.md" "$LAB_WORK/description.md"
```

Edit `description.md` outside the clone: requested effect, repository/file, check to run and limitation. Do not
claim scope agreement from a passing preview.

```bash
python3 "$LAB_DIR/code/training.py" open \
  --workspace "$LAB_WORK" --branch change/notice \
  --description "$LAB_WORK/description.md"
python3 "$LAB_DIR/code/training.py" check --workspace "$LAB_WORK"
python3 "$LAB_DIR/code/training.py" show --workspace "$LAB_WORK"
```

The checker reads committed configuration, runs the supplied text preview and records the exact head. Its valid-field
check accepts replica counts one through three. Compare the output with the request rather than treating success as
automatic approval.

## Task 3: Annotate and decide (12 minutes)

Rotate roles and open review update [R2](document/requests/R2.md). Compare both request records with the full
committed diff and stored check. Record which request governs now, whether the existing check still describes this
head, and the decision you defend. Retain that initial note with the facilitator or partner **before** invoking any
review/verification gate. Copy [`document/comment-form.md`](document/comment-form.md) to `$LAB_WORK/review.md` and
replace its blanks with your own observation, effect and proposed action.

```bash
cat -n service.ini
python3 "$LAB_DIR/code/training.py" review \
  --workspace "$LAB_WORK" --reviewer learner-b \
  --path service.ini --line REVIEWED_LINE \
  --comment "$LAB_WORK/review.md" --decision REVIEW_DECISION
```

Replace `REVIEWED_LINE` with the integer you inspected and `REVIEW_DECISION` with your chosen `comment`,
`request-changes` or `approve`. A general comment does not count as approval. The author and reviewer labels must differ.

## Task 4: Incorporate feedback and recheck (14 minutes)

Before executing a response, record which content and evidence can be retained, what needs another observation and
why. Inspect working, staged and committed contents:

```bash
git diff
git diff --cached
git diff main HEAD
git rev-parse HEAD
```

When your plan needs a configuration commit:

```bash
git add -- service.ini
git diff --cached
git commit -m "Apply the configuration review feedback"
git push origin change/notice
```

A check observes the head currently recorded by the proposal:

```bash
python3 "$LAB_DIR/code/training.py" check --workspace "$LAB_WORK"
```

An update records the selected published branch and saved description; show reads the resulting record:

```bash
python3 "$LAB_DIR/code/training.py" update \
  --workspace "$LAB_WORK" --branch change/notice \
  --description "$LAB_WORK/description.md"
python3 "$LAB_DIR/code/training.py" show --workspace "$LAB_WORK"
```

Compare the recorded identifiers with the revision you intend to propose. Save a new comment form as `approval.md`
with the decision actually supported by that inspection:

```bash
cat -n service.ini
python3 "$LAB_DIR/code/training.py" review \
  --workspace "$LAB_WORK" --reviewer learner-b \
  --path service.ini --line REVIEWED_LINE \
  --comment "$LAB_WORK/approval.md" --decision REVIEW_DECISION
python3 "$LAB_DIR/code/training.py" verify --workspace "$LAB_WORK"
```

From the lab folder, `make test WORK="$LAB_WORK"` runs the same final verification. `make smoke` with that workspace is
a baseline-only check and no longer passes once you have changed the baseline. `make unit` checks the supplied
parser/annotation interface (`python3 -m unittest discover -s code/tests`). Without make, use the `training.py`
commands above. `python3 starter/run.py ...` is an equivalent entrypoint.

## Acceptance criteria

- [ ] The proposal comes from the configuration branch; both main branches and application source remain unchanged.
- [ ] Its current diff implements the current request, contains no unauthorised change and preserves the supplied training target.
- [ ] Description and check identify the change, observed preview and exact current head, with no hosted/deployment claim.
- [ ] The record retains a peer's changed-line request, a subsequent committed correction and an updated proposal snapshot.
- [ ] A fresh passing check and peer approval refer to the final head; the earlier result remains identifiable as history.
- [ ] Each learner retains the initial request/line/decision comparison and evidence plan made before tool feedback, explains any revision, records assistance and specifies a next revisit.

Expected starter failure of the final verifier is `No training proposal`; a completed artifact must pass it. Machine
verification does not establish that a comment's reasoning is good; the [rubric](document/brief-and-rubric.md) does.

## Hints

<details><summary>Hint 1: Locate the comparison boundary</summary>

List the available request records, diff and check. For each, identify what it describes and when it applies before
choosing a review decision.
</details>

<details><summary>Hint 2: Expose the intermediate evidence</summary>

Make separate columns for each request revision, the base value, proposed value and recorded check input. Mark where
the records agree and where they differ. Do not treat a permission record and a program observation as the same kind
of evidence.
</details>

<details><summary>Hint 3: Complete the bounded operation</summary>

Complete: "Record ... governs because .... At line ... I observe .... The check names head ..., while the proposal
names .... My decision is ... because ...." For the response plan, name each observation you will retain or collect and
the operation that supplies it.
</details>

## Individual evidence

Name the repository, governing request revision, base and final head, selected line and preview observation. Explain
how the request records affected the peer decision and why the final evidence applies to the proposed revision.
Written, annotated, spoken or recorded responses are equivalent; each pair member responds individually.

## Transfer: an equipment service

An equipment-booking service has configuration for its opening notice and planned instance count. A holiday request
changes the notice; the candidate also raises the count from two to three and its preview passes. What do you annotate
before approval? The author then removes the extra count change in a new commit but leaves the old passing check
attached: which observation is needed for a current approval?

## Knowledge check (8 minutes)

1. A colleague commits on `change/notice`, pushes that branch to the supplied local origin and opens its training proposal. Main still identifies the initial commit. What has happened?
   A) The main branch now contains the notice because opening the proposal integrates it.
   B) The proposed branch is available in the local origin and has a review record; main and deployment remain unchanged.
   C) A new deployed environment exists because the branch has a different name.
   D) Nothing was shared because pushing to a local bare repository cannot store commits.
2. The supplied program already reads `notice` correctly. The request changes only its configured value. Which edit matches this repository boundary?
   A) Change `configuration/service.ini` on a new configuration branch and leave the supplied program unchanged.
   B) Change the application program so it always prints the new notice regardless of configuration.
   C) Edit both repositories because every configuration change requires a program change.
   D) Edit the local proposal JSON instead of configuration because the description is the deployed value.
3. A preview passed on head A. The author corrected the configuration in head B and updated the proposal, but no new check ran. Which description is justified?
   A) "All checks pass for this change" because the branch name stayed the same.
   B) "Deployed successfully" because the configuration parsed on the earlier head.
   C) "Head B incorporates feedback; the attached passing result is for A, so B still needs verification."
   D) "The old result is false and must be deleted" because B is newer.
4. For a different service, the current request explicitly authorises a new notice and an increase from one to two replicas. The full diff contains exactly those two changes; its check names the current head and prints the requested values. Which line-specific review is supported?
   A) Request changes on the replica line because replica edits are always forbidden after the earlier lab.
   B) Leave "Looks fine" as a comment and count that as approval.
   C) Request removal of one change because every valid proposal must modify exactly one line.
   D) Approve with an annotation: the notice and replica lines match the current permission, and the recorded check supports those values at this head; this does not claim deployment.
5. After feedback, the author commits and publishes the corrected configuration. The proposal still records the previous head and its passing check. Which next sequence produces a current reviewed proposal?
   A) Rename the old check's head in the JSON and retain the approval.
   B) Update the proposal, inspect its new diff, run the check on the new head and obtain a current peer decision.
   C) Merge main immediately because a correction always reduces risk.
   D) Run a check against the uncommitted editor file and assume the proposal now points to it.

## Recovery and teardown

Preserve the whole workspace and document response before recovery. A configuration correction can be a new ordinary
commit; no force push or whole-repository reset is required. Do not overwrite proposal records or delete review
history. For an unusable workspace, initialise a different unused destination or ask the facilitator for a checkpoint
alongside your attempt. If Git is unavailable, interpret the captured evidence and record the execution as
environment blocked. All training data stays in the named workspace; no process is left running. Remove only your own
disposable workspace after its evidence has been preserved.

## Optional depth

If you finish early, compare a description update with a code update and explain which requires a new check input.
