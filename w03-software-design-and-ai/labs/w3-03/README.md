# W3.03 · Specifications and test-driven development

**Duration:** about 120 minutes, including one 45-minute code challenge and an 8-minute knowledge check.

A specification describes behaviour that a caller can rely on. A test turns a selected part of that promise
into an executable comparison. The comparison becomes useful evidence when it can fail for a relevant wrong
result, and when the expected result has an authority independent of the code being checked.

## Outcomes

- Explain how a specification becomes observable acceptance criteria.
- Describe the failing-test, implementation and refactoring cycle.
- Write a failing test for a specified application feature or defect.
- Write and refactor an implementation that satisfies the test without changing unrelated behaviour.

## Supplied and owned

| Path | Role |
|---|---|
| `starter/tests/claim.test.mjs` | **You own** the two named claims `relation:` and `progress:` (start as `assert.fail` scaffolds) |
| `starter/src/rules.ts` | **You own** the bounded correction and refactor (starts as the pre-fix rule) |
| `starter/src/board.ts` | Supplied board facts |
| `starter/tests/support.mjs` | Supplied `runPath(actions)`: fresh state, each action in order, input-preservation check, final public state |
| `starter/regression.mjs` | Inherited four regression sequences (`npm run regression`, or `node regression.mjs demo-green`) |
| `starter/demo.mjs`, `starter/src/demo-red.ts`, `demo-green.ts`, `demo-refactor.ts` | Complete earlier teaching example (worked examples 1 and 2) |
| `starter/save-stage.mjs` | Stage capture: `node save-stage.mjs red|green|refactor` |
| `recover.py`, `recovery/rules.pre-fix.ts` | Recovery that preserves your attempt before restoring the pre-fix rule |
| [`evidence.md`](evidence.md), [`hints/`](hints/) | Evidence note template; staged hints |

The public operation is `evaluateMove(state, direction)`: it returns an acceptance flag, a state and a
reason for rejection (`'ILLEGAL_ACTION'` for a wall or the board edge in this teaching API).
`initialState()` supplies a fresh starting value. TypeScript source compiles into `dist`; the tests import
that emitted JavaScript. No browser, service, credentials or framework setup is needed.

## Setup

Make a working copy of this lab. In its `starter` directory, using Node 22.23.2 / npm 10.9.8:

```bash
npm ci
npm run build
npm test
```

The build passes before edits. Initially the two claim tests fail with explicit instructions to write them.
These scaffolding failures confirm that the test file executes; they are **not** the known defect's red
stage. Do not use `skip`, `todo`, `.only`, or a catch that suppresses the required failure.

## Retrieve and predict

The board starts at (0,0) with six moves. East is accepted and leaves five. South then attempts the wall at
(1,1). The Week 3 baseline rejects it but wrongly leaves four. **Predict:** would comparing the defective
implementation with an identical copy establish the intended wall rule? State what it would establish instead.

## Worked example 1: translate the wall promise

The requirement: a rejected wall action consumes no move and preserves the caller's state. The complete
runnable file is `starter/demo.mjs`:

```js
const state = code.evaluateMove(code.initialState(), 'east').state;
const before = structuredClone(state);
const result = code.evaluateMove(state, 'south');
assert.equal(result.accepted, false, 'wall action is rejected');
assert.deepEqual(result.state, before, 'wall rejection preserves public state');
assert.deepEqual(state, before, 'caller input is preserved');
```

From the lab's `starter` directory run:

```bash
npm ci
npm run demo:red
```

Compilation succeeds. The wall assertion fails because actual `movesRemaining` is four while the saved
expected state contains five; the message names state preservation and the command exits one. This is the
intended behavioural failure. Retain `demo-red.ts` as the pre-fix checkpoint. A captured run is in
[`captured-demo-output.md`](captured-demo-output.md).

## Worked example 2: make the bounded correction, then refactor

The baseline's blocked branch subtracts one from the move budget. The correction (`src/demo-green.ts`):

```ts
if (blocked) return {
  accepted: false, state, reason: 'ILLEGAL_ACTION'
};
```

Run `npm run demo:green`, then `node regression.mjs demo-green`: the inherited four sequences pass
(including repeated rejection, completion rejection and out-of-bounds rejection before progress).

The refactor (`src/demo-refactor.ts`) moves accepted-state construction into `acceptedMove(state, position)`
and returns a copied state for a blocked action:

```ts
if (blocked) return {
  accepted: false, state: structuredClone(state), reason: 'ILLEGAL_ACTION'
};
return acceptedMove(state, position);
```

Run `npm run demo:refactor`, then `node regression.mjs demo-refactor`. The tests observe public behaviour
across both allowed implementations; they do not require a helper name or an allocation strategy.

## Guided practice

**Distinguish three failures.**

| Observation | First failed obligation | Next action |
|---|---|---|
| Compiler cannot resolve an import | Executable setup | Restore the documented import and rebuild |
| Placeholder says to write a relation test | Authored check is missing | Replace the scaffold with your own assertion |
| Wall state has four instead of five | Specified returned value | Inspect the blocked branch |

*Discuss:* which row can be recorded as the known defect's red stage, and what evidence makes that defensible?

**Complete a familiar assertion.** In a temporary copy of `demo.mjs`, retain the setup and write the
returned-state assertion from memory:

```js
const before = structuredClone(state);
const result = code.evaluateMove(state, 'south');
// Complete the assertion about result.state and before.
```

**Compare related executions.** Reordering the input of a sort leaves the sorted output equal — and a
function returning an empty array would agree too. Equality does not establish content.

## Lab challenge: specify and correct the known state defect (45 minutes)

**The fixed specification.** The board has coordinates 0–2 on both axes, starts at (0,0), contains a wall at
(1,1), treasure t1 at (2,0), and an exit at (2,2). The initial move budget is six. An accepted move costs one,
and first collection of t1 adds ten points and records its ID once without granting moves. Winning at the
exit with t1 takes precedence over loss on the last move. Rejected actions preserve all state fields;
completed states reject later actions.

Write a relation comparing an accepted path with the same path containing one additional action that the
specification independently establishes is rejected. Their complete final public states must agree. Select a
non-initial insertion point, justify the attempted destination from board data, and retain accepted progress
after the insertion. Add an independent accepted-progress observation that establishes movement and the
unchanged cost of collecting treasure.

1. **Establish the comparison — 5 min.** Run the build; record the scaffold failures separately from red.
   Write the accepted path and insertion location in [`evidence.md`](evidence.md), traced from the board
   without using the evaluator to decide whether to compare.
2. **Author and observe red — 10 min.** Replace both scaffolds. Run `npm test` against the unchanged pre-fix
   rule; record the actual assertion mismatch, command and passing/failing named tests (one claim may
   already pass — record that accurately). Run `node save-stage.mjs red` from `starter`.
3. **Make the bounded correction — 12 min.** Correct the branch responsible for the rejected-action budget
   difference in `src/rules.ts`. Run `npm test` and `npm run regression`. Confirm the claim file is unchanged
   since red (save-stage reports this), then `node save-stage.mjs green`.
4. **Refactor and challenge the evidence — 10 min.** Refactor one coherent responsibility; rerun both
   commands against unchanged claims; `node save-stage.mjs refactor`. Ask the facilitator to replay your
   claims against the prepared wrong and valid variants.
5. **Explain and submit — 8 min.** A partner reconstructs the insertion precondition, red mismatch, bounded
   correction and unchanged refactor checks from your files. Submit the three stages, test, current rule and
   evidence note. Change the insertion point on paper and explain whether the equality is still justified.

## Acceptance criteria

- The two executions differ by one independently justified rejected insertion after progress, with accepted continuation.
- Equality compares every public state value; the separate progress check independently establishes movement and collection cost.
- Actual ordinary assertions expose the pre-fix defect and reject all four specified wrong variants (pre-fix budget defect, a repair limited to the starting position, a no-op evaluator, the W3.02 extra-allowance candidate) while permitting both valid implementations.
- Saved red, green and refactor stages retain the same authored claim bytes, with matching command observations.
- The bounded correction and refactor pass the four inherited regression sequences without changing unrelated rules.
- Each learner explains the test's authority and reassesses a changed insertion point; assistance is recorded separately.

## Hints

[Hint 1: locate the promise](hints/hint-1.md) · [Hint 2: inspect an intermediate position](hints/hint-2.md) ·
[Hint 3: start a path operation](hints/hint-3.md)

## Knowledge check (about 8 minutes)

1. A booking rule rejects a request when its seats exceed the remaining capacity. Rejection preserves the
   public booking state. A proposed test adds an extra request and expects the final state to stay equal, but
   does not establish whether the added request exceeds capacity. What must the author resolve first?
   A) Whether the implementation uses an early return. B) Whether the added request satisfies the stated
   rejection condition at its insertion point. C) Whether both result objects have the same identity.
   D) Whether the test name contains the word specification.
2. A test is supposed to expose a wrong move budget. Its first run stops because the imported file does not
   exist. A teammate records this as red and starts editing the budget calculation. Which next step gives the
   cycle useful evidence? A) Keep the missing import because any failure establishes the defect. B) Mark the
   test todo so the process can succeed before the fix. C) Restore the documented build/import path, rerun the
   test against the unchanged faulty rule and retain the actual budget assertion failure. D) Change the
   expected budget to match the old result before running the test.
3. Two distinct accepted records each contribute their quantity to a total. One test compares the total
   before and after reordering. A wrong implementation always returns zero and passes. Which additional
   assertion has an independent expectation? A) Compute expected by calling the same total function again.
   B) Given quantities three and four, assert that the returned total is seven, deriving seven from the stated
   additive contract. C) Compare the zero result with itself more times. D) Require a private accumulator named sum.
4. After a correction passes, a refactor extracts an accepted-state helper. Accepted moves cost one. A
   regression now reports five moves where its independently derived expectation is four. The author updates
   that expectation to five. Which review response is justified? A) Accept, because changing both code and
   expected values preserves their agreement. B) Accept, because helper extraction cannot change behaviour.
   C) Require removal of every helper. D) Retain the contractual expectation, inspect the refactor's changed
   calculation and rerun the same checks after correcting it.

## Recovery and teardown

Save your evidence note first. From this lab directory, `python3 recover.py` (Windows: `python recover.py`)
preserves the two owned files in a new sibling attempt directory, verifies the copies, then restores only
the pre-fix rule; it refuses replacement if a required file is missing. If `npm ci` or compilation fails,
record the command and first error and use the captured demonstration output while access is repaired;
mark that as written reasoning, not a new run. No server or background process runs. Keep your working copy
and stage captures.

## Optional depth

Investigate another admissible insertion in the same test and state whether it exposes a different
limitation before adding it. Bring one question to W3.04: what evidence should a bounded assisted
correction return before you trust its completion claim?
