# W2.05 Lab: Connect browser controls to the treasure hunt

**Session:** W2.05 Browser events and rendering from state · **Week 2: TypeScript Programming**

A player can activate your game with a labelled direction button or an arrow key. Both inputs must mean
the same game action and display the state returned by the supplied rule. Your one challenge is to
complete that interaction in `starter/src/controls.ts`, then decide how to describe a changed
near-completion state.

The required editing is an implementation task: connecting existing functions, retaining returned state
and deriving feedback. Keep the rule engine, renderer, CSS, keyboard guard and test configuration
supplied. You are not building a game engine or implementing a browser focus policy.

## Outcomes

1. **Describe** DOM selection, event listeners and event objects using the supplied controls.
2. **Explain** the path from input event through a rule function to a rendered state.
3. **Write** button and keyboard handlers that call the same action function.
4. **Create** a usable view that updates text or CSS classes from state using supplied markup and styling.

## What is supplied and what you own

| File | Owner | Role |
|---|---|---|
| [`src/controls.ts`](starter/src/controls.ts) | **You** | The browser adapter: `render`, `dispatchMove`, button loop, keyboard connection |
| `src/rules.ts` | Supplied | Treasure-hunt rule (`applyMove`, `initialState`) agreeing with fixtures F01–F11 |
| `src/view.ts` | Supplied | `requireElement`, `requireButton`, `getButtonBindings`, `renderBoard` |
| `src/keyboard.ts` | Supplied | `shouldIgnoreGameKey`, `directionForKey` |
| `src/support.ts` | Supplied | New game, Final approach, Read diagnostics |
| `index.html`, `styles.css`, `demos/`, `src/demos/` | Supplied | Page, styling and the two worked-example pages |
| `tests/rules.test.mjs`, `tests/browser/controls.spec.mjs`, `fixtures/` | Supplied | Rule fixtures and real-browser checks |

## Setup and first observation

Use Node 22.23.2, npm 10.9.8 and the supplied browser prerequisites (the book's prepared environment is
Linux x64; Windows and macOS work the same way). The package pins TypeScript 5.9.3 and Playwright 1.61.0.
Open a terminal in this lab directory:

```bash
cd starter
node --version
npm ci
npx playwright install chromium
npm run check:baseline
npm start
```

The first installation needs package/browser downloads. **The baseline checks should pass** (14 rule
fixtures and 2 browser baseline checks). The server prints http://127.0.0.1:4173; open that address.
If the address is occupied, stop that package first, or use `PORT=4180 npm start`.

The starter shows nine tiles, the player at (0,0), zero score and six moves. **Its complete acceptance
suite intentionally fails because the adapter is incomplete** (on the unchanged starter: 2 browser
checks pass, 7 fail). Run `npm test` only after stopping the development server with Ctrl+C; the test
command starts its own server on the same port. `make test` inside the package is an equivalent
Bash/Make entry point when Make is available. After saving a change, run `npm run build` in another
terminal, then reload: there is no hidden automatic rebuild.

## Concepts in code

*Activity: Predict* (retrieval) — after East, South, what should position, score and remaining moves
contain? Which input changes the state and which still calls the rule without changing it?

Select and update an element (the selection contract includes the `null` result):

```ts
const result = document.querySelector("#event-result");
if (result !== null) {
  result.textContent = "Ready to inspect an event";
}
```

Register a callback that receives an event object:

```ts
button.addEventListener("click", (event) => {
  result.textContent = "Received: " + event.type;
});
```

`useLantern` is a function value; `useLantern()` invokes it now. `() => useTool("lantern")` defines a
function whose body makes that call later. *Activity: Discuss* — which value should registration receive
if work must wait for input?

**Worked Example 1: inspect a button without moving the game** — open "Button event demonstration"
(`demos/button-event.html`). Click the nested label once: one event, type click, current target
`inspect-button`, target `label`. Tab to the button and press Enter: another click reaches the same listener.

**Worked Example 2: spend a lantern charge through two inputs** — open "Shared action demonstration"
(`demos/shared-action.html`). Click "Use lantern": one. Press L: zero. Press L again: still zero. Both
inputs call `useLantern`; `charges = spendCharge(charges)` retains the rule's result before `showCharge`.

Syntax available for the Task 4 feedback decision:

```ts
const parcel = { size: "large", labelled: true, sealed: false };
const isLarge = parcel.size === "large"; // true
const ready = parcel.labelled && parcel.sealed; // false
let description = "Parcel";
```

```ts
if (isLarge) { description += " needs a large shelf"; }
```

Runnable copies of these snippets and the two demonstrations are in
[`../../examples/w2-05/`](../../examples/w2-05/).

## Guided practice

* **Locate the missing display update.** The starter's East listener already retains the result of
  `applyMove`. Click East once and use "Read diagnostics" under "Inspect the supplied state": position
  (1,0), five moves and one rule call, while the board still shows the original player tile.
* **Read the supplied adapter declarations**: `let state: GameState = initialState()`,
  `const statusElement = requireElement("#status")`, `getButtonBindings()`.
* **Make classes follow state**: `renderBoard` calls `classList.toggle("player", player)` with an
  explicit Boolean, so re-rendering unchanged state keeps the same tile marked.
* **Separate setup, input and inspection**. *Activity: Predict* — the player stays still after West from
  the start. Which evidence distinguishes a correctly rejected request from a button without a listener?

## Lab challenge

### Task 1: repair the guided single-button view (minutes 35–50)

Open `src/controls.ts`. Its East listener calls `applyMove(state, "east")` and retains the returned
object. Activate East once, open "Inspect the supplied state", choose "Read diagnostics" and compare the
copied state with the marked tile. Add a call to the existing render function at the "Guided completion"
comment. Rebuild and reload. The tile at (1,0) must now say "Player", and the status must describe five
remaining moves. Explain why a second rule call would spend another move instead of refreshing the first
result. Do not add a second East listener.

### Task 2: consolidate the rule, returned state and rendering (first 10 minutes of 50–95)

Complete `dispatchMove(direction: Direction)`. Use the supplied rule once, retain its result in `state`,
then refresh the display from that value. Replace the temporary East-specific route as you connect the
shared one; leaving both registrations means one event can execute two calculations.

### Task 3: connect all buttons and the guarded keyboard route (next 10 minutes)

Use the supplied `buttonBindings` array: for each record, register a click callback on
`binding.element` that sends `binding.direction` to your action function. Your initial page should still
report zero calls. Complete the final connection in the existing keyboard callback, preserving the early
returns and `preventDefault()` placement. Do not create extra Enter/Space handlers for native buttons.
After separate fresh resets, compare East with ArrowRight, and South with ArrowDown. North and West from
the start still add one call while preserving all state fields.

### Task 4: diagnose the changed final-approach feedback (next 12 minutes)

Spend the first three minutes on the before-run section of the evidence card: use "Final approach", then
"Read diagnostics", and predict two South actions and the feedback each should produce, plus a following
New game. Your feedback must include **Last move** when the player needs warning of a last playable move.
It must preserve the rule's completion word and remaining-move count, never invite play after
completion, and never retain an obsolete warning across renders. During the next six minutes, swap pair
roles, defend your condition and text-update choice, and implement it only in the existing render
function. Use the final three minutes to try South by button, then South by key, followed by New game.
The browser test named "changed final approach" remains available as the contract.

### Task 5: verify usability and retain individual evidence (final 13 minutes)

Stop the development server with Ctrl+C. Run `npm test` from `starter` (rule fixtures plus nine real
browser checks). Use Tab and then Enter or Space on a labelled direction button: keep the visible focus
outline and confirm one call for each activation. Type in Player notes and use arrows within that field,
the textarea, the selector and the editable note: those actions must preserve game state. Compare a
blocked move's complete state, not only its position.

## Acceptance criteria

- [ ] Baseline compilation and initial rendering succeed, with zero move-rule calls before an input.
- [ ] Each labelled direction button and its corresponding arrow key produce the same state from the same fresh reset.
- [ ] One game event produces one rule call; no duplicated temporary East listener remains.
- [ ] Accepted moves update the player class, non-colour player text and status from the retained result.
- [ ] Wall, boundary and post-completion actions preserve every rule-state field while still reaching the rule once.
- [ ] Final approach meets the supplied browser test's warning and completion observations; a later render or reset leaves no obsolete warning.
- [ ] Before running or revealing the changed case, each learner records predicted feedback, defends the chosen condition and text updates, and rejects one alternative using a concrete counterexample.
- [ ] Ordinary editing, repeated keys and unrelated keys do not become game actions; native button focus stays visible.
- [ ] Each learner explains one concrete event path and independently appends coordinates to the displayed feedback, with assistance recorded.

## Three-stage hints

**Hint 1: identify the last correct boundary.** Draw a trace from input to callback, direction, shared
function, rule, retained state and display. Mark the last observation you can verify. If the call count
remains zero, investigate registration or dispatch. If state changed while the tile did not, investigate
rendering.

**Hint 2: expose the intermediate value.** Use a fresh reset, perform one action and inspect the copied
state. Compare it with the selected player tile and status label. For Task 4, first record your
prediction; then use the observed state to locate the first difference.

**Hint 3: retain one supplied rule result.** The statement `state = applyMove(state, direction);`
retains the value from a single rule call. Complete the following display step yourself and explain why
both belong in the shared function. For Task 4, trace your text statements on paper across two renders.

## Individual evidence and transfer

Use the evidence card ([`evidence.md`](evidence.md)) for a prediction, observed state, visible result,
call count and explanation of one owned statement. Independently append the player's coordinates to the
displayed status, preserving the completion word and the "Last move" condition; check an accepted and a
blocked move.

*Transfer:* a stock-request page has `increaseQuantity(current)` (capped at three) and
`showQuantity(quantity)`. Starting at two, predict the retained value and display after Increase followed
by ArrowUp; diagnose a label that stays at two while the stored quantity is three.

## Knowledge check (about 8 minutes)

1. A colleague changes the button's HTML ID to `east-control`, but the script still selects `#east`. The
   startup check reports a missing button. Which repair addresses the cause?
2. A change calls `dispatchMove("east")` while setting up a listener. The intended behaviour is to wait
   until the player activates East. Which replacement preserves that timing?
3. After one East click, diagnostics show one call, position (1,0) and five remaining moves. The board still
   marks (0,0), and the label still displays six. Which statement best guides the next inspection?
4. Mouse activation makes East once, but pressing Enter on the focused East button produces two rule calls.
   The adapter has a click listener and a new custom Enter listener. Which change preserves native usability?
5. Final approach starts with treasure, position (2,0) and two moves. Two South actions return a win at
   (2,2) with zero moves. A formatter displays lost whenever moves equal zero. Which decision keeps the
   view consistent?

## Recovery, access and teardown

Save your adapter before opening another checkpoint; retain an environment error separately from
implementation evidence. Captured observations for a failed live demonstration are in
[`../../examples/w2-05/demo-observations.md`](../../examples/w2-05/demo-observations.md); open the
changed-case capture only after recording your prediction. Labelled controls, visible focus and
non-colour position text support the same evidence without a pointer. Stop the server with Ctrl+C.
Generated `dist/` and `test-results/` are disposable (`npm run clean`); preserve `src/controls.ts` and
your evidence. No account, secret or cloud service is involved.
