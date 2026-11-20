# W3.01 · Software design and maintainability

**Duration:** about 120 minutes, including one 45-minute design challenge and an 8-minute knowledge check.

A design describes responsibilities and dependencies before it describes how many files or classes an
application contains. A small game can have several files while still requiring a browser to test one state
transition. Conversely, a short application can have a useful boundary if its callers can supply an
alternative collaborator without loading the original one.

## Outcomes

- Describe cohesion, coupling and separation of responsibilities using a small application.
- Explain how dependency boundaries affect testing and future changes.
- Compare a tightly coupled implementation with one that separates rules, rendering and services.
- Design and annotate a small refactor that preserves observable application behaviour.

Your main product is an annotated dependency diagram and a bounded refactor plan. The supplied programs make
the comparison executable; you inspect their evidence, you do not build another game or a framework.

## Supplied and owned

| Path | Role |
|---|---|
| [`starter.mmd`](starter.mmd) | **You own:** the editable Mermaid diagram (starts as an incomplete current view with a legend) |
| [`notes.md`](notes.md) | **You own:** design note — four fields, text alternative, evidence table, rejected alternative |
| [`runtime/`](runtime/README.md) | Supplied executable fixtures `before/`, `after/`, `challenge/` (runtime guide in `runtime/README.md`) |
| `runtime/challenge/browser.mjs`, `runtime/challenge/headless-public.mjs` | The two **fixed** consumers: both import the same public entry `dist/index.js` |
| [`recover.py`](recover.py), `checkpoint/partial-syntax.mmd` | Recovery that backs up your diagram and notes first |
| [`hints/`](hints/) | Hint 1, Hint 2, Hint 3 |

## Prerequisites and setup

Node 22.23.2 / npm 10.9.8, TypeScript 5.9.3 (pinned in `runtime/package.json`), Python 3, a browser and a
Mermaid renderer (an editor preview or <https://mermaid.live> with your own source; if rendering is
unavailable, complete the text alternative). From `runtime/`: `npm ci`, then `npm run build:before`,
`npm run build:after`, `npm run build:challenge`.

## Retrieve the familiar game

The reference game starts at (0,0) with six moves. East reaches (1,0). South then targets the wall at (1,1).
Rejecting this action should preserve the move budget, but the Week 3 fixture deliberately spends one move.
**Predict:** write the intended and supplied actual remaining moves after East, South. Name the observation
that distinguishes a rule correction from a boundary refactor. (Intended five; supplied actual four.)

Distinguish compilation, module loading, factory creation and action execution: a failure at the first
runtime point prevents later observations. Record the command, entry module and actual first error.

## Concepts

- **Cohesion:** how closely the responsibilities inside one component belong together (the rule module's
  state types and transition logic). **Coupling:** what another component must know or load to use this one.
  **Separation of responsibilities:** each operation has a clearer owner; `makeGame` coordinates the
  transition, history record and render call.
- **Give arrows one meaning at a time:** a solid arrow labelled *runtime import* points from the importing
  module to the module loaded; a dotted arrow labelled *type import* points from the type user to the defining
  module (erased from compiled JavaScript); an arrow labelled *call* points from caller to the operation it
  invokes (draw a separate call view if needed). Do not reverse an import arrow because data returns.
- The `Renderer` interface gives the application a small contract, `show(state)`. Type compatibility is only
  one part of replaceability: a caller must also be able to load the component and supply the alternative.

## Worked example 1: annotate the actual responsibilities

Open `runtime/before/src/make-game.ts`, `rules-seeded.ts`, `browser-renderer.ts` and `history-store.ts`.
Read the imports before the action callback. For one East action, `makeGame` calls `applyMove`, retains its
result, calls `recordSnapshot`, then calls the renderer's `show`.

*Text alternative:* application imports make game and DOM renderer at runtime; make game imports rules and
local history at runtime; make game and DOM renderer use the ports types. Ports and history use rule-defined
state types. The action calls flow through rules, history and renderer in that order.

Build `runtime/before`, start its local server (`npm run serve:before`, http://127.0.0.1:4301) and click East
then South. Record complete states and the four-move defect. Run `node headless.mjs` in `runtime/before`: it
fails on `document` during module evaluation. Annotate that failure beside the runtime import that makes the
page necessary.

## Worked example 2: refactor one dependency and preserve behaviour

Compare `runtime/before/src/application.ts` with `runtime/after/src/application.ts`:

```ts
// Before: module loading already requires the DOM renderer.
import { makeGame } from './make-game.js';
import { browserRenderer } from './browser-renderer.js';
import type { Renderer } from './ports.js';
export function createGame(renderer: Renderer = browserRenderer) {
  return makeGame(renderer);
}
// After: the caller supplies the collaborator.
import { makeGame } from './make-game.js';
import type { Renderer } from './ports.js';
export function createGame(renderer: Renderer) {
  return makeGame(renderer);
}
```

Build after and run `node headless.mjs` in `runtime/after`: loading succeeds; three complete recorded states
match local history. Replay East, South, East, South, South in the browser (`npm run serve:after`) and compare
all six full states with before. Both finish with one move: the blocked-action defect remains. Headless success
demonstrates testability; browser equality demonstrates preservation.

## Guided practice

1. **Separate four observations** (after fixture): compiler, headless load, transition observation, browser
   observation — record the command or interaction for each. *Investigate:* mark a removed runtime
   dependency, an unchanged type dependency and an unchanged caller argument.
2. **Preserve the defect deliberately:** rerun the after headless command in a fresh process; write the two
   distinct claims "The refactor preserves the supplied behaviour" and "The supplied behaviour satisfies the
   intended blocked-action contract".
3. **Check a diagram as a claim:** for each node name a file or responsibility; for each edge, the import or
   operation that justifies it.
4. **State the change budget:** rule behaviour, history semantics, the `Renderer` operation and both supplied
   consumers are fixed; prepare the four fields in `notes.md` (leave the proposed change empty for now).

## Lab challenge: inspect the supplied starting design (45 minutes)

Open `starter.mmd`, `runtime/challenge/src` and `runtime/challenge/headless-public.mjs`. The new headless
consumer must import the same public entry as the existing browser; neither consumer's imports may be
changed. Retain the earlier direct application check (`runtime/challenge/headless.mjs`) as additional evidence.
Keep the game-state defect unchanged.

1. **Inspect the fixed obligations.** Read both fixed consumers: browser and headless import the same public
   entry. Retain the direct application check too.
2. **Complete the current graph.** Add the application factory, public entry, make-game coordinator, rule
   module, DOM renderer, local history service, ports, browser consumer and public headless consumer. Trace
   actual runtime imports and re-exports (follow a re-export when the emitted JavaScript retains it), with types
   and environmental execution stages labelled separately. Mark where top-level environmental work occurs.
3. **Compare proposals.** Propose one bounded change satisfying both consumers. Compare the unchanged completed
   demonstration against the new public-entry obligation, then reject a concrete competing plan using actual or
   predicted evidence. You may propose a bounded change to environmental dependency handling while retaining
   renderer output and its missing-display error when used.
4. **Specify evidence.** Record compiler, headless and complete browser preservation observations or predictions
   (rows: compilation, direct application load, fixed public headless consumer, existing browser sequence),
   each Node check in a fresh process; name the retained known defect separately.
5. **Review and submit.** After peer review, submit the editable graph, its render or complete text alternative,
   and `notes.md`, labelling before and proposed after relationships.

## Acceptance criteria

- Node coverage: all nine named nodes are present, each tied to a supplied file or responsibility.
- Labelled directions: runtime imports, type imports and calls are distinguished by the legend; re-exports followed.
- Environmental load path: the module that reads `document` at top level and the import path that reaches it are marked.
- Compatibility: the proposal keeps both fixed consumers' imports and the browser's operation contract.
- Evidence: compiler, direct load, public headless and browser rows with expected and rejecting observations; a rejected alternative with its distinguishing observation.
- The defect stays visible: intended five versus supplied actual four after East, South, corrected separately later.

## Knowledge check (8 minutes)

1. The rule module calculates state transitions, the renderer formats state for a page and the history service
   records copied observations. Which claim best describes cohesion? A) Every responsibility must live in a
   separate class. B) Responsibilities grouped inside a component serve a closely related purpose. C) A
   component with no imports is always the most maintainable design. D) Rendering a dependency diagram proves
   its relationships are correct.
2. A changed service contract says a move becomes visible only after `commit(candidate)` returns a receipt. It
   may throw; on failure the retained state and display must remain at the previous state. The candidate
   calculation is pure. Which sequence meets this contract? A) Retain candidate; show candidate; commit
   candidate. B) Show candidate first, then commit; a service error automatically restores the display.
   C) Replace commit with a no-op because it has the same parameter type. D) Commit candidate; if it returns,
   retain candidate and show candidate; if it throws, report failure while preserving previous state/display.
3. A library publishes `entry.d.ts` and `entry.js` only. Its emitted declaration contains
   `import type { Renderer } from './ports.js'`, and its exported factory accepts `Renderer`. The repository build
   passes because ports exists in the repository. A clean consumer cannot resolve that declaration dependency.
   Which bounded plan satisfies the publication contract? A) Include the required public type declaration in the
   published artifact, or emit a self-contained public declaration; validate from a clean consumer using only
   published files. B) Keep the repository build as the only check because the missing import is type-only.
   C) Remove all parameter types from the source while continuing to promise the same typed public contract.
   D) Tell consumers to copy the author's unpublished source tree into their dependency directory.
4. Node caches a successfully imported module by its resolved URL. A test sets `globalThis.document` to a fake,
   imports a module that reads `document` at top level, deletes the fake, then imports the same URL again. The
   second import passes. What does that establish? A) The module has no runtime dependency on `document`.
   B) Deleting a global reruns every previously loaded module. C) The second import reused an already evaluated
   module; a fresh process without the fake is needed to test whether the entry loads without `document`.
   D) An interface has converted the original runtime import into a type-only import.

## Recovery

If the diagram does not render, preserve the current source first. From this lab directory,
`python3 recover.py` (Windows: `python recover.py`) backs up `starter.mmd` and `notes.md` into a new
`attempts/attempt-N` directory before restoring the partial syntax checkpoint; it stops if either file is
missing. Check one broken line at a time (bracket pairs, quoted labels, supported arrow syntax). If rendering is
unavailable, complete the text alternative with every node, directed edge and label. When a diagram is crowded,
split the import and call views with the same identifiers. If a local server port is busy, choose another
(`node serve.mjs challenge 4302`); do not stop a server you did not start. A headless `document` error in the
after fixture means a different entry, stale build or changed sources: record the directory and rebuild.

## Optional extension

Refine the handoff for a future implementer: make a vague benefit concrete, name the public caller that must
stay compatible, or identify a prediction that still needs execution. Do not remove the known defect.
