# W2.04 Lab: Typed state and module boundaries

**Session:** W2.04 Typed state and module boundaries · **Week 2: TypeScript Programming**

Build a typed rule calculation that is called from a separate module. The ordinary ready/start and
playing/collect path is the guided floor. The required challenge introduces retry, a retained observer
and two caller paths. You must decide how to meet the new contract and choose evidence that can
distinguish two plausible shortcuts.

## Outcomes

1. **Describe** interfaces and simple union types as descriptions of application state and valid operations.
2. **Explain** a state transition using a concrete input, action and result.
3. **Write** typed state and action models for a bounded application interaction.
4. **Create** two modules that separate a rule calculation from its caller.

## Timing

The one challenge lasts 45 minutes: a one-minute briefing, then Tasks 1–4 in 10, 10, 12 and 12 minutes.
The earlier 15-minute guided practice (minutes 35–50) brings everyone to a callable ordinary transition.
The 15 minutes after the challenge include debrief, individual evidence (minutes 97–100), a paper
transfer and five quiz questions (minutes 102–110). The final ten minutes remain available for recovery.

## What you will produce

* `src/rule.ts`: required state interfaces, an action union and a transition calculation.
* `src/caller.ts`: two small caller functions that exchange typed arguments and results with the rule module.
* `my-cases.mjs`: two fresh diagnostic predictions, supported by [`evidence.md`](evidence.md).
* An individual before/action/after trace including the earlier object observed after the call.

There are two application modules in `src/`. The `demos/` directory contains separate teaching examples
(`demos/models.ts`, `demos/rule.ts`, `demos/caller.ts`, `demos/transition.ts`). The `.mjs` runner files in
`checks/` are supplied JavaScript assertions, not a third application layer to design. They import the
emitted JavaScript from `dist/src/`. You may inspect every public expected result in `cases.mjs`; there
are no hidden learner requirements. The ordinary-transition checkpoint is in
[`checkpoint/`](checkpoint/) (`rule.ts`, `caller.ts`).

## Setup and exact first run

Use the course Node.js 22.23.2 and TypeScript 5.9.3 environment. Open the folder containing this lab
brief, then enter its supplied starter:

```bash
cd starter
node --version
npm ci
npm run check:baseline
npm run demo:models
npm run demo:transition
```

Expected baseline: `PASS baseline: ready/start, ignored action and two callable imports`. The starter is
intentionally incomplete: the rule has no playing/collect branch and the two caller bodies return the
argument. **`npm test` initially fails an ordinary transition assertion** (on the unchanged starter:
19 pass, 14 fail — C05, C06, C07, C11 through each entry point, plus the entry-point summaries).
**`npm run practice` initially fails the expected completed object.** Preserve those named failures as
evidence of the starting point.

`npm ci` installs the locked compiler in this copied package. `npm run build` checks the source, then
emits JavaScript under `dist/src/` and `dist/demos/`. The explicit `.js` imports match the runtime files.
No server, browser, account or network service is needed after installation.

## Concepts in code

Runnable copies are in [`../../examples/w2-04/`](../../examples/w2-04/).

*Activity: Predict* — `after.progress`, `observer.progress` and whether `after === before`:

```ts
const before = { progress: 1 };
const observer = before;
function advance(input: { progress: number }) {
  return { progress: input.progress + 1 };
}
const after = advance(before);
```

```ts
interface Counter {
  label: string;
  value: number;
}
const counter: Counter = { label: "visits", value: 4 };
```

```ts
const wrong: Counter = { label: "visits" };
```

```ts
type SwitchAction = "enable" | "disable";
const requested: SwitchAction = "enable";
```

```ts
if (state.phase === "playing") {
  console.log(state.progress);
}
```

**Worked Example 1: Model three states and an action union** (`npm run demo:models`):

```ts
interface ReadyState {
  phase: "ready"; target: number; label: string;
}
interface PlayingState {
  phase: "playing"; target: number; label: string;
  progress: number;
}
interface CompleteState {
  phase: "complete"; target: number; label: string;
  finalScore: number;
}
type State = ReadyState | PlayingState | CompleteState;
type Action = "start" | "collect";
```

| Before | Action | Result |
|---|---|---|
| ready | start | playing, progress zero |
| playing below the last step | collect | playing, progress increases by one |
| playing at the last step | collect | complete, final score reaches target |
| any other pair in this demo | start or collect | the same input object |

Modules, imports and exports:

```ts
// rule.ts
export function twice(value: number): number {
  return value * 2;
}
// caller.ts
import { twice } from "./rule.js";
const result = twice(3);
```

```ts
import { transition } from "./rule.js";
import type { State, Action } from "./rule.js";
```

**Worked Example 2: Export, import and trace one transition** (`npm run demo:transition`):

```ts
export function callRule(state: State, action: Action): State {
  return transition(state, action);
}
```

Source `src/caller.ts` imports `"./rule.js"`; the emitted `dist/src/caller.js` still refers to
`"./rule.js"`, now beside `dist/src/rule.js`. The lab configuration uses `moduleResolution: "Bundler"`:
an extensionless relative import can compile, yet Node fails to find the emitted module. Preserve the
explicit `.js` imports.

## Guided floor before the challenge: 35–50

First add `finalScore: number;` to `CompleteState` in `src/rule.ts`. Read the complete ordinary
calculation in `demos/rule.ts`, and reconstruct its playing/collect branch after the starter's
ready/start branch. Preserve the final `return state` for ignored actions.

Then replace both `return state;` statements in `src/caller.ts` with `return transition(state, action);`.
Keep the supplied imports, signatures and function names. Run:

```bash
npm run build
npm run practice
```

Expected practice: a completed object with target two, label quiet and final score two, while the
original playing object still has progress one. The runner prints
`PASS guided floor: completed score returned across boundary; original retained.` Then inspect
`dist/src/caller.js`: the value import remains, while the type import and annotations have disappeared.

If the practice is still blocked at minute 50, preserve your current attempt before restoring the
ordinary floor. From `starter/`, paste this whole block. It creates a new backup directory every time,
including your current source, diagnostic cases and evidence. Each `&&` means the next step runs only
after the previous step succeeds:

```bash
attempt_dir=$(mktemp -d ../attempt-before-checkpoint.XXXXXX) &&
cp -R src "$attempt_dir/src" &&
cp my-cases.mjs ../evidence.md "$attempt_dir/" &&
printf 'Preserved attempt: %s\n' "$attempt_dir" &&
cp ../checkpoint/rule.ts src/rule.ts &&
cp ../checkpoint/caller.ts src/caller.ts &&
npm run practice
```

Record the printed backup directory and checkpoint support in `evidence.md`, then explain one returned
field yourself. The restored files contain start and collect only. They do not implement retry or fill
your diagnostic cases. (Run the block in Git Bash on Windows.)

## Outcome contract for the single challenge

The valid states use a positive integer target. Playing progress is an integer from zero up to target
minus one. Complete `finalScore` equals target. Label is caller-selected text and may be empty.

| Before/action | Required observation |
|---|---|
| ready/start | new playing object, progress zero; preserve target and label |
| playing/collect below the target | new playing object, progress increases by one |
| playing/collect reaching target | new complete object, `finalScore` equals target |
| complete/retry | new playing object, progress zero; preserve the caller's target and label |
| every other valid phase/action pair | return the exact original object; no property changes |

For every call, a retained reference to the before-state must still expose the original values. These
requirements apply to `transition`, `callRule` and `callFromReplay`.

## Lab challenge

### Task 1: Extend the model and predict (10 minutes)

Work individually for the first prediction, then compare with a partner. Record completed/retry and
playing/retry before/action/after traces in `evidence.md`, including the expected result/input identity.
Add `"retry"` to the exported `Action` union in `src/rule.ts`. Rebuild. Inspect your completed-state
interface: it must require numeric `finalScore` as well as the phase, target and label, and must not make
progress a required field of complete. *Observable check:* build passes and the new action belongs to
the typed contract. Explain why that alone cannot establish that retry behaves correctly.

### Task 2: Verify the existing boundary (10 minutes)

Run `npm run check:baseline` and `npm run practice`, then `npm test`. Read the first named assertion
that fails; record its before-state, action, expected and observed result. Classify it as a compile
problem, a runtime import problem or a behavioural mismatch before editing. Trace ready/start through
`callRule` and an ordinary playing/collect through `callFromReplay`. Do not edit `cases.mjs`.

### Task 3: Implement the new transition (12 minutes)

Implement retry while meeting every row of the outcome contract. Two teammates propose shortcuts.
**Proposal A** reuses a starting-state factory that always chooses target two and label quiet.
**Proposal B** makes the rule restart a round whenever it sees retry, while only `callRule` checks
whether the round is complete; `callFromReplay` calls the rule directly. Compare their possible
observations with the contract. *Observable check:* `npm test` passes the 11 public phase/action cases
across the direct rule and both callers (33 tests).

### Task 4: Defend fresh diagnostic cases (12 minutes)

Edit only the empty `decisions` array in `my-cases.mjs`. Use the record format in `cases.mjs`, adding a
`reason` string. Choose two cases that are not copies of its existing records. Each must name a rival
proposal, predict that proposal's result and explain how your expected result can distinguish it.

```bash
npm run check:mine
```

*Changed condition:* reconsider your Proposal A case if the caller's selected settings happen to equal
the factory defaults. Does the same observation still distinguish the implementations? Then explain
whether moving the same action to the direct rule entry changes what your Proposal B case can reveal.

## Three progressive hints

**Hint 1: Locate the boundary.** Write down the phase/action pair and the entry point. Distinguish an
action name being allowed by the type from that action changing this particular state.

**Hint 2: Inspect the intermediate values.** List the old phase, target, label and any per-round count.
Beside each, record whether the outcome contract requires retaining it, calculating a new value or
omitting it from a different state shape.

**Hint 3: Complete a partial diagnostic operation.** Use this incomplete record as a starting operation
for one case. Replace every placeholder before running:

```text
const chosen = { phase: 'complete', target: /* choose */, label: /* choose */, finalScore: /* choose */ };
const decision = {
    name: 'my distinguishing observation', before: chosen,
    action: 'retry', after: /* predict an object */,
    same: /* predict true or false */,
    reason: /* explain the rival result on this input */
};
```

## Acceptance criteria

- [ ] The three state interfaces and action union build with the required fields.
- [ ] Both caller functions return the rule result using the supplied module path.
- [ ] All public transitions preserve old values and meet result/identity expectations.
- [ ] Two fresh cases distinguish the stated rivals, with predictions made before execution.
- [ ] The changed-condition defence explains when an observation loses discrimination.
- [ ] Each learner retains an individual boundary trace, assistance record and next revisit.

## Individual evidence and transfer

Independently select one action from your saved work. State the argument values, name the imported
function, follow the return through the caller and identify the resulting state, including what the
retained input observer can still see. Record independent / human hint / ordinary checkpoint / not yet
demonstrated, and a next revisit.

*Transfer (paper):* a document can be draft or submitted; the caller displays a message, a function
decides whether an edit request may change the document, and a preview tool also calls that function.
Identify what the state type can describe and what needs a runtime decision, and choose an observation
that reveals the difference between blocking edits only in the main screen and applying the rule
through both callers.

## Knowledge check (about 8 minutes)

1. A completed export requires an interface with `phase: "complete"`, `target: number`, `label: string`
   and `finalScore: number`. A value provides all but `finalScore`. What does the interface establish?
2. A complete state has target three, label quiet and finalScore three. The correct rule receives it with
   retry. A caller checks that the original input is complete before inspecting the returned value. Which
   prediction and next check are justified?
3. A counter now completes only when a collect reaches its selected target. Before the action it is
   playing at progress two, target four. A shortcut completes every round on its third collect. Which
   result and observation address this changed requirement?
4. An emitted caller is in `dist/src/ui/caller.js`. It imports `origin` from `"./rule.js"` and prints
   legacy. Both `dist/src/ui/rule.js` (legacy) and `dist/src/rule.js` (approved) exist. Which source
   import and verification select the required module?
5. A playing input has progress one and target four. `first = callRule(input, "collect")`, then
   `second = callFromReplay(input, "collect")`. A new requirement says these two requests must
   accumulate in one round. What is observed now, and which change meets the requirement?

## Recovery and optional extension

Reserve minutes 110–120 for unresolved support. Start with the earliest barrier: `npm ci`, build,
import, practice, retry or weak diagnostic evidence. A type error is addressed in source; a missing
emitted file requires a successful build and correct `.js` import. Do not use a stale direct `node` run
to bypass a failed build. Optional extension (only when required work is secure): consider whether equal
values always justify equal object identity. Run `npm run clean` to remove `dist/` when finished.
