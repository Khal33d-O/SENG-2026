# W2.02 Lab: Calculate a state preview

**Session:** W2.02 Values, objects and control flow · **Week 2: TypeScript Programming**

## Purpose and deliverable

A small game panel previews a batch of score-bearing actions. The before-state remains visible beside
the preview, so calculating the preview must preserve the object retained by the earlier observer.
Write the typed calculation and explain its values through both references.

This is a learning model of score and remaining actions, not the complete treasure-hunt rule engine.
It has no movement, collisions or random outcomes. Submit `starter/src/calculate.ts` and your completed
[`evidence.md`](evidence.md). Function definitions, collections and browser rendering are supplied
support; your work uses a flat object, conditions and a counted loop.

## Outcomes

1. **Describe** primitive values, object literals, property access and inferred types.
2. **Explain** how conditions and loops express decisions over a typed state object.
3. **Write** typed calculations using variables, operators, conditions and loops.
4. **Annotate** the effect of updating a property or replacing the current state object.

## Timing

| Block | Minutes |
|---|---|
| Guided practice: baseline, packing loop, two-reference trace | 15 |
| Challenge: Task 1 (8), Task 2 (12), Task 3 (15), Task 4 (10) | 45 |
| Quiz, individual check and paper transfer | 15 |
| Feedback, saving and recovery | 10 |

## What is supplied and what you own

| File | Role |
|---|---|
| [`starter/src/calculate.ts`](starter/src/calculate.ts) | **You own the statements between the BODY markers.** Keep the exported wrapper line, parameter names, types and `return state;` |
| `starter/cases.mjs` | Public cases with expected outcomes (read only) |
| `starter/tools/show.mjs` | `npm run show [-- <case>]` runner: original, preview, expected, identity |
| `starter/src/demo-object.ts`, `starter/src/demo-boundary.ts` | Worked Examples 1 and 2 |
| `starter/src/practice.ts` | Guided packing calculation |
| `starter/tests/`, `starter/index.html`, `starter/report/`, `starter/tools/serve.mjs` | Baseline and case tests, the browser report (port 4302) and its check |

## Setup

Begin in this lab directory, containing this README, `evidence.md` and `starter`. Open the editor
terminal here. `pwd` prints your location; `ls` lists files; `cd starter` enters the supplied project.
The prepared environment provides Node.js 22.23.2/npm 10.9.8. The package pins TypeScript 5.9.3 and
Playwright 1.61.0. These are the tested versions, not a claim that they are newest.

```bash
pwd
ls
cd starter
node --version
npm ci
npm exec tsc -- --version
npm run check:baseline
npm test
```

`npm ci` installs locked tools using the prepared cache or registry. If access fails, ask for the
prepared local copy rather than changing versions. **The baseline should pass before edits (2 tests).
Full tests intentionally fail** because the starter returns its input without implementing the
preview: on the unchanged starter `npm test` reports 9 passed and 12 failed (every identity check,
and the field checks of every case that requests permitted work). Retain those failures as your
starting observation; reinstalling cannot complete the calculation.

Run `npm run demo:object`, `npm run demo:boundary` and `npm run practice` during guided practice. Each
command builds before running. First attempts and individual evidence use supplied material,
documentation and human/access support without generated answers.

## Concepts in code

These are the session's examples; runnable copies are in [`../../examples/w2-02/`](../../examples/w2-02/).

```ts
let attempts: number = 3;
const label: string = "3";
let ready: boolean = false;
console.log(attempts + 1, label + "1", ready);
```

```ts
let remaining = 3;
remaining = 2;
console.log(remaining);
```

```ts
let state = { score: 4, actionsRemaining: 2, completed: false };
console.log(state.score);
state.score = state.score + 3;
console.log(state.score);
```

```ts
let state: {
  score: number; actionsRemaining: number; completed: boolean;
} = {
  score: 4, actionsRemaining: 2, completed: false
};
console.log(state.actionsRemaining);
```

Worked Example 1 (`npm run demo:object`):

```ts
const tokenState = { label: "North gate", score: 4, active: true };
const earlierScore = tokenState.score;
tokenState.score = tokenState.score + 3;
console.log(tokenState.label, tokenState.score, tokenState.active);
console.log(earlierScore);
```

Conditions and loops:

```ts
const temperature = 18;
let message = "Heating off";
if (temperature < 20) {
  message = "Heating on";
} else {
  message = "Heating off";
}
console.log(message);
```

```ts
const temperature = 18;
const occupied = true;
const needsHeat = temperature < 20 && occupied;
console.log(needsHeat);
```

```ts
let total = 0;
for (let count = 0; count < 3; count = count + 1) {
  total = total + 2;
}
console.log(total);
```

| Counter before condition | `count < 3` | Total after body | Counter after update |
|---|---|---|---|
| 0 | true | 2 | 1 |
| 1 | true | 4 | 2 |
| 2 | true | 6 | 3 |
| 3 | false | No body; remains 6 | No update |

Worked Example 2 (`npm run demo:boundary`, which also runs the same update from two actions):

```ts
const state = { score: 4, actionsRemaining: 0 };
if (state.actionsRemaining > 0) {
  state.score = state.score + 2;
  state.actionsRemaining = state.actionsRemaining - 1;
}
console.log(state.score, state.actionsRemaining);
```

Updating a property versus replacing a reference:

```ts
let ticket = { label: "North", checked: false };
const displayTicket = ticket;
ticket.checked = true;
console.log(displayTicket.checked, ticket === displayTicket);
```

```ts
let ticket = { label: "North", checked: false };
const displayTicket = ticket;
ticket = { label: "South", checked: true };
console.log(ticket.label, displayTicket.label);
console.log(ticket === displayTicket);
```

## Guided practice (15 minutes)

1. **Establish the supplied baseline.** Run the setup commands; record actual versions in
   `evidence.md`. Run both demos and identify the statement producing one property in each output.
2. **Trace a different quantity.** `src/practice.ts` contains an independent packing calculation.
   Predict its total and first false comparison, then run `npm run practice`. Change the fixed bound
   from three to one and zero, rebuilding through that command each time. Restore three afterwards.

   ```ts
   let packed = 0;
   for (let box = 0; box < 3; box = box + 1) {
     packed = packed + 4;
   }
   console.log(packed);
   ```

3. **Check the identity claim** on paper: `let current = { count: 2 }; const previous = current;`, then
   `current.count = 5;`, then `current = { count: 8 };`. Read both names after each step.
   *Activity: Share* — annotate the statement changing the shared object and the statement changing
   only one reference. Which earlier value can `previous` no longer recover?

## Inputs and observable contract

The supplied wrapper receives `initial` with numeric `score`, numeric `actionsRemaining` and Boolean
`completed`. It also receives numeric `requested` and `points`. Fixture counts are whole numbers from
zero through six, points are one through five, and initial scores are small non-negative integers.
Initial completion agrees with zero capacity. You do not parse or repair external data.

* Each permitted action adds `points` to the score and consumes one action. Process as many requested
  actions as capacity permits. Never spend below zero, score an unpermitted action or discard a
  permitted last action.
* Final completion is true exactly when no capacity remains. Zero requested work can leave capacity
  available, so an empty request and a completed state are different claims.
* Return a fresh object on every call, including zero work. The original object and any reference
  already held to it must retain their properties.

All expected cases are public in `cases.mjs`: `zero-request`, `zero-capacity`, `one`, `multiple`,
`exact-capacity`, `over-request` and `last-action`. Read them without modifying their expected
outcomes or the runner.

## Lab challenge

### Task 1: Declare state and predict the observers (8 minutes)

Open `src/calculate.ts`. Preserve the supplied exported wrapper, parameter names and return line.
Replace the marked body's initial declaration with a flat object declaration whose property types are
explicit. Decide which values initialize it and whether your declaration constructs an object or
retains a reference. No interface, union, collection or additional function is needed.

Before running edited code, predict `zero-request` and `one` in `evidence.md`. Include original values
after the call and the identity comparison. Explain whether reading `initial.score` has the same effect
as assigning `initial` to another variable. Draw the names and objects each reaches. Run
`npm run build`. The pristine starter has `let state = initial;` with no calculation.

### Task 2: Choose the guard and update order (12 minutes)

Write a counted loop and conditions inside the marked body. Choose which values each comparison reads
and which statements follow a permitted iteration. Explain whether every bound remains fixed or
changes as capacity is consumed. The completion output must agree with final capacity. Trace
`multiple`, recording the comparison, score and capacity for each body execution. Run `npm test` and
retain the first failed case. If tests pass, inspect `npm run show -- multiple`.

### Task 3: Defend changed inputs and identity (15 minutes)

Exchange operator and reviewer roles. Before running `over-request` and `exact-capacity`, each learner
predicts the last permitted update and rejects a plausible guard which stops too early or late.
Consider this candidate without adopting it: a counter starts at zero, its loop checks
`count < state.actionsRemaining`, and its body decreases `state.actionsRemaining`. For four actions and
four requests, write the operands of the second and third comparisons. Decide whether this represents
the contract, then implement your chosen approach.

Run `npm run show -- over-request`, `npm run show -- exact-capacity` and `npm test`. Inspect the
original object as well as the preview. Retain a reference trace showing why mutation followed by
replacement cannot recover the required before-state.

### Task 4: Diagnose, verify and record evidence (10 minutes)

Choose a plausible boundary or mutation error your implementation avoids (an inclusive bound,
shrinking bound or shared-object mutation). State a concrete input exposing its first wrong
observation before running. You may demonstrate it in a saved scratch copy.

Run full tests after corrections. Start the report with `npm start`, open http://127.0.0.1:4302 and
compare original, preview and identity columns. Reload after a rebuild. Press Ctrl+C in the terminal
running `npm start` and wait for the prompt before running `npm run check:browser` (it starts and
stops its own server on the same port; it needs Chromium: `npx playwright install chromium`).

## Acceptance criteria

- [ ] Explicit state types describe numeric score/capacity and Boolean completion.
- [ ] Zero request and zero capacity perform no score-bearing action.
- [ ] One, multiple, exact-capacity and over-request cases match every expected field.
- [ ] Completion agrees with final capacity, including empty inputs.
- [ ] Original values are preserved and every return has fresh identity.
- [ ] I predict a changed boundary and explain why a plausible guard or order fails.
- [ ] My reference trace, actual commands, assistance and next revisit are saved.

## Hints

**Hint 1: Locate the first disagreement.** Name the first failing case and field. Trace operands
immediately before each comparison. Keep requested workload separate from remaining capacity; one can
stay fixed while the other changes.

**Hint 2: Follow each reference.** Draw the original observer before calculation. At each property
write, mark every name reaching that object. A literal constructs an object; assigning an existing
reference does not.

**Hint 3: Inspect the last permitted action.** Use one available action and several requested actions
(`last-action`). Record capacity authorising the action and capacity afterward. Check completion and a
zero request separately.

## Individual evidence and transfer

Use the individual section of `evidence.md`. The instructor supplies a boundary input after your pair
finishes. Predict the returned score, remaining actions and completion flag, the original properties
and whether the returned reference is the same object. Run the case and compare every prediction with
its observation.

*Transfer (paper only):* a service desk previews equipment checks. Its record holds `completedChecks`
and `slotsRemaining`; a retained reference displays the before-state beside the preview. Four checks are
requested, but one slot remains. Predict both displayed records and describe an implementation that
corrupts the before-state despite showing a plausible preview total.

## Knowledge check (about 8 minutes, self-check)

1. A teammate declares `let remaining = 3;` and later writes `remaining = "2";`. The build rejects that
   assignment. Which explanation supports the smallest suitable correction?
2. A printer must perform exactly the requested number of operations, including none for zero. A
   counter starts at zero and increases by one after each body. Which condition represents that
   requirement when requested is a fixed non-negative count?
3. A printer permits two requested jobs and starts with two sheets. Each permitted job must increase
   printed by one. What does this code produce, and which change makes the last permitted job count?

   ```ts
   let sheets = 2;
   let printed = 0;
   for (let count = 0; count < 2; count = count + 1) {
     if (sheets > 0) {
       sheets = sheets - 1;
       if (sheets > 0) printed = printed + 1;
     }
   }
   ```

4. A display keeps `const held = current;`. Code then assigns `current.score = 8;` and finally replaces
   `current` with a new object whose score is nine. What will `held.score` observe, and why?
5. A preview receives zero requested actions and two available actions. Its returned fields equal the
   input fields, and `result === initial` is true. The contract requires a separate preview object and
   completion only at zero capacity. Which assessment is justified?

## Recovery, access and teardown

Save `src/calculate.ts` to a new file outside `src` before recovery. The instructor's typed-declaration
checkpoint leaves the repeated update, guard and completion decisions unfinished. Label checkpoint
assistance and name the next decision you will make yourself.

Text output and reference diagrams can be read aloud or annotated. The report table has labelled
columns, visible focus and horizontal scrolling at large text sizes. Stop the server with Ctrl+C. Keep
source and evidence; record a specific W2.03 retrieval revisit and distinguish an environment block
from a calculation still needing explanation.
