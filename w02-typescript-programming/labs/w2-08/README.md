# W2.08 Lab: Refactor a component and preserve its callers

**Session:** W2.08 Classes, composition and refactoring · **Week 2: TypeScript Programming**

Refactor a familiar game component into a small class with an explicit interface while preserving its
tested behaviour. The before-component and existing tests are supplied. Your class owns one current state
and composes the familiar movement rule; rendering remains outside the component. The primary difficulty
is design: identify the smallest public boundary that preserves the existing caller.

## Outcomes

1. **Describe** classes, instances, public interfaces and composition using the familiar component.
2. **Compare** a class with functions that operate on explicit state.
3. **Write** a small class that exposes intended operations and keeps its responsibility limited.
4. **Refactor** the component and verify behaviour against the existing tests.

## Timing

One 45-minute challenge: one minute of introduction and Tasks 1–4 at 10/10/12/12 minutes. The preceding
guided practice lasts 15 minutes. Quiz (four questions), individual evidence and transfer share the later
15-minute debrief; the final ten minutes are reserved for support.

## Setup: establish the prepared baseline

Use prepared Node 22.23.2, npm 10.9.8 and TypeScript 5.9.3 on PATH. Node supplies the test runner and
assertions; this package has no runtime dependencies. Begin beside `starter/` and
[`evidence.md`](evidence.md). Paste the complete block (Git Bash on Windows):

```bash
w208_work=$(mktemp -d "$HOME/w2-08-work.XXXXXX") &&
cp -R starter/. "$w208_work/" &&
cp evidence.md "$w208_work/evidence.md" &&
cd "$w208_work" &&
node --version &&
npm --version &&
tsc --version &&
npm run check:baseline
```

*If `tsc` is not on PATH:* run `npm ci` in the working copy (pinned TypeScript 5.9.3 from the lockfile)
and use `npx tsc --version`; the launcher uses `node_modules/typescript` when present.

**Expect 24 baseline passes** (twelve original rule checks and six component checks for each of the
supplied before and demonstration implementations). **`npm test` includes unfinished learner work and
intentionally fails initially.** The launcher removes this copy's old `dist`, checks the prepared versions
and compiles current `src` files before running tests: `BUILD FAILED` means no tests executed. Modes:
`check:baseline`, `check:practice`, `check:core`, `check:connection`, `inspect`, `demo:compare`,
`demo:refactor`, `test`. `make test` is another complete-check entry point.

## Supplied contract and owned files

| File | Responsibility | Your action |
|---|---|---|
| [`src/component.ts`](starter/src/component.ts) | `GameComponent` class and its connection expression | Complete `move` and repair the bounded connection |
| [`src/practice.ts`](starter/src/practice.ts) | Guided scalar counter | Complete `increment` during guided practice |
| `src/before.ts` | Original explicit-state functions and compatible adapter | Read; preserve |
| `src/demo-class.ts` | Complete demonstrated class | Use as supported comparison |
| `src/contract.ts` | `Component` interface and bounded copy | Read; preserve |
| `src/subscriber.ts` | Stores a function and invokes it through a port | Inspect; preserve implementation and counter |
| `src/rules.ts` | Familiar pure movement rule and fixtures | Preserve |
| `tests/` | Shared contract assertions and caller checks | Read; keep expectations, names and selection unchanged |
| `check.mjs`, `tools.mjs`, `checkpoints/` | Build, test and preservation support | Use documented commands |
| `evidence.md` | Predictions, observations, individual account and assistance | Complete and retain |

`Component` exposes `move(direction): void` and `snapshot(): GameState`. Creating the component copies the
caller's seed. Moving delegates to the existing rule and retains its returned state. A snapshot copies
position and `collectedTreasureIds`, along with scalar fields. Snapshot object identity is not promised.
(This package's state calls the collected IDs `collectedTreasureIds`; its rule tests translate the shared
fixtures' `collected` field without changing any value.)

The stored-operation caller: `subscribe` stores a callback and returns a port. Registration performs no
movement and leaves calls at zero. `port.send(direction)` increments calls once and invokes the stored
callback once. The function adapter already meets this contract; your refactor must retain it without
changing the subscriber.

## Concepts and worked examples

**Worked Example 1: compare functions with one class instance** (`npm run demo:compare`):

```ts
const holder = createHolder(initialState());
moveHolder(holder, "east");
const fromFunctions = snapshotHolder(holder);
const game = new DemoComponent(initialState());
game.move("east");
const fromClass = game.snapshot();
```

Initialise a field in the constructor:

```ts
#state: GameState;
constructor(initial: GameState = initialState()) {
  this.#state = copyState(initial);
}
```

Check the intended operations with `implements`:

```ts
export interface Component {
  move(direction: Direction): void;
  snapshot(): GameState;
}
```

**Worked Example 2: refactor and rerun the existing assertions** (`npm run demo:refactor`):

```ts
move(direction: Direction): void {
  this.#state = applyMove(this.#state, direction);
}
snapshot(): GameState {
  return copyState(this.#state);
}
```

Read `this` from the actual invocation (`src/receiver.ts`):

```ts
const north = { label: "North", describe() { return this.label; } };
const south = { label: "South", describe: north.describe };
```

| Choice | Ownership is visible in | Suitable use here |
|---|---|---|
| Explicit-state functions | Parameters and returned values | Independent rule calculation and straightforward state passing |
| Small component class | Constructor, fields and public methods | A long-lived owner exposing a limited operation set |

Runnable copies: [`../../examples/w2-08/`](../../examples/w2-08/).

## Guided practice (15 minutes)

* *Activity: Predict* (retrieval) — a test calls the movement rule but discards its return value: which
  observation would remain unchanged, and which statement must retain the result?
* *Activity: Type* — run the baseline, locate one shared expected state in `tests/shared.mjs` and identify
  the two factories that use it.
* **Complete one counter method:** in `src/practice.ts`, complete `increment` using `this.#count`. Run
  `npm run check:practice` (counters at two and seven; increment the first; expect three and seven).
* **Map the original functions to class members:** constructor ↔ `createHolder`, `move` ↔ `moveHolder`,
  `snapshot` ↔ `snapshotHolder`. Write one expected normal state and one preserved blocked state in the
  evidence card.

## Lab challenge

### Task 1: complete the class operation (10 minutes)

Finish `GameComponent.move`. Use the supplied field, rule and parameter, keeping the constructor and
snapshot operation's contracts. Do not duplicate the movement calculation or add rendering. Run
`npm run check:core`: **expect 30 passes** (twelve rule tests, then six shared assertions for each of the
original functions, demonstrated class and your class).

### Task 2: compare the callers before choosing a repair (10 minutes)

Read `src/subscriber.ts` and the connection expression in `src/component.ts`. *Activity: Predict* — in
`evidence.md`, predict the state and call count after registration, after a direct class call and after the
stored-operation invocation. Identify which expression will actually invoke the stored function.

```bash
npm run check:connection
npm run inspect
```

The first command asserts the existing caller contract against both implementations. The second prints a
direct-call observation, a separate fresh registration and the result of sending East through that port;
it catches an error to print its name and message, so its success is not a passing caller test. Record the
exact error and whether the caller's count changed before the game state did.

### Task 3: repair one connection boundary (12 minutes)

Choose the smallest change to `connect` that preserves the existing interface, subscriber and rule. It must
leave registration inactive, invoke the selected component's public `move` operation later, pass the actual
direction and preserve independent connections. Evaluate two proposed shortcuts in saved working copies:
(1) remove the native-private notation and use an ordinary state property while keeping the original
connection expression; (2) call `move` during registration and pass its result to the subscriber. Predict the
error or state observation for each; record a compiler rejection separately from a runtime result. Re-run
`check:connection` and `check:core` after your repair.

### Task 4: replay and preserve the same claims (12 minutes)

Run `npm test` and **expect 33 passes**. Save before replaying the supported core checkpoint:

```bash
node tools.mjs checkpoint
npm run check:connection
```

The first command prints a unique PRESERVED directory holding `component.ts`, `practice.ts` and
`evidence.md`; copy that path into your notes. The same caller test must fail for its actual invocation
boundary. Restore using the printed path:

```bash
node tools.mjs restore BACKUP_DIRECTORY
npm run check:connection
npm test
```

## Acceptance criteria

- [ ] The supplied 24-test baseline runs against current compiled source.
- [ ] My guided counter and small class compile with the intended public operations.
- [ ] The same core assertions pass for the original functions and refactored class.
- [ ] I preserve the constructor and nested-snapshot ownership contracts and the original rule tests.
- [ ] I compare direct and stored-operation calls, identifying the actual receiver and failing state access.
- [ ] My bounded connection preserves deferred execution, direction forwarding, call count and independently chosen components.
- [ ] I explain actual observations for the two proposed shortcuts without confusing compiler and runtime failures.
- [ ] The unchanged caller test fails for the supported core checkpoint and passes after restoring my repair.
- [ ] The complete suite reports 33 passes, and my individual interface explanation records assistance and a next revisit.

## Three progressive hints

**Hint 1: locate the invocation.** Mark registration and invocation as separate expressions. Identify the
object to the left of the method call at the later invocation. Compare it with the object that owns the
state field being read.

**Hint 2: retain an intermediate observation.** Use the inspection's registration snapshot and call count.
If registration left state unchanged and the count increases before failure, the caller reached its later
operation. Trace that operation into the class.

**Hint 3: complete a diagnostic operation.** Replace the gaps before running it in a saved working copy:

```text
const game = new GameComponent(/* choose a supplied seed */);
const port = connect(game);
const registered = game.snapshot();
port.send(/* choose a legal direction */);
assert.deepEqual(registered, /* predict registration state */);
assert.equal(port.calls, /* predict actual invocations */);
assert.deepEqual(game.snapshot(), /* predict resulting state */);
```

## Individual evidence and transfer

Justify the class's public interface and identify behaviour preserved by its tests: why `move` and
`snapshot` have different result contracts and why the pure rule remains outside the class. Name the object
that owned state, the caller that invoked the operation and the observation that changed after the repair.
*Transfer:* an equipment-loan component keeps whether an item is available and exposes `lend` and
`snapshot`; explain what its constructor must establish, which assertions stay unchanged during a refactor,
and whether generating a formatted page belongs in it.

## Knowledge check (about 8 minutes, four questions)

1. A class implements `Component` and compiles, but its `move` discards the rule's returned state, so the
   movement assertion fails. A reviewer says `implements` should have prevented this. Which response explains
   the two results?
2. A pre-existing editor component promises a live view (callers retain `view()` once and see later updates);
   a proposed class returns a fresh copy each call and its new value-only tests pass. Which decision follows?
3. An integration creates `new GameComponent(seed)` for every incoming action, so each session shows only its
   first step; a proposed fix shares one instance across sessions. Which arrangement preserves progress and
   independence?
4. After a refactor, an export calls `JSON.stringify` on a class instance whose only fields are native
   private fields and gets `{}`. Which change fits?

## Recovery, support and teardown

`node tools.mjs save` preserves the current owned files without replacing source. `checkpoint` supplies only
the demonstrated class operation; the caller diagnosis remains unfinished. Missing evidence stops the tool
before replacing source. No service needs stopping. Retain source, evidence and backups (`backups/`), then
remove only disposable generated output.
