# W2.06 Lab: Retrieve checked board data while local play remains usable

**Session:** W2.06 HTTP requests, asynchronous code and validation · **Week 2: TypeScript Programming**

Complete `starter/src/request.ts` so the page retrieves the reference board definition, checks the
actual response and reports its outcome. The game already works locally. Loading a definition is an
inspection operation: it must never start a new game, replace current position or replenish remaining
moves.

Keep the API, proxy, shape checker, adapter, event binding and game controls supplied. Your required
implementation is one async function and a response-level occupancy decision.

## Outcomes

1. **Describe** the request, response and JSON data in the starter API contract.
2. **Explain** why external data needs runtime checks in addition to TypeScript annotations.
3. **Write** an asynchronous request that validates its result and handles a failure.
4. **Create** loading, success and failure states around a familiar local interaction.

## What is supplied and what you own

| File | Owner | Role |
|---|---|---|
| [`src/request.ts`](starter/src/request.ts) | **You** | `loadBoard(): Promise<void>` |
| [`trial-layout.json`](starter/trial-layout.json) | **You** (Task 4) | walls and treasures for "My trial layout" |
| `src/board-shape.ts` | Supplied | `WireBoard` and the nested guard `isBoardShape(value)` |
| `src/adapter.ts` | Supplied | `publishDefinition(value)`: `initialMoves` → `initialMoveBudget`, display only |
| `src/request-ui.ts` | Supplied | `showRequest(kind, message)`, `setBusy(boolean)`, `errorMessage(error)` |
| `src/controls.ts`, `src/rules.ts`, `src/board.ts`, `src/main.ts` | Supplied | Local game (state owned by `controls.ts`) and the one "Load board data" binding |
| `src/fixture-selector.ts`, `tools/serve.mjs` | Supplied | Development proxy and response-condition selector (teaching only) |
| `supplied-runtime/` | Supplied | Copied .NET board API (`Program.cs`, `BoardApi.csproj`, `global.json`, `board-reference.json`), target `net10.0` |
| `demos/inspect.html`, `demos/message.html` | Supplied | Worked Examples 1 and 2 |
| `tests/`, `fixtures/`, `playwright.config.mjs` | Supplied | Rule fixtures F01–F11 and real-browser checks |

## Setup and working baseline

Use Node 22.23.2, npm 10.9.8, TypeScript 5.9.3, Playwright 1.61.0, Python 3 and .NET SDK 10.0.401
(the book's prepared environment is Linux x64). `supplied-runtime/global.json` pins the SDK feature band
with roll-forward, so a newer 10.0 SDK also works. Open a terminal in this lab directory:

```bash
cd starter
npm ci
npx playwright install chromium
npm run check:baseline
npm start
```

**The baseline should pass** (13 rule fixtures and 4 browser checks: game, actual API and both
demonstrations). `npm start` builds, starts the .NET API on an internal port and prints
http://127.0.0.1:4176 — keep that terminal running. (If the .NET SDK is missing, the server prints a
warning and serves the same `board-reference.json` itself; record that as an environment note.) A second
terminal in `starter` can run `npm run build` after each edit; reload afterwards. If the port is
occupied, stop the old server or use `PORT=4186 npm start`.

**The full `npm test` intentionally fails before completing the request** (on the unchanged starter:
4 pass, 12 fail). Stop the development server with Ctrl+C first: the suite starts its own server on the
same port. `make test` in `starter` runs the same checks when Make is installed. A missing runtime,
failed installation or compile error is an environment/build problem, not an expected failure.

## Supplied contract

The request is `GET /api/boards/reference` at the browser's origin. The proxy forwards it to the copied
.NET API. A normal response is status 200 and JSON containing:

```json
{"id":"reference","width":3,"height":3,
 "start":{"x":0,"y":0},"walls":[{"x":1,"y":1}],
 "treasures":[{"id":"t1","x":2,"y":0}],
 "exit":{"x":2,"y":2},"initialMoves":6}
```

(The supplied API serves the shared reference fixture, which also includes `name` and the treasure's
`value`; see [`../../examples/w2-06/response.json`](../../examples/w2-06/response.json).)

`isBoardShape(value)` establishes the reference ID, positive integer dimensions, required point fields
with integer in-bounds coordinates, arrays of walls and treasure, non-empty treasure IDs, and a numeric
`initialMoves`. It does not establish that the starting allowance is usable. A new game's allowance must
be a positive whole number. **The additional acceptance contract requires every treasure to occupy a
traversable cell: no treasure may share both coordinates with any wall.** A shared x or y coordinate
alone is permitted. Solvability and unique IDs remain outside this exercise.

The parsed value stays `unknown` until it is checked:

```ts
const value: unknown = await response.json();
```

`if (!response.ok) throw new Error("HTTP " + response.status);` turns an unsuccessful HTTP status into an
exception handled by your request's `catch` block. A `finally` block re-enables the request control after
either outcome; displaying success there would overwrite a truthful failure.

## Worked examples and guided practice

* **Worked Example 1: inspect the response and its JSON text.** Open "HTTP response inspection" and
  activate "Fetch and inspect": status 200, a content type containing `application/json`, and the body as
  text. Locate `"initialMoves": 6`, the start coordinates and treasure ID `"t1"`.
* **Worked Example 2: request and check a service message.** Open "Asynchronous message request".
  "Valid message" ends at "Board service ready"; "Wrong message type" ends at "Failure: Invalid message".
* *Activity: Predict* — a board-data request begins after East. Before any response arrives, which
  process already holds the player's position? Two responses contain valid JSON, one with text and one
  with a number in the same property: what must the display check before using either value?
* *Activity: Discuss* — which check reports a missing treasure ID, and what additional question remains
  after a numeric field has passed its type check?

## Lab challenge

### Task 1: establish the guided loading observation (minutes 35–50)

Confirm the baseline passes, make East and read diagnostics: position (1,0), five moves, one rule call.
Open `src/request.ts` and replace its idle message with `showRequest("loading", "Retrieving board data.");`.
Rebuild, reload and activate Load board data. The message changes while the local game remains usable.
The temporary shell has no request and stays loading. Identify the imported helpers and the
`Promise<void>` return annotation.

### Task 2: retrieve and inspect the real response (first 10 minutes of 50–95)

Extend the function with the two awaited operations: fetch the documented path, check the HTTP outcome,
read the body as JSON and retain the result as `unknown`, inside the `try` block. Call the supplied shape
guard before accessing board fields; on a failed shape check, throw an error with "Invalid board shape".
Choose an HTTP failure message including its actual status number. Preserve the relative URL and the
existing callback.

### Task 3: complete the failure and retry controls (next 10 minutes)

Set the busy state and loading message before waiting. Handle exceptions from fetch, body parsing and
validation by displaying failure using the supplied formatter. Arrange cleanup so another attempt
becomes available after either outcome. Display success only when the current response has passed all
required checks. Choose Unavailable, wait for "Selected: http", then load. Repeat with Malformed JSON and
Missing treasure ID. Keep the last accepted definition visible when another response fails; before any
success, retain "No remote definition accepted."

### Task 4: decide whether the complete layout can be accepted (next 12 minutes)

Keep the supported numeric floor after the shape guard: reject when
`!Number.isInteger(value.initialMoves) || value.initialMoves <= 0`, using "Invalid move budget". Before
opening hints or test cases, state the treasure/wall relation in words on your evidence card. Choose
your own otherwise-valid wall and treasure coordinates for two responses: one accepted layout and a
changed layout that must fail, including a case where the relevant point is not first in its collection.

Edit only the `walls` and `treasures` arrays in `starter/trial-layout.json`; keep coordinates inside the
three-by-three board and give every treasure an ID. "My trial layout" reads that file afresh for each
request. Implement your condition in the same request function before publication and success, using
"Blocked treasure". Then select Delayed zero budget: its eight-second wait lets you focus East and press
Enter while loading remains visible.

### Task 5: verify outcomes and preserve evidence (last 13 minutes)

Stop the development server and run `npm test` (16 checks when complete). Inspect one passing trace
yourself: start with a successful definition, make a local move, reject a response, then choose Valid
reference and retry. Confirm that remaining moves reflect play rather than the downloaded starting
allowance. Type in Player notes and use arrows there.

## Acceptance criteria

- [ ] Baseline compiles and the real API/demo checks pass before learner edits.
- [ ] One async function awaits the response and parsed value, handles unsuccessful HTTP status and calls the complete supplied shape guard.
- [ ] Each learner records a relation, their own distinguishing layout pair and publication-order defence before hints or execution.
- [ ] Only an accepted definition is displayed, using the explicit `initialMoves` to `initialMoveBudget` adapter.
- [ ] Zero, negative and fractional allowances, and every treasure on a wall, produce failure without replacing the accepted definition.
- [ ] Otherwise-valid nearby treasures sharing only one coordinate with a wall remain accepted; later points are checked too.
- [ ] Loading is visible; another request is disabled while local button/keyboard play and editing remain usable.
- [ ] Failure preserves current game fields, including actions during the wait, and leaves retry available.
- [ ] A successful retry preserves that same local progress.
- [ ] Each learner explains why an annotated response can fail the actual runtime condition, with assistance recorded.

## Three-stage hints

**Hint 1: identify the first unestablished guarantee.** Separate received HTTP status, parsed JSON,
nested shape, numeric allowance and the relation between collections. Name the last guarantee your
observation establishes.

**Hint 2: compare the two candidate paths.** Trace every treasure in each of your chosen layouts against
the relevant wall positions. A single coordinate equality does not identify a cell. Then locate the
statements that make the definition visible and announce success: do they execute only on the accepted
path?

**Hint 3: complete one request operation.** `const value: unknown = await response.json();` obtains the
parsed value while preserving the need for checks. Keep the shape rejection and numeric floor, then add
your own occupancy decision before publication.

## Individual evidence and transfer

The individual card gives a board-shaped value with an initial move allowance of 2.5 and a successful
TypeScript annotation. Explain why the annotation and the nested shape guard can both accept its type
while the application rejects its meaning, and identify the executable condition that decides it.
*Transfer:* a stock information panel refreshes an external availability figure beside an unsent local
order — explain why refreshing should preserve the order quantity edited during loading, which contract
decides whether a parsed value is acceptable, and which display reports a service failure. Use
[`evidence.md`](evidence.md).

## Knowledge check (about 8 minutes)

1. A local route returns 404 with a readable JSON error body. A colleague expects fetch itself to reject
   automatically. Which statement explains what the request function must do?
2. An audit must retain the exact response text while the board still needs runtime validation; one
   request and one body read are permitted. Which arrangement satisfies all three requirements?
3. Query A starts, then B starts and succeeds, then A fails. Feedback must describe the latest selected
   query; each request carries its own ID. Which publication rule works for either arrival order?
4. The request's catch handles the exception without rethrowing. A new caller awaits `loadBoard()`, then
   unconditionally displays success. Which change respects the function's Promise contract?
5. A stock panel's documented count permits zero, but a reviewer copies the game's positive-whole-number
   rule. Which decision follows the new contract?

## Recovery, evidence and teardown

Save source, the trial layout and evidence before replacing your request file, for example from
`starter/`:

```bash
attempt_dir=$(mktemp -d ../w2-06-attempt.XXXXXX) && cp src/request.ts trial-layout.json ../evidence.md "$attempt_dir/" && printf 'Preserved attempt: %s\n' "$attempt_dir"
```

Then copy [`checkpoint/request.ts`](checkpoint/request.ts) into `src/request.ts`. It fetches and checks
the shape and numeric floor, but leaves the occupancy relation for you; its partial acceptance is
labelled and does not count as completed work. Record independent, prompted, guided or not yet
demonstrated evidence separately from an unavailable environment.

Stop the server with Ctrl+C; it stops its owned API process. Generated `dist/`, `.runtime/`,
`supplied-runtime/bin/`, `supplied-runtime/obj/` and `test-results/` are disposable (`npm run clean`);
preserve `src/request.ts`, `trial-layout.json`, your evidence and saved attempts.
