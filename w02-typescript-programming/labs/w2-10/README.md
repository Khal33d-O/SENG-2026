# W2.10 Lab: Prepare a playable slice and its acceptance evidence

**Session:** W2.10 Project preparation: acceptance criteria and build plan · **Week 2: TypeScript Programming**
(180-minute planning session before Project 2)

Refine the existing game brief into a minimum playable slice, a short build plan and executable acceptance
examples. The supplied reference comparison keeps implementation small while you reason about connected
work, estimates and evidence. Keep your chosen genre in the document; the reference runtime does not claim
to implement every alternative.

## Outcomes

1. **Describe** the chosen game's minimum playable slice using the brief introduced before implementation.
2. **Design** a short build plan around familiar state, rules, input, rendering and API boundaries.
3. **Write** executable acceptance examples for starting, taking an action, recording progress and finishing the game.
4. **Explain** how tests and one observed application event will verify the completed slice.

## Timing

One 70-minute challenge: Task 1 (15, including the one-minute introduction), Task 2 (16), Task 3 (16),
Task 4 (16), Task 5 (7). The knowledge check (four questions, 10 minutes) follows in the recap.

## Setup and supplied boundaries

Use the prepared Node 22.23.2, npm 10.9.8, TypeScript 5.9.3, Python/Playwright 1.61.0, Chromium and .NET SDK
10.0.401 environment. The package uses the already prepared compiler and browser. (On a machine without the
prepared compiler, run `npm ci` once inside `starter` to install the pinned TypeScript 5.9.3.) Open a
terminal in this lab:

```bash
cd starter
npm run build
npm test
node --test tests/range.test.mjs
npm run plan
```

Build compiles the TypeScript. **Test runs twelve existing rule checks and five isolated reference acceptance
examples (17 pass).** The range command runs its five complete examples. **Plan initially fails because the
completion witness is empty** — an expected assertion, different from a missing tool or compile failure.

Start the owned local API, web server and collector:

```bash
python3 tools/serve.py
```

(Windows: `python tools/serve.py`.) Open the printed OPEN URL (default http://127.0.0.1:4181/, `PORT`
overrides) to load and validate your current `plan.json`. Its cost and enhancement choices appear above the
controls. Add `?plan=A`, `?plan=B` or `?plan=C` for an explicit supplied comparison; these queries do not
modify `plan.json`. Use `?plan=B` for the complete demonstration. A malformed or unsupported selected plan
displays an error and starts no session. Use a fresh page for each public-start comparison and reload after
editing `plan.json`. Wait for Reference API verified. Stop with Ctrl+C; save event text first because the
collector keeps only process memory.

The reference API route is `GET /api/boards/reference` (the supplied .NET project in `api/ReferenceApi`;
`serve.py` builds and starts it, or serves the same file with a printed note if the SDK is missing). The
supplied check requires the exact known wire definition, including `initialMoves` six; the local rule uses
`initialMoveBudget` six. The target range uses its supplied local ammunition model. The local event view proves
no BP or Grafana connection.

**Editable outputs:** [`document/template.md`](document/template.md), [`starter/plan.json`](starter/plan.json)
and [`starter/src/acceptance.ts`](starter/src/acceptance.ts). Rules, planning prototypes (`src/plans.ts`),
tests, browser controls and service machinery stay supplied.

## Concepts and worked examples

Given, When, Then as ordinary executable work (no Cucumber installation):

```ts
const before = initialState(); // Given
const after = applyMove(before, 'east'); // When
assert.equal(after.movesRemaining, 5); // Then
```

**Worked Example 1: check the reference start and action** — run `npm test` and read the five named acceptance
examples in `tests/acceptance.test.mjs` beside the twelve rule checks. Start `python3 tools/serve.py`, open the
URL with `?plan=B`, wait for Reference API verified, choose East (one,zero; five moves) then South (the wall:
state preserved, still an attributed event). *Continued:* East, South, South collects t1 (score ten) and reaches
the exit at two,two with two moves remaining, status won. One further action leaves the state unchanged.

**Worked Example 2: map a target range** — `node --test tests/range.test.mjs` (start, miss, hit progress,
completion, no-ammunition rejection). In the Target range panel use Hit, Miss, Hit: ammunition two to one to
zero, score zero to one, then complete; the final Hit preserves the completed state.

*Activity: Predict* (retrieval) — a rule test passes from a prepared state, while the application cannot reach
that state through its public controls: what has the test established? *Activity: Discuss* — a report lists
five passing acceptance categories and concludes the browser's build plan is complete: which setup or
connection would you ask to see? *Activity: Predict* (guided) — could South from the initial position
establish wall rejection?

## Proposal contract

All proposals retain four labelled direction buttons, basic state text, the same local rule and the same five
isolated reference examples. Item labels add a collected-item text label; keyboard adds arrow-key input. Those
enhancements are optional here because the required accessible controls remain labelled buttons.

| Work | Estimate units | Output |
|---|---|---|
| Panel-record handoff | 1 | Retains position, score, moves and status for the next call; identity list is empty |
| Session-record handoff | 3 | Retains the complete returned state for the next call |
| Completion connection | 1 | Runs the supplied finish rule through the session |
| Acceptance and event connection | 2 | Runs the supplied checks and local recording path |
| Item labels | 2 | Adds readable collected-item labels |
| Keyboard | 2 | Adds arrow-key input |

The fixed budget is eight units — planning estimates, not measured time. A includes panel-record plus both
enhancements. B includes session-record plus item labels. C includes session-record plus keyboard. Every
proposal totals eight; other supported combinations may also fit. Inspect `src/plans.ts` rather than treating
the table as a claim of tested completion.

## Guided practice

1. **Write one invalid-action example.** Given the public start followed by East, When South, Then position,
   moves, score, collected identities and status remain unchanged, still playing. In `src/acceptance.ts`,
   `invalidExample.prefix` holds the actions leading to the setup and `action` is the operation assessed.
2. **Map your own four promises** in [`document/template.md`](document/template.md), plus the invalid-action
   row; mark each executable now / supplied demonstration evidence / planned verification.
3. **Name task outputs** for your slice: boundary, concrete output, dependency, check.
4. **Prepare the comparison record:** read `src/plans.ts`; predict two feasible proposals before running them.
5. **Confirm the environment and baseline** with the setup commands above.

## Lab challenge

### Task 1: state the promise and predict a comparison (15 minutes)

Complete the existing-brief and five acceptance rows in the template. Keep the original chosen-game contract
and mark unresolved questions. Before using hints or running composed checks, choose two feasible proposals
and write their predicted public-start results. Explain why the isolated evidence can support both, and
declare the case that could distinguish them.

### Task 2: compare the connected experience (16 minutes)

Preserve `npm test` results. From fresh pages run the same completion promise through both selected proposals.
Keep the initial state, intermediate progress and final state, with current run IDs and matching event rows. Do
not stop at the first score increase. Trace the fact required at completion to its producing and retaining
tasks. Explain how an isolated finish test can pass from its prepared setup even when the public path fails.

### Task 3: choose a feasible cut and plan your own slice (16 minutes)

Select or revise `plan.json` using the supported `handoff` and `enhancements` fields. Keep the estimate within
eight and preserve the fixed acceptance promise. Explain the required dependency, the optional work deferred and
another valid cut if one exists. Do not alter rules or assertions to manufacture success. Apply the same
dependency discipline to your chosen-game task table.

### Task 4: execute examples and retain an event (16 minutes)

Complete `completionActions` and `invalidExample` in `src/acceptance.ts`. The completion sequence starts from the
public start; the invalid example uses its prefix to reach a playing state before the rejected action. Rebuild
and run `npm run plan`; read and save the trace as well as the result. Open the base URL without a plan query
(or the Selected plan.json link) in a fresh page, confirm the displayed estimate and enhancements, and match one
actual event's run, sequence, action and before/after values with the page. Save the row before teardown.

### Task 5: verify and explain (7 minutes)

Run the unchanged suites after the final edits. Review the rubric with a partner and preserve the failed
comparison, successful trace, selected plan and document.

## Acceptance criteria

- [ ] The chosen brief and fixed completion promise remain explicit.
- [ ] Two feasible plans share isolated evidence and have a recorded public-start comparison.
- [ ] The required dependency is connected to a justified budget cut.
- [ ] Completion and invalid-action examples execute without weakened assertions.
- [ ] An attributed local event is compared with the visible result.
- [ ] Each learner supplies a slice and invalid-action explanation with support recorded.

More than one plan can pass. A copied route, field name or screenshot alone does not justify the planning decision.

## Three-stage hints

**Hint 1: follow the promised path.** Keep the required finish beside each task output. Ask which facts the
finish needs and whether a preceding planned task produces and preserves them.

**Hint 2: compare cost with dependency.** Inspect both handoff outputs and the optional enhancements. Draw a
line from the progress-producing task to the next action's state input.

**Hint 3: perform a partial plan check.** After building, run from `starter` (Git Bash; one line):

```bash
node --input-type=module -e "import {estimate,proposals} from './dist/plans.js'; console.log(estimate(proposals.A));"
```

It prints A's estimate (8). The command neither selects a plan nor establishes completion.

## Individual evidence and transfer

Give an individual explanation of your minimum playable slice and one invalid-action acceptance example: the
starting state, operation and unchanged or rejected outcome promised by your brief, and the evidence that would
fail if the promise were broken. Use [`evidence.md`](evidence.md) and the template. *Transfer:* a booking
application's confirmation test passes from a prepared reservation, but the public form never retains the
selected slot — outline the task outputs that carry the selection into confirmation and display, and a visual
enhancement you could defer.

## Knowledge check (10 minutes, four questions)

1. An example is named *Then progress is recorded*, but its body only calls the action. Which addition
   establishes the named result?
2. Two workers; setup three days; then input (four days) and rendering (five days) concurrently; a two-day
   integration needs both. Is a ten-day window feasible?
3. A quest may start with a red or a blue key; the slice promises every allowed variant can finish; blue cannot.
   A random script chose red and passed. Which conclusion follows?
4. A slice promises confirmation within two seconds; a trace shows three seconds; a retrying visibility
   assertion with a five-second timeout passes. What should the report say?

## Recovery, support and teardown

Before a checkpoint, ensure the template contains your attempt and evidence. From `starter` run:

```bash
python3 tools/recover.py
```

It first requires `plan.json`, `src/acceptance.ts` and `../document/template.md`; then creates a distinct
`../attempts/attempt-...` directory containing all three. Only after preservation does it copy the syntax
checkpoint ([`checkpoint/acceptance.ts`](checkpoint/acceptance.ts)). Missing evidence stops before overwrite.
The checkpoint supplies an invalid-example syntax floor and leaves completion and plan choice unresolved.

Save event rows before Ctrl+C. Generated `dist` and the API's `bin`/`obj` can be recreated; retain source,
plan, template and attempts.
