# W2.07 Lab: Build trustworthy regression evidence

**Session:** W2.07 Unit tests and regression debugging · **Week 2: TypeScript Programming**

Turn the observed threshold defect into a failing unit test, correct it and retain a boundary check. The
complete demonstration gives the first repair; the required investigation asks why a later probe changes
its result when run alone, and whether its suggested production repair is justified.

## Outcomes

1. **Describe** a unit test's setup, action and assertion using a familiar rule function.
2. **Write** deterministic tests for normal, invalid and boundary actions.
3. **Debug** a seeded defect using its failing test and a targeted inspection of state.
4. **Create** a regression test that fails for the original defect and passes after the correction.

## Timing

One challenge lasts 45 minutes: introduction one minute, then Tasks 1–4 for 9/10/13/12 minutes. The
preceding 15 guided minutes establish the baseline and first normal test. Afterwards, eight quiz minutes,
four individual-evidence minutes and three transfer minutes share the debrief. The final ten minutes
remain available for preservation, support and rechecking.

## Setup: preserve the supplied starting point

Use the prepared Node.js 22.23.2, npm 10.9.8 and TypeScript 5.9.3 environment. The compiler must already
be available as `tsc` on PATH. There are no project dependencies to download; Node provides the test and
assertion modules. Begin in this lab directory, beside `starter/` and [`evidence.md`](evidence.md). Paste
the complete block. `mktemp -d` creates a unique working directory; each `&&` stops the following step
when the preceding command fails.

```bash
w207_work=$(mktemp -d "$HOME/w2-07-work.XXXXXX") &&
cp -R starter/. "$w207_work/" &&
cp evidence.md "$w207_work/evidence.md" &&
cd "$w207_work" &&
node --version &&
npm --version &&
tsc --version &&
npm run check:baseline
```

*If `tsc` is not on PATH* (a machine without the prepared environment): inside the working copy run
`npm ci` (installs the pinned TypeScript 5.9.3 from the lockfile) and use `npx tsc --version` instead;
the launcher prefers `node_modules/typescript` when it exists. Use Git Bash on Windows for the block above.

**Expect 13 baseline tests to pass** (twelve game-rule tests and the converted assertion). **`npm test`
intentionally fails before the work is complete:** the threshold regression detects a real defect, while
the three authored-test slots explicitly report unfinished work (on the unchanged starter: 14 pass,
5 fail). The launcher prints `BUILD PASS` only after current source compiles; a failed build runs no
tests and leaves no old emitted output.

The npm scripts are short names for `node check.mjs MODE`: `check:baseline`, `demo:bare`, `demo:named`,
`check:regression`, `inspect`, `check:mine`, `check:probe`, `check:focused`, `check:boundary`, `test`.
`make test` in the working package is an equivalent complete-check entry point.

## Supplied contracts and ownership

| File | Contract | Your action |
|---|---|---|
| [`src/costly.ts`](starter/src/costly.ts) | Select tiles whose cost is strictly greater than the caller's threshold | Make the bounded rule correction |
| [`tests/learner.test.mjs`](starter/tests/learner.test.mjs) | Three named callbacks for normal, invalid and boundary claims | Write setup, action and assertions |
| [`tests/probe.test.mjs`](starter/tests/probe.test.mjs) | Two claims requiring threshold two | Diagnose and repair setup without weakening either claim |
| `src/rules.ts` | Familiar movement evaluator and initial state | Use the supplied contract; preserve implementation |
| `fixtures.mjs` | Fresh p/q tiles and ordered ID extraction | Read and use |
| `tests/regression.test.mjs` | Complete demonstrated regression | Keep unchanged for comparison |
| `check.mjs`, `tools.mjs`, `checkpoints/` | Compilation, selection and preservation support | Run the documented modes |
| `evidence.md` | Your predictions, observations and assistance | Keep alongside the owned files |

The game evaluator receives a valid game state and a requested direction. Normal East from the initial
state returns accepted true, position (1,0), score zero, five moves, no treasure and playing status. An
unrecognised direction such as `up` returns accepted false and preserves every state field.
**Reason names:** this package uses the course's shared game contract (`GAME-CONTRACT.md`), so the
unrecognised-direction reason is `INVALID_ACTION` and wall/board-edge rejections are `WALL`/`EDGE`
(the book's text calls these `INVALID_REQUEST` and `ILLEGAL_ACTION`). Read the public game fixtures in
`tests/rules.test.mjs` for the remaining cases.

## Concepts and worked examples

Setup, action and assertion (Worked Example 1, `npm run demo:bare`):

```js
const tiles = demoTiles();
```

```js
const result = costly(tiles, 2);
```

```js
assert.deepEqual(ids(result), ['q']);
```

**Worked Example 1: move the familiar assertion into a named test** (`npm run demo:named`):

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { costly } from '../dist/conversion.js';
import { demoTiles, ids } from '../fixtures.mjs';
test('converted assertion: excludes equality', () => {
  const tiles = demoTiles();
  const result = costly(tiles, 2);
  assert.deepEqual(ids(result), ['q']);
});
```

**Worked Example 2: reproduce the seed and inspect its cause.** Run `npm run check:regression` against the
unchanged starter: "regression: equality is excluded at threshold two" fails with actual `p` and `q`.
*Activity: Predict* — which comparison would admit `p`, and which value should a targeted inspection
confirm? Run `npm run inspect`, read `src/costly.ts` (`tile.cost >= threshold`), change only `>=` to `>`,
and rerun the same named test. Captured output: [`../../examples/w2-07/demo-observations.md`](../../examples/w2-07/demo-observations.md).

| Check | Example observation | What it leaves uncertain |
|---|---|---|
| Accepted movement | East changes position and consumes one move | Rejection and completion behaviour |
| Invalid direction | Unknown direction rejects without field changes | Allowed moves still work |
| Threshold equality | Equal cost is excluded | Other caller-selected thresholds are respected |

## Guided practice

* *Activity: Type* — run the baseline, identify its two test files and point to the compiled import used by
  the conversion example.
* Reconstruct one named normal check in `tests/learner.test.mjs` (`initialState()`, `evaluateMove`), then
  `npm run check:mine`: your normal test can pass while the two unfinished tests still fail.
* Preserve and repeat the known regression (above). If the basic rule or build is still broken,
  `node tools.mjs checkpoint` saves all owned files and evidence before restoring only the demonstrated
  rule correction.

## Lab challenge

### Task 1: write the normal and invalid checks (9 minutes)

Finish `my normal action` and `my invalid action`, replacing their explicit unfinished assertions. Keep
those names. For the normal action, check accepted and the complete returned state. For the invalid
action, check rejection, the reason, returned fields and the retained input after the call (use
`snapshot`). Run `npm run check:mine`: the first two pass once completed, while the boundary slot remains
an explicit failure.

### Task 2: identify the source of the discrepancy (10 minutes)

Confirm that the demonstrated regression passes against your corrected `src/costly.ts`. Then run:

```bash
npm run check:probe
npm run check:focused
```

Record which callbacks execute in each run, predict the threshold received by the rule in each mode, then
check with the prepared trace (PowerShell: `$env:TRACE='1'; npm run check:probe; Remove-Item Env:TRACE`):

```bash
TRACE=1 npm run check:probe
TRACE=1 npm run check:focused
```

A teammate proposes replacing the rule predicate with `tile.cost > 2` because that makes the reported
boundary agree with the full run. Predict its effect on the demonstration and both probe modes, and state
which caller requirement it would abandon.

### Task 3: repair the evidence and choose a boundary (13 minutes)

Correct the probe so either named claim can run without relying on another test body. Preserve both names
and expected IDs; you may change declarations and setup within `tests/probe.test.mjs`. Complete
`my boundary regression` with a chosen threshold and tile collection whose expected IDs reject the original
inclusive predicate and the proposed fixed-two predicate, while passing with the caller-selected strict
predicate. Include an equality case and a higher cost. Run both probe modes again, then `npm run check:mine`.

### Task 4: prove the regression and restore the intended source (12 minutes)

Save your corrected work before installing the original seed:

```bash
node tools.mjs seed
npm run check:boundary
```

The first command prints a unique PRESERVED directory; copy that exact path into your notes. The second must
fail in your named boundary assertion. Restore using the printed path:

```bash
node tools.mjs restore BACKUP_DIRECTORY
npm run check:boundary
npm test
```

The unchanged boundary test should now pass, followed by **all 19 tests** in the full suite. To examine the
fixed-two proposal, preserve the current attempt with `node tools.mjs save` first.

## Acceptance criteria

- [ ] I identify setup, action and assertion in an executed named test.
- [ ] My normal and invalid action tests execute meaningful complete-state checks.
- [ ] The demonstrated seed has an actual named failure, inspected operands and bounded correction.
- [ ] I compare full and focused probe runs, identify their actual inputs and defend the correction's location.
- [ ] Both probe claims run independently without changing expectations or suppressing a test.
- [ ] My own boundary test rejects the original seed and fixed-two proposal with predicted, meaningful observations.
- [ ] The unchanged boundary test passes with the correction, and the final complete run executes all required tests.
- [ ] My evidence retains predictions, source/command identities, backups, individual explanation and assistance.

## Three progressive hints

**Hint 1: locate the unproved boundary.** Write down the rule's parameter value immediately before the
selected callback invokes it. Compare that actual value with the value named in the test's claim.

**Hint 2: expose the execution history.** Create two columns, complete file and focused boundary. List the
top-level assignments and the callback bodies that execute in each, and the threshold available at each
actual rule invocation.

**Hint 3: complete a test operation.** Replace the worksheet gaps before executing:

```text
test('my boundary regression', () => {
    const chosenThreshold = /* choose */;
    const tiles = /* choose your complete tile array */;
    const actual = costly(tiles, chosenThreshold);
    assert.deepEqual(ids(actual), /* predict IDs */);
});
```

## Individual evidence and transfer

Show that your regression test fails for the original defect and explain why the fix passes, using the same
test bytes for both runs; explain the probe discrepancy in your own words. *Transfer (paper):* a work-item
rule must reject another completion request on an already completed item without increasing its counter;
the rejection test fails alone, and its fixture may be prepared by a different test. Choose the first state
observation, a setup that lets the claim run independently, and the counter assertion a broadly accepting
repair would violate.

## Knowledge check (about 8 minutes)

1. A named test creates a fresh game state, calls the rule with East, then compares `result.state` with an
   explicit object. A reviewer says the descriptive test name already proves the expected movement. Which
   response identifies the executable claim?
2. A saved regression first asserts its fixture has status playing; against the old source it fails at that
   setup assertion because the fixture is won. A teammate records this as proof. What is the justified next step?
3. A separate rule increments `attempts` on every attempted action, including rejection, while a rejection
   preserves position and moves. From attempts 4, moves 6, which test follows this contract?
4. A callback starts `delayedCheck()` (which returns a promise) but returns `undefined`; the named test passes,
   then a later rejection fails the file. Which repair makes the named test's result include its check?
5. Full and focused runs disagree, but identical complete arguments reach the rule in both. A colleague
   recommends copying the previous investigation's repair. Which conclusion follows?

## Recovery, assistance and teardown

Keep `evidence.md` in the working directory: the preservation commands require all four owned files to be
readable before changing any source. `node tools.mjs checkpoint` preserves a new attempt and restores only
the completed demonstrated threshold rule; then `npm run check:regression` establishes that supported
point. Repeated recovery retains separate backups under `backups/`. Commands end at the prompt; no server is
started. Retain source, evidence and backups; you may remove only disposable `dist/` after saving.
