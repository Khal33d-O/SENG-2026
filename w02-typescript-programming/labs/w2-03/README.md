# W2.03 Lab: Select valid neighbouring positions

**Session:** W2.03 Functions, collections and simple checks · **Week 2: TypeScript Programming**

## Scenario and outcome

A game preview offers existing tiles that a piece could enter with one horizontal or vertical step. The
caller still owns the original tiles and the access Map. Your function returns an ordered selection; it
does not move the piece, spend a score or edit those inputs.

The supplied interface is `neighbours(tiles, from, board, access): Tile[]`. A tile qualifies when its
coordinates are inside the board, it is exactly one horizontal/vertical step from `from`, and its ID
has a stored access value of `true`. The current position and diagonal positions do not qualify. A
stored `false` or a missing key does not grant permission. Keep qualifying tiles in candidate-array
order, with their original object references inside a new result array.

All supplied coordinates are integers. Width and height are positive; the origin is within the board.
Tile IDs are unique. Candidates may lie outside the board. `cost` is retained data and is not an
eligibility rule in this request.

## Session outcomes

1. **Describe** typed function inputs, outputs, arrays and keyed collections.
2. **Explain** a simple callback by comparing it with an explicit loop.
3. **Write** a typed function that filters a collection against explicit constraints without changing
   unrelated state.
4. **Write** expected results for normal and boundary inputs and verify them using supplied assertions.

## Timing

Guided segment (minutes 35–40 include the Map edit), then the challenge: Task 1 (10), Task 2 (10),
Task 3 (12), Task 4 (12). Knowledge check at minutes 102–110; minutes 110–120 are reserved for
recovery and rechecking, with no compulsory homework.

## Setup and working copy

Use the prepared Node.js 22.23.2 and npm 10.9.8 environment. The package pins TypeScript 5.9.3 and its
lock file; no global TypeScript installation, browser or service is needed. If the environment is
unavailable, request the facilitator's prepared copy and use the printed prediction sheet.

From this lab directory in a terminal, copy the pristine starter into a new writable folder. `mktemp -d`
creates a uniquely named directory; `W2_TASK_DIR` remembers its path. `cp -R` copies the contents, and
`cd` makes that folder the current working directory. Each attempt receives a new folder so earlier
work remains intact.

```bash
W2_TASK_DIR="$(mktemp -d "$HOME/w2-03-attempt.XXXXXX")"
cp -R starter/. "$W2_TASK_DIR/"
cd "$W2_TASK_DIR"
node --version
npm --version
npm ci
npm run check:baseline
npm test
```

(PowerShell equivalent: `$W2_TASK_DIR = New-Item -ItemType Directory "$HOME\w2-03-attempt-$(Get-Random)"`,
`Copy-Item -Recurse starter\* $W2_TASK_DIR`, `Set-Location $W2_TASK_DIR`, then the same npm commands.)

**The baseline should pass (5 checks). The final command should initially fail on
`interior: exact ordered IDs`**, because the callable placeholder returns no tiles (on the unchanged
starter: 14 pass, 4 fail — interior, corner, upper-boundary, missing-permission). An intentional
assertion failure after a passing baseline is the expected starting state. Stop on an installation or
build error and fix that layer before treating it as a membership defect.

`npm run build` checks `src/` and emits `dist/`. `npm test` rebuilds and runs public assertions.
`make test` from the pristine lab root is a shorthand for testing its starter ([`Makefile`](Makefile));
use npm commands in your own working copy. Do not edit generated JavaScript in `dist/`.

## Supplied files and learner ownership

| Path | Role | Your work |
|---|---|---|
| [`src/neighbours.ts`](starter/src/neighbours.ts) | Typed function called by public tests | Implement its selection body |
| [`src/learner-checks.ts`](starter/src/learner-checks.ts) | Two expected-result inputs | Write your normal and boundary examples |
| [`src/practice.ts`](starter/src/practice.ts) | Earlier guided threshold exercise | Complete or use the marked checkpoint |
| [`practice.mjs`](starter/practice.mjs) | Guided threshold assertions and caption Map | Append only the two-line Map observation below after the final log; preserve supplied assertions |
| `src/model.ts`, `src/supplied.ts` | Named shapes, bounds, distance and ID helpers | Read contracts; keep implementations |
| `cases.mjs`, `tests/` | Public outcomes and supplied assertion runner | Inspect; keep acceptance checks intact |

| Supplied helper | Input | Output contract |
|---|---|---|
| `inside(tile, board)` | Tile and dimensions | Boolean; zero-based coordinates inside both dimensions |
| `stepDistance(a, b)` | Two positions | Sum of horizontal and vertical step counts |
| `ids(tiles)` | Tile array | String identifiers in the same order |

Other supplied files: `src/demo-loop.ts`, `src/demo-filter.ts` (Worked Examples, `npm run demo:loop`,
`npm run demo:filter`) and [`checkpoint/practice.ts`](starter/checkpoint/practice.ts).

## Concepts in code

Runnable copies of these examples are in [`../../examples/w2-03/`](../../examples/w2-03/).

```ts
const original = { score: 6 };
const observer = original;
original.score = 9;
```

```ts
function remaining(total: number, used: number): number {
  return total - used;
}
const available = remaining(8, 3);
```

```ts
function double(value: number): number {
  return value * 2;
}
const first = double(4);
const second = double(first);
```

```ts
const costs: number[] = [2, 5, 3];
const firstCost = costs[0];
const count = costs.length;
const selected: number[] = [];
selected.push(firstCost);
```

```ts
const captions = new Map<string, string>();
captions.set("amber", "Waiting");
captions.set("blue", "Ready");
captions.set("blue", "Held");
const label = captions.get("blue");
```

```ts
const flags = new Map<string, boolean>();
flags.set("archived", false);
const present = flags.has("archived");
const enabled = flags.get("archived") === true;
const absent = flags.get("unknown") === true;
```

**Worked Example 1: Inspect a tile collection with a loop** (`npm run demo:loop`):

```ts
function affordableLoop(tiles: Tile[], budget: number): Tile[] {
  const result: Tile[] = [];
  for (let i = 0; i < tiles.length; i += 1) {
    const tile = tiles[i];
    if (tile.cost <= budget) result.push(tile);
  }
  return result;
}
```

| Index | ID | Cost | `cost <= 3` | Result after visit |
|---|---|---|---|---|
| 0 | amber | 2 | true | amber |
| 1 | blue | 5 | false | amber |
| 2 | copper | 3 | true | amber, copper |

**Worked Example 2: Compare a callback with the loop** (`npm run demo:filter`):

```ts
function affordableFilter(tiles: Tile[], budget: number): Tile[] {
  return tiles.filter((tile: Tile): boolean => {
    return tile.cost <= budget;
  });
}
```

```ts
assert.deepEqual(ids(actual), ["amber", "copper"]);
assert.notEqual(actual, tiles);
assert.equal(actual[0], tiles[0]);
```

## Guided practice

1. **Build a callable threshold function.** Open `src/practice.ts` and complete `costly` so it returns
   tiles whose cost is strictly greater than `threshold`. *Activity: Build* — predict the IDs for costs
   two and four with threshold two, implement, run `npm run practice`, and explain the role of each
   return. Swap driver and observer before repeating with an empty input.
2. **Map edit in the existing guided practice.** Open `practice.mjs` in the same working folder. Its
   caption Map is separate from the challenge's access Map. After the final
   `console.log('PASS guided practice: strict threshold, empty, keyed replacement');` line, append
   these two lines:

   ```js
   captions.set('q', 'Paused');
   console.log(captions.get('q'), captions.has('r'), captions.size);
   ```

   Predict the three values, then run `npm run practice` again. The supplied assertions still pass,
   followed by `Paused false 2`: q's caption was replaced, r is absent and the Map still has two keys.
   Keep the existing Ready assertion before your appended operation.
3. **Read the supplied helper contracts** in `src/model.ts` and `src/supplied.ts`.
4. **Locate a failure before editing.** Run `npm run check:baseline` and `npm test`; record the first
   failing assertion and the actual IDs. Read the associated case in `cases.mjs`, including its access
   entries. Do not edit the fixture. If you need the completed guided function, copy
   `checkpoint/practice.ts` into the working `src/practice.ts` and mark checkpoint support.

## Lab challenge

### Task 1: Predict before editing (10 minutes)

Read the interior fixture in `cases.mjs` and the outcome contract above. In
[`evidence.md`](evidence.md), write the ordered IDs you expect, then explain one inclusion and each
exclusion. Use the actual coordinates and access value or absence. Candidate order controls returned
order; spatial proximity does not reorder the array.

### Task 2: Implement the function (10 minutes)

Edit the body of `neighbours` in `src/neighbours.ts`. Choose a familiar explicit loop or a typed filter
callback. Explain how your implementation combines the stated constraints and why the cost-selection
demo cannot meet this request unchanged. Return a new array, including when no candidates qualify.
Retain the qualifying tile objects; do not clone or modify them. Leave `tiles`, `from`, `board` and
`access` unchanged.

### Task 3: Diagnose against public checks (12 minutes)

Run `npm test`. The suite checks exact ordered IDs, repeated calls and unchanged inputs for the
interior, corner, upper-boundary, missing-permission, empty and no-valid cases. For a failure, record
its case name, expected IDs and actual IDs. Choose one candidate that explains the disagreement,
predict the effect of a correction, then rerun. If your implementation passes first time, make one
deliberate wrong comparison in a separate copy, predict a public failure, observe it and restore the
correct source (*Activity: Diagnose*). Swap pair roles before the diagnosis.

### Task 4: Choose a diagnostic changed input (12 minutes)

Your reviewer suggests this rival bounds rule: "For a board of width w, a tile with `x === w` is still
inside." Design a new normal example and a boundary example using a rectangular board other than the
public fixtures. Write their actual tile objects, origin, access entries and expected IDs in
`src/learner-checks.ts`. The normal example must retain at least one tile. The boundary example must
make the rival rule disagree with the correct rule while keeping every other eligibility condition
satisfied for the disputed tile.

A second reviewer proposes setting that disputed tile's access to `false` so the preview looks safer.
Decide whether that change strengthens or destroys your evidence of the off-by-one error by predicting
both implementations. Then swap the board's width and height on paper and decide whether your original
boundary example still distinguishes the two rules. Record your reasoning before running
`npm run check:mine`. A passing comparison alone does not prove that your example distinguishes the
rival rule.

## Acceptance criteria

- [ ] The function has typed inputs and a `Tile[]` output, and the build succeeds.
- [ ] Public cases return the exact ordered IDs for normal, corner, upper-boundary, empty and no-valid inputs.
- [ ] Missing permission differs from permission granted; no input object, array or Map is modified.
- [ ] The result is a new array containing the original retained tile references.
- [ ] My trace compares one callback inclusion decision with its explicit-loop equivalent.
- [ ] My own normal input retains a tile, and my boundary input separates the stated off-by-one alternative.
- [ ] I predict both rivals under the proposed permission change and changed dimensions, then defend
      what each comparison establishes, with support recorded.

## Three progressive hints

**Hint 1: Identify the decision boundary.** List what each helper tells you and what the Map tells you.
Check whether one fact can compensate for a failed condition under the contract. Use the candidate's ID
for lookup rather than its array index.

**Hint 2: Expose the intermediate state.** Pause the traversal at one candidate before adding anything
to the result. Write its coordinates, `inside` result, `stepDistance` result, stored access value and
the IDs already selected. Leave the next selection decision blank until you have checked the contract.

**Hint 3: Complete a fixture operation.** Use this partial operation to replace the matching
declarations in `src/learner-checks.ts`. The underscores are worksheet gaps, not runnable TypeScript.
Fill them with your chosen numeric coordinates and predicted string array before building:

```text
export const boundaryInput: Tile[] = [
    { id: 'probe', x: ___, y: ___, cost: 2 }
];
export const boundaryExpected: string[] = ___;
```

Choose the board, origin and access entry in the existing declarations yourself.

## Individual evidence and transfer

Without generated answers or a partner supplying the explanation, present your boundary input and
expected IDs. Name the off-by-one alternative, explain why it would disagree, then compare both
implementations under the proposed permission change. Identify the function inputs and output type,
then explain how one callback invocation corresponds to a loop decision.

*Transfer (paper):* a reporting function selects service tickets for a review list; the same ticket
objects also appear in the live queue, and the requester forbids editing their status during selection.
Explain why a callback that marks each selected ticket reviewed violates the request even if its
returned IDs are correct, and name a before-and-after assertion that would expose the violation.

## Knowledge check (about 8 minutes, self-check)

1. A colleague replaces `return total - used` with `console.log(total - used)` inside a function
   declared to return number. The caller still assigns its result to `available`. Which review comment
   identifies the problem?
2. A support dashboard stores a ticket's display caption in `Map<string, string>`. It sets key T7 to
   Waiting, then sets T7 to Ready. A second key T8 remains Held. Which result is correct for the new
   caption and the entry count?
3. A reporting request now keeps measurements strictly above `limit` and no greater than `ceiling`.
   Which callback implements the changed request while retaining the loop's candidate order?
4. A caller asks for a new array of selected records but wants the original selected objects and forbids
   changing record properties. Which combination of checks matches that contract?
5. A new export rule keeps readings from 0 through 10 inclusive. A proposed implementation uses
   `reading < 10`. You can add only one case; existing tests cover 0 and 5. Which expected result
   exposes the error?

## Evidence, support and recovery

Save `src/neighbours.ts`, `src/learner-checks.ts`, the named test observations and the completed
`evidence.md`. Oral explanation, a coordinate annotation or an accessible recording can carry the same
reasoning. No colour-only distinction or pointer precision is required.

If the guided function blocks progress, the facilitator can supply `checkpoint/practice.ts`. Preserve
your attempt before copying it into the working `src/practice.ts`. A full challenge checkpoint is
instructor-held and is used after your first attempt if needed; mark that support. Mark each evidence
claim independent, prompted, checkpoint-supported or awaiting revisit. Optional stretch in
[`stretch.md`](stretch.md) is for spare capacity and is not required for progression.

## Teardown

These commands finish on their own; there is no server to stop. Keep your authored source and
evidence. You may delete `node_modules/` and `dist/` inside your working copy after saving the attempt;
`npm ci` and `npm run build` recreate them. Do not remove the pristine starter or overwrite an earlier
attempt to reset your work.
