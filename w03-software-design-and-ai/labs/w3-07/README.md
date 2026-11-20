# W3.07 · Model APIs and application boundaries

**Duration:** about 120 minutes, including one 45-minute code challenge and an 8-minute knowledge check.

An application can request a hint while someone plays the game. Its server must turn the current game
state into a bounded model request, await a response and return the application's documented envelope.
Today you implement one supplied adapter function and verify it with a stub before inspecting a prepared
live call (recorded or facilitator-run; no individual provider call is required).

## Outcomes

- Compare AI-assisted coding with a model call made by a running application.
- Describe the adapter's request lifecycle and identify the supplied routing and learner-owned function.
- Explain why provider calls and credentials remain on the server.
- Write the bounded adapter function against the documented input/output contract and verify it with the stub.

## Supplied and owned

| Path | Role |
|---|---|
| `starter/src/request-hint.ts` | **You own `requestHint`** (starts by throwing its missing-implementation error) |
| `starter/src/contracts.ts` | Supplied types: `HintInput`, `ModelClient`, `Hint`, `Envelope` |
| `starter/src/handler.ts` | Supplied `handleHint`: checks the request, derives permitted actions from the rules, calls `requestHint`, guards the response, falls back |
| `starter/src/server.ts`, `starter/browser/client.mjs` (`askForHint`) | Supplied route `POST /api/hint` and browser client |
| `starter/src/validation.ts`, `starter/src/clients.ts`, `starter/src/rules.ts` | Supplied guard and fallback, deterministic stub clients, game rules |
| `starter/tests/function.test.mjs` (2), `boundary.test.mjs` (5), `projection.test.mjs` (2) | Fixed checks (nine in all) |
| `starter/fixtures/changed-input.json` | The changed input with display-only nested fields |
| `demo/src/request-hint.ts` | Complete clean-input demonstration (worked example 2) |
| `live/README.md` | Prepared live demonstration notes (facilitator-side; not required) |
| `check.py`, `Makefile`, `package.json` | Runner: compiles a fresh temporary copy, runs the named checks, removes the copy |

## Prerequisites and setup

Node 22.23.2 / npm 10.9.8, TypeScript 5.9.3, Python 3 and Make (prepared environment). Work in a copy of
this lab. Once per copy: `npm ci` (installs the pinned TypeScript compiler into this lab directory).

From the lab root:

```bash
make test
```

The supplied starter compiles but throws its missing-implementation error; the command fails. The Make
wrapper reports exit 2 for that failed recipe, while `python3 check.py starter` directly reports exit 1.
Both refer to the same failing Node checks. Without make (Windows): `python check.py starter`,
`python check.py demo`, `python check.py timeout`.

## Retrieve and predict

W3.02–W3.06 supplied the wall correction, specifications, assisted-change checks, review scope and
collaboration checks. **Predict:** a developer asks an assistant to edit a function; later a player clicks
Hint in the running game. Name the caller in each case and predict whether a developer's source files
belong in the player's hint request.

## Follow one request across the boundary

```
browser askForHint
  →POST /api/hint
  →supplied server + handleHint
  →requestHint(input, client)
```

```
→supplied ModelClient
```

```
←Envelope→supplied guard→browser
```

`requestHint(input, client)` is the function you own; the supplied `ModelClient` is the stub here (or a
prepared live client). The same `requestId` must return with this request's response. The model does not
need that identifier, so the adapter keeps it for the envelope and leaves it out of model context.

`HintInput` contains `requestId`, `game` and `allowedActions`. The documented game context is `boardId`, a
`position` with numeric `x` and `y`, and `movesRemaining`. An allowed action contains only `type: 'move'`
and a permitted `direction`. Your function returns `{ hint, source: 'model', requestId }`; the handler owns
fallback behaviour. Credentials belong to the server-side client: browser JavaScript is delivered to the
person using the browser, whatever a variable is called.

## Worked example 1: trace a complete stub request

Run `make demo` (or `python check.py demo`). It compiles the complete demonstration function in a fresh
temporary directory and runs two function checks plus five boundary checks. The boundary test sends an
actual loopback HTTP request through `askForHint`, the server, handler and function; only the model
response is controlled. For the initial state the observed model payload is:

```json
{
  "context": {
    "boardId": "reference",
    "position": {"x": 0, "y": 0},
    "movesRemaining": 6
  },
  "allowedActions": [
    {"type": "move", "direction": "east"},
    {"type": "move", "direction": "south"}
  ]
}
```

The stub returns east with "Explore the open eastern square."; the envelope has that hint,
`source: 'model'` and the server's request identifier. A second request at (2, 1) with three moves allows
north and south; the unchanged east stub is outside that set, so the handler returns `source: 'fallback'`
with north and the second request's own identifier.

```bash
make demo
# tests 7
# pass 7
# fail 0
PASS local controlled-response checks
```

## Worked example 2: implement the documented mapping

The complete demonstration in `demo/src/request-hint.ts` removes the missing-implementation error for
the clean nested inputs:

```ts
import type { Envelope, HintInput, ModelClient } from './contracts.js';
export async function requestHint(input: HintInput, client: ModelClient): Promise<Envelope> {
  const hint = await client({
    context: { boardId: input.game.boardId, position: { ...input.game.position },
    movesRemaining: input.game.movesRemaining },
```

```ts
    allowedActions: input.allowedActions.map(action => ({ ...action }))
  });
  return { hint, source: 'model', requestId: input.requestId };
}
```

`await` obtains the resolved hint before constructing the envelope; the function calls the injected client
once and preserves the caller's input. A TypeScript annotation does not remove additional properties that
exist in an object at runtime.

**Prepared live path:** see [`live/README.md`](live/README.md). This repository contains no live client,
credential or provider configuration; any live observation is facilitator-run and must be labelled with
its date and execution type. Compare it with the contract, not with the stub's exact explanation.

## Guided practice

1. **Follow data with a partner.** One partner follows position and moves remaining into model context;
   the other follows the request identifier back to the browser. Then name a browser-state field the
   model does not require, and the supplied component that derives permitted actions (`allowedActions` in
   `src/rules.ts`, called by `handleHint`).
2. **Interpret a delayed response.** Run `make timeout` (`python check.py timeout`). A hanging stub
   reaches the handler and triggers the reference two-second timeout; the public result is the permitted
   fallback with the same identifier and the input state is unchanged.
3. **Distinguish shape from usefulness.** One prepared response requests a direction outside the allowed
   set; another requests permitted east but explains "Bananas are yellow." Predict which the guard
   rejects, then read the boundary test. The guard checks a nonempty explanation of at most 160
   JavaScript string units; it does not measure usefulness. Extra response fields are omitted.

## Lab challenge: implement the model-call adapter (45 minutes)

The starter adds a changed input containing display-only properties inside position and action objects
(`starter/fixtures/changed-input.json`). Select the documented leaf fields without changing types,
routing or tests.

1. **Establish the boundary — 5 min.** Find `requestHint` and trace its input from the supplied handler.
   Identify the client argument, expected model payload and public envelope. Confirm the starter failure
   and locate the complete demonstration in `demo/`.
2. **Diagnose the changed input — 8 min.** Predict which values the demonstrated spreads will send to the
   model. Compare the contract with the exact payload assertions in `starter/tests/projection.test.mjs`.
   Explain why removing only top-level extra properties would leave the nested case unresolved.
3. **Implement the bounded function — 12 min.** Edit only `starter/src/request-hint.ts`. Select the
   documented fields, call the client once, await its actual hint and return it with `source: 'model'`
   and the current request identifier. Preserve the input; keep the signature.
4. **Verify — 12 min.** Run `make test` and inspect the nine tests: two ordinary function examples, five
   boundary checks and two nested-field checks must pass.
5. **Explain and hand over — 8 min.** Each learner traces one request from the browser through the server
   and owned function, names the fields sent to the client and explains the envelope; name where a
   prepared live client would hold authentication (the server-side client) and one limit of stub evidence.

## Acceptance criteria

- I change only the supplied `requestHint` function and preserve its signature.
- My client payload contains the documented context and action fields, including under the changed nested input.
- I call the supplied client once, await its actual hint and return the current request identifier without mutating input.
- All nine current stub/boundary checks pass, including the direct and handler nested-field cases.
- I explain the browser, supplied routing, owned function and server-only credential boundary individually.
- My result distinguishes actual controlled checks, the prepared live observation and any remaining execution limitation.

## Hints

- **Hint 1** (after recording your predicted payload): print or read `client.calls` in the failing
  projection test — which object holds `displayLabel`?
- **Hint 2:** a failing `requestId` or `hint` assertion is a return-path failure; a failing `calls`
  assertion is a mapping failure. Fix one at a time.
- **Hint 3:** start from `position: { x: input.game.position.x, y: ... }` and map each action to
  `{ type: ..., direction: ... }`.

## Knowledge check (8 minutes, individual; record a reason)

1. A developer uses OpenCode to edit a game function on Monday. On Tuesday a player clicks Hint and the
   running server asks a model for a permitted move. Which description correctly distinguishes the two events?
   A) Both are source-editing operations because the same model service can answer them. B) Monday's request
   assists development; Tuesday's request supplies input to a running feature. C) Tuesday's request is a test
   result because its response is JSON. D) Monday's reviewed edit proves that every Tuesday hint will satisfy the game contract.
2. The browser posts game state to `/api/hint`. The supplied handler derives allowed actions and calls
   `requestHint(input, client)`. Which change stays within the documented ownership boundary?
   A) Replace the browser request with a provider call and return its raw response. B) Rewrite the supplied
   route to generate the hint without calling the adapter. C) Implement `requestHint` to select model fields,
   await the injected client and return the current envelope. D) Edit the tests to accept a fixed request identifier for every request.
3. A teammate proposes putting the broker password in a browser variable called `privateToken` so
   `askForHint` can send it with game context. What should the review conclude?
   A) Keep authentication in the supplied server-side client; browser-delivered variables remain visible
   regardless of their names. B) Accept the change because a private-sounding name prevents browser access.
   C) Accept the change if the password is placed inside a nested JSON object. D) Put the password in the returned hint so later requests can reuse it.
4. A function compiles and passes two clean-input examples. A new fixture adds `position.displayLabel`, and
   the stub records that label in model context. Which conclusion and next action fit the evidence?
   A) Compilation proves that the label was removed; ignore the recorded payload. B) Replace the stub with a
   live call, because a provider will necessarily discard the label. C) Delete the exact-payload assertion so
   the clean examples remain green. D) Select the documented leaf fields in the function and rerun ordinary and changed-input checks.

## Recovery and teardown

Save your owned function outside the lab copy, obtain a fresh lab copy, put the function back at the same
starter path and rerun `make test`. Do not copy generated `dist/` output or edit a fixture. Nothing keeps
running after the checks; `check.py` removes its temporary `.check-*` directory.

## Optional extension

Explain how your implementation would behave if a display property appeared at another nesting level.
Predict the client payload without adding a schema, parser or second challenge.
