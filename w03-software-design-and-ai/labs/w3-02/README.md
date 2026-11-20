# W3.02 · Code review and quality tools

**Duration:** 120 minutes, including one 45-minute document challenge and an 8-minute knowledge check
within the 15-minute debrief.

A code review is a decision about a proposed change and the evidence supporting it. You read the intended
behaviour, inspect the diff, examine the checks and explain what should happen next. The origin of the patch
does not replace those steps. A plausible explanation from an AI system is another claim to examine.

## Outcomes

- Describe correctness, readability, maintainability and test coverage as review concerns.
- Explain what a SonarQube or equivalent report can reveal and what still requires human judgment.
- Annotate an AI-generated diff with defects, unsupported assumptions and missing tests.
- Write review feedback that identifies a problem and a concrete verification step.

## Supplied and owned

| Path | Role |
|---|---|
| [`review-brief.md`](review-brief.md) | Request, baseline, candidate C and the intended contract |
| [`packet/source-context.md`](packet/source-context.md), [`packet/candidate-C.diff`](packet/candidate-C.diff) | Baseline source and the candidate's diff |
| [`packet/candidate-message.md`](packet/candidate-message.md) | The candidate's confident message (deliberately flawed teaching material) |
| [`packet/trace-observations.md`](packet/trace-observations.md) | Actual local traces T1 and T2 for baseline and candidate |
| [`packet/quality-report.md`](packet/quality-report.md) | Actual ESLint 10.10.0 reports on the JavaScript emitted by TypeScript 5.9.3, with configuration and hashes |
| [`packet/demonstration-packet.md`](packet/demonstration-packet.md) | Completed demonstrations A and B |
| [`review-template.md`](review-template.md) | **You own** your working copy: the completed review document |
| [`rubric.md`](rubric.md), [`hints.md`](hints.md) | Rubric and staged hints |

This is a document-only lab: no installation, quality server, remote review service or live AI provider. The
instructor owns the executable fixtures and can replay a requested trace.

## Retrieve and predict

The board starts at (0,0) with six moves. East is accepted and leaves five. South targets the wall at (1,1);
the Week 3 baseline wrongly spends a move, leaving four. **Predict:** what should a behaviour-preserving
refactor do to that four, and what should a correction of the rejected-action rule do? Why are those
different review tasks?

## Concepts

Correctness concerns the behaviour promised by the contract; readability, whether another developer can
understand intent and mechanism; maintainability, whether likely changes can be made with clear
responsibilities and checks; test coverage, which behaviours the evidence actually exercises. Read the
surrounding branch and caller contract before treating a changed line as self-contained. The configured
ESLint rules detect unused bindings, constant conditions and a function above a complexity threshold; they do
not encode the game's move-cost requirement. Treat claims such as "all edge cases are handled" or "safe
cleanup" as statements requiring evidence; connect the claim, an observable consequence and a check that
distinguishes the alternatives.

## Worked example 1: review the rejected-action result

Read demonstration A in [`packet/demonstration-packet.md`](packet/demonstration-packet.md). The patch
preserves the state but changes the flag to `accepted: true`. Against East, South: the baseline fails state
preservation; the patch fails the acceptance assertion (actual true, expected false); the reference passes
both. The completed annotation asks for the rejected result and an assertion covering both the flag and the
complete state.

## Worked example 2: turn a quality finding into feedback

Read demonstration B: ESLint reports `no-unused-vars` for `unusedTone` at emitted JavaScript line 2,
column 11, severity error, exit 1. The comment requests removal followed by lint and the two output checks;
the corrected example exits 0 and both outputs are unchanged. Do not generalise this into "every unused result
permits removing its call".

## Guided practice

1. **Read the request before the patch** (pairs, without the diff): underline the promises that remain in
   force; box the requested change; explain one reason a later status could legitimately differ after a
   budget correction.
2. **Read the actual report:** candidate and reference both have zero errors and one complexity warning
   (threshold twelve, complexity fourteen for `evaluateMove`); both ordinary commands exit zero; a second
   command with `--max-warnings 0` exits one for the same warning. Complete one tool observation row in your
   template and one open question.
3. **Organise a trace record:** read T2 row 1 (East from (0,0): accepted, one of six moves, no treasure).
4. **Make a comment actionable:** location, concern, consequence, verification. Check whether a partner's
   verification for demonstration A would reject the wrong flag.

## Lab challenge: review the proposed correction (45 minutes)

1. **Establish the record — 5 min.** Copy the blank template to your own working document. Identify candidate
   C, the known-defective baseline and the evidence inspected. Separate the candidate's claims from
   observations.
2. **Bound the correction — 8 min.** State which differences the request allows and which rules remain
   authoritative. Explain why blanket old-snapshot equality and blanket expected-value updates are both
   insufficient.
3. **Classify a trace — 10 min.** Inspect or request a complete sequence containing a rejection followed by
   accepted progress. Cite a justified baseline mismatch and a later mismatch or concern; explain each through
   the request and action-specific evidence, including position, collection, score and status where relevant.
   Label predictions until replayed.
4. **Annotate and specify verification — 10 min.** Two comments with location, concern, consequence and
   concrete verification. Interpret the actual tool report without promoting its scope into game correctness.
   Propose a check that rejects baseline and candidate while permitting the intended correction, with
   expectations independent of the candidate's arithmetic.
5. **Decide and peer-review — 7 min.** State your verdict and any evidence still required; a partner
   reconstructs the verdict from your cited observations and the request.
6. **Submit — 5 min.** Check the rubric, save the review, keep the packet unchanged, include the evidence index
   and mark pending checks.

## Acceptance criteria

Your review records the patch, request and evidence; contains an allowed-difference statement; classifies a
justified baseline mismatch and a later regression with cited rows; has two four-field annotations with
severity; interprets the tool report within its scope; proposes a distinguishing verification; and ends with
a verdict that follows from the evidence. See [`rubric.md`](rubric.md).

## Knowledge check (approximately 8–10 minutes)

1. The supplied ordinary lint command reports zero errors, one complexity warning and exit 0. No behaviour
   tests are part of that command. What does this establish? A) Every game rule is correct because the process
   succeeded. B) There were no error-level findings under the configured rules; the warning and behavioural
   obligations still need interpretation. C) The function has no complexity finding. D) A warning proves that
   the game returns an incorrect score.
2. In a separate routine, `const receipt = commitResult();` is followed by no read of `receipt`. The contract
   requires one call to `commitResult()` before returning; that call records the result and returns a receipt
   the caller may ignore. Lint flags the unread binding. The proposed cleanup deletes the whole statement.
   Which review response satisfies both obligations? A) Approve deletion because unread bindings never have
   effects. B) Keep the unused binding forever. C) Request removal of the unused binding while preserving
   exactly one required call, then verify both the recorded effect and lint result. D) Call the service twice.
3. A packet supplies deterministic observations: old version with a cold cache takes 10 ms; new version with a
   warm cache takes 5 ms. No other trials exist. The author claims the change caused a twofold speed
   improvement. Which feedback is justified? A) The observed ratio is two, but version and cache condition both
   changed; request matched cache conditions and a repeatable comparison before attributing the improvement to
   the code. B) The ratio proves the code caused the improvement. C) A lint pass would establish the cause.
   D) Change the feature's expected outputs so performance no longer needs checking.
4. A separate event contract requires move before treasure. A candidate emits `['treasure', 'move']`. Its new
   test sorts copies of actual and expected arrays, then compares them; it passes. Inputs are not mutated.
   Which review decision follows? A) Approve because copying makes every comparison valid. B) Approve because
   both event names exist. C) Require in-place sorting. D) Request a comparison preserving the required
   sequence; the sorted test erases the ordering difference the contract requires it to detect.

## Recovery

Before restarting, preserve your current review with Save As under a distinct name, such as
`review-attempt-1.md`, verify that it contains your annotations, and do not overwrite it. Then open a fresh
copy of the blank template. If a required file is missing, stop and locate it before replacing anything. Use
Hint 1, Hint 2, then Hint 3 only as needed, and record the next operation you performed yourself.

## Optional refinement

Refine one existing comment: replace a vague location with a specific expression, label an optional
suggestion, or make the verification easier to reproduce. Do not add a feature or change the acceptance promise.
