# W3.04 · AI development workflows, agents and CLI tools

**Duration:** about 120 minutes, including one 45-minute challenge (code + short decision record) and an
8-minute knowledge check.

AI-assisted development uses a model to help explain, propose or change software. The engineer still
decides what the software must do and whether the submitted change meets that requirement.

## Outcomes

- Compare interactive assistance with an agent using a supplied harness and CLI tools.
- Describe the allowed context, files, tool access and completion checks for the bounded task.
- Write task instructions based on the known defect and its acceptance examples.
- Review and debug the assisted change using its diff and independently defined test expectations.

## No live model is required

The book's delivery uses a facilitator-prepared terminal agent (OpenCode 1.17.13 with a free model the
facilitator confirms beforehand). **This lab is completable without any AI tool, account or credential.**
The supplied helper `code/assist.py` never calls a model:

| `assist.py run` mode | What it does | How to record it |
|---|---|---|
| `--mode recorded` (default) | Replays the recorded demonstration run: its events and its single edit | "supported review of a recorded run" — not a live run you directed |
| `--mode manual` | Records the edit you made yourself in the attempt's `workspace/src/rules.ts` | "human correction" |
| `--mode external` | Records a diff made by a facilitator-prepared assistant under the generated `permissions.json` | "assisted edit (tool, date)" |

Do not create accounts or enter credentials. Do not repeatedly invoke a free service until a desired
answer appears.

## Supplied and owned

| Path | Role |
|---|---|
| `code/starter/` | Pre-fix rule (`src/rules.ts`, same as W3.03), board, `contract.md`, five fixed tests (`tests/rules.test.mjs`) |
| `code/assist.py` | `prepare`, `inspect`, `check`, `run`, `recover` (see `code/README.md`) |
| `code/demo.py`, `code/candidates/` | Worked example 2 replay: `unsupported.ts` and `corrected.ts` |
| `code/recorded/` | Recorded demonstration run and the preflight run (exit 0, denied reads, no edit) |
| `document/demo-task.txt` | Complete demonstration instruction |
| `document/task.txt` | **You own:** your instruction |
| `document/decision-record.md` | **You own:** the decision record |
| `document/scenario-brief.md`, `document/receipts.md`, `document/rubric.md` | Scenario, three completion receipts, rubric and hints |

## Setup

Node 22.23.2 / npm 10.9.8, Python 3. From the lab root establish the expected baseline:

```bash
cd code/starter
npm ci --ignore-scripts --no-audit --no-fund
npm test
```

The starter compiles and initially fails two of five behavioural tests (the wall and boundary budget
assertions). Return to the lab root before the tasks.

## Retrieve, then predict

The game starts with six moves at (0,0). East leaves five; South targets the wall and the baseline returns
four. **Predict:** a recorded process exited successfully after denied reads and no edit
(`code/recorded/preflight-run.json`) and reported the task unfinished. Would exit zero be enough to accept
the task? Name the next observation you would need.

## Concepts

```
Instruction→model decision→tool action→observed result
```

An assistant suggests while the engineer chooses each edit; an agent selects tools, inspects results and
continues. The harness provides context, dispatches tools and applies configured controls; a CLI is one way
to operate it. Context = rule contract, relevant source, acceptance examples. Constraints = what must remain
true. Tool access = which operations the harness permits (here: three reads, one file's edits; shell and web
denied). Completion checks = evidence after the edit. Natural-language limits and configured permissions
serve different purposes; permission rules are not a security sandbox.

## Worked example 1: specify the bounded correction

From the lab's `code` directory (Windows PowerShell: use `python` and `$env:W304_ATTEMPT = python assist.py prepare --prompt ../document/demo-task.txt`, then `"$env:W304_ATTEMPT"`):

```bash
W304_ATTEMPT=$(python3 assist.py prepare --prompt ../document/demo-task.txt)
python3 assist.py inspect "$W304_ATTEMPT"
python3 assist.py check "$W304_ATTEMPT"
```

Before correction the check fails at the known wall and boundary budget assertions. Then:

```bash
python3 assist.py run "$W304_ATTEMPT"
python3 assist.py inspect "$W304_ATTEMPT"
python3 assist.py check "$W304_ATTEMPT"
```

The recorded run read the contract and rule, then made one edit. It removed the stale defect comment and
changed the blocked return to:

```ts
if (blocked) return { accepted: false, state, reason: "ILLEGAL_ACTION" };
```

The tool said it had not run checks. The independent run passes five tests; all fixed files are unchanged.

## Worked example 2: inspect an unsupported assumption

A separate supplied candidate (`code/candidates/unsupported.ts`) fixes blocked moves but grants a free move
whenever treasure is collected:

```ts
const movesRemaining = state.movesRemaining - (treasure ? 0 : 1);
```

The contract charges one for every accepted move, so East, East reaches treasure with four moves, not five.
The supplied replay selects an explicit source and runs the same checks in a fresh copy:

```bash
python3 demo.py unsupported
python3 demo.py corrected
```

The unsupported case fails on accepted-move cost; the corrected replay passes all five tests. The replay
invokes no model.

## Guided practice

1. **Classify three observations:** a read is denied and no file changes; an edit completes but the current
   source fails a named assertion; a tool reports success and a diff exists, but no check ran. Name the next
   action for each. Do not broaden all permissions to solve one denied path.
2. **Select the relevant inputs** (invoice rounding example): which material would you include, which leave
   out, and what would you clarify?
3. **Read the supplied permissions** (`assist.py inspect` prints `permissions.json`): reads of the rule,
   contract and tests; edits of the rule only; shell, web, delegation and unspecified operations denied.
   Explain why the engineer's check can run npm while the model's shell remains denied.
4. **Retain evidence of the current source:** which attempt file answers "what did the tool do?"
   (`events.jsonl`, `record.json` run) and which answers "what did the current check execute?" (check
   entries with rule and test SHA-256 fingerprints)?

## Lab challenge: direct and verify the bounded assisted correction (45 minutes)

1. **State the defect independently — 5 min.** Write the initial state, actions and expected rejected
   result in `document/decision-record.md` before any assistance.
2. **Choose context and write instructions — 8 min.** Separate the agreed requirement from the teammate's
   suggestion (`document/scenario-brief.md`). Write `document/task.txt` in your own words: relevant context,
   one editable file, fixed behaviour, tools, stopping condition and independent completion checks. Then
   `python3 assist.py prepare --prompt ../document/task.txt` and `inspect` the controls.
3. **Direct, inspect and verify — 12 min.** Run once (`run`), read the actual events and diff, then `check`.
   Preserve any failure before correcting. If the change is wrong, correct only the attempt's
   `workspace/src/rules.ts`, re-check and record that the final correction was yours.
4. **Assess the same bugfix handoff — 12 min.** For each receipt in `document/receipts.md`: accept, reject or
   request a specific missing check, citing fingerprints or scope. Identify the sufficient receipt; for an
   insufficient one, choose the minimum next independent action and what its result would change.
5. **Complete the record — 8 min.** Instruction, attempt path, changed line, actual checks and receipt
   decisions; an individual explanation without a new model answer.

## Acceptance criteria

- I independently identified the known defect and expected result before assistance.
- My instruction identifies relevant context, fixed behavior, editable file, allowed tools and completion evidence.
- I inspected the prepared boundaries and recorded actual actions, including any access blocker.
- My diff stays within the rule task; fixed source and tests are unchanged.
- I ran current-source independent checks, or clearly recorded why execution is blocked.
- My receipt decisions include a justified acceptance and a specific diagnosis/action for insufficient evidence.
- My individual explanation connects an assisted edit to its independent expectation and names an evidence limit.

Hints are at the end of [`document/rubric.md`](document/rubric.md).

## Knowledge check (about 8 minutes)

1. A developer asks a chat assistant for an explanation and applies the suggested edit manually. Another
   gives OpenCode a task and it reads a file, edits it and responds. Which comparison describes the engineer's
   responsibility? A) Only the chat workflow needs independent verification. B) Both need independent
   expectations and review; the agent workflow also includes tool actions the engineer must inspect. C) A
   command-line interface makes the second result deterministic. D) The harness replaces the need to
   understand the changed behavior.
2. A prepared task permits one rule-file edit and denies shell execution. The agent asks to run a package
   command through its shell tool. The engineer can run a separate supplied check command. What follows?
   A) The agent automatically inherits every operation available to the engineer. B) The natural-language
   request overrides the configured denial. C) The engineer should inspect the request and retain the prepared
   boundary; the separate check can be run deliberately outside the agent. D) Any denied shell request proves
   the proposed rule is incorrect.
3. A task asks for a documented invoice rounding correction. A teammate suggests changing tax rates and
   including unrelated customer exports. Which instruction best bounds the work? A) State the rounding
   contract, affected source, fixed tax behavior, permitted file and independent checks; exclude unrelated
   exports and clarify the tax suggestion separately. B) Ask the agent to make all related improvements until
   its own tests pass. C) Supply every available record. D) Describe only the desired passing count and let
   the agent rewrite expectations.
4. An agent reports that five tests passed after editing a rule. The independent record identifies one source
   fingerprint, but the current rule has a different fingerprint. What can the engineer conclude? A) The
   current rule is correct because the counts are green. B) The current rule is definitely wrong. C) Every file
   must be rewritten before testing. D) The recorded pass belongs to different source bytes; inspect the
   difference and run the unchanged checks against the current source before accepting that claim.

## Recovery

The helper preserves every attempt in a unique directory under `code/attempts/`. If the rule needs
restoring:

```bash
python3 assist.py recover "$W304_ATTEMPT"
```

It saves and verifies copies of the current rule and instruction before restoring the original rule, and
leaves prior events and checks intact. Recovery is not evidence that you completed the task. The attempt has
already used its one run; prepare a new attempt only when the facilitator directs another run. A missing
compiler needs setup repair; a denied intended read needs inspection of the exact prepared paths; a provider
failure (facilitator route) needs the recorded fallback and an access-blocked note.

## Optional depth: reconsider the tool boundary

After the handoff, consider allowing an agent to run one existing test command. What additional control and
evidence would you require (does it install dependencies, write generated files, invoke package scripts)?
Do not enable wider shell access or invoke another model during this discussion.
