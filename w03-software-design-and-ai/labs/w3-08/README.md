# W3.08 · Reliable responses and evaluation

**Duration:** about 120 minutes, including one 45-minute code challenge and an 8-minute knowledge check.

A model request can complete successfully while its answer remains unsuitable for the game. Parsing,
response validation, permitted-action checks and human evaluation establish different things. Today you
implement the bounded response checks and fallback, run the supplied cases and add a repeatable check
supporting a state-specific explanation review.

## Outcomes

- Explain why successful model execution and valid JSON do not guarantee domain-correct or useful output.
- Describe the supplied evaluation cases and the independent rule-based expectations they check.
- Write response validation and fallback handling against the prepared response and failure examples.
- Create repeatable checks for the agreed response shape and permitted advice using the stub.

## Supplied and owned

| Path | Role |
|---|---|
| `starter/src/validation.ts` | **You own `validHint` and `fallbackHint`**; `isRecord`, `isDirection` and the constants are supplied |
| `starter/tests/review.test.mjs` | **You own exactly one awaited review check** |
| `starter/tests/evaluation.test.mjs` | Fixed 24 checks across H01–H06 |
| `starter/fixtures/schema.json` | The agreed response contract (documentation; no schema library) |
| `starter/src/handler.ts`, `request-hint.ts`, `clients.ts`, `rules.ts` | Supplied handler, W3.07 context mapping, controlled clients/transports, rules |
| `demo/src/validation.ts` | Complete demonstrated validator and fallback |
| `check.py`, `Makefile` | `make test`, `make demo`, `make malformed` (or `python check.py <name>`) |

## Setup

Node 22.23.2, TypeScript 5.9.3, Python 3 and Make, in a copy of the lab; `npm ci` once in the lab root.

```bash
make test
```

The starter compiles, then fails behavioural assertions: its guard rejects everything, its fallback is
incomplete and its review check deliberately requests a selected contrast. Make reports exit 2 for the
failed recipe; `python check.py starter` returns the underlying failed Node status (1).

## Predict what a green request proves

A response arrives with HTTP success and parses as JSON. It says to move west from the starting edge.
Another recommends permitted east but explains "Bananas are yellow." Predict what the runtime does with
each, then name the extra judgment needed before calling either useful game advice.

Syntax is only the first distinction:

```js
JSON.parse('{not json'); // throws SyntaxError
JSON.parse('null');
```

```js
JSON.parse('[]');
```

A TypeScript assertion such as `as Hint` performs no runtime check. The supplied `isRecord` excludes
null and arrays before nested property access.

## Validate structure, then game relevance

Check non-null, non-array response and action objects; require action type `move`, a known direction and
a string explanation that is nonempty after trimming and no longer than 160 JavaScript string units
(original `.length`, no silent trimming). Then check membership in the independently derived allowed list
(the handler calls the rule helper; north/east/south/west order). From (1, 0) south enters the wall at
(1, 1), so it is excluded although `south` is a valid direction value. Extra response fields may be present;
the handler projects only the required hint fields. Usefulness needs a separate human review; do not add
keyword rules.

## Worked example 1: reject malformed output

Run `make malformed` (`python check.py malformed`). The prepared transport returns the literal text
`{not json`; the client's `response.json()` rejects; the handler's catch path returns the deterministic
fallback with the current request identifier. The configured HTTPS-shaped URL is never contacted. Observed
envelope:

```json
{
  "hint": {
    "action": {"type": "move", "direction": "east"},
    "explanation": "A permitted next move."
  },
  "source": "fallback",
  "requestId": "request-H03-malformed"
}
```

The complete example (`demo/src/validation.ts`) implements `validHint` and `fallbackHint` in one small
module. Fallback selects the first permitted action with "A permitted next move.", or a null hint when no
action exists (the handler then makes no client call).

## Worked example 2: run the agreed evaluation set

Run `make demo`. The complete implementation executes 24 checks across six case families:

| Case | Controlled candidate or event | Runtime expectation |
|---|---|---|
| H01 | Well-shaped permitted hint | Accept model hint |
| H02 | Well-shaped illegal direction | Deterministic fallback |
| H03 | Malformed or invalid response | Deterministic fallback |
| H04 | Timeout or provider failure | Deterministic fallback |
| H05 | No permitted action | Null hint; zero client calls |
| H06 | Legal action, irrelevant explanation | Runtime may accept; human review required |

```bash
# tests 24
# pass 24
# fail 0
PASS controlled response evaluation; no provider call.
```

The H06 stub returns permitted east with "Bananas are yellow."; runtime accepts it, and the recorded human
review rejects the explanation. A controlled revised example ("Moving east approaches the treasure at
(2, 0).") passes the same runtime checks. Passing the set establishes the named behaviours for these
fixtures, not real model quality.

## Guided practice

1. **Classify the evidence:** parsing `null` succeeds; a valid direction is absent from the allowed list;
   a legal action has an unrelated explanation. Name the check and predict model or fallback.
2. **Read H04 and H05:** H04 makes one controlled client attempt, observes the abort and returns
   fallback; H05 returns a null hint with zero client calls. Locate the no-action branch in `handler.ts`.
3. **Make a usefulness claim reviewable:** replace "The hint is useful because all tests passed." with a
   claim tied to a specific state, action and consequence.

## Lab challenge: validate and assess the same hint (45 minutes)

1. **Identify the existing contract — 5 min.** Find the handler, client, W3.07 mapping and rules; confirm
   the starter failure.
2. **Choose a useful input contrast — 8 min.** For east with "Moving east collects the treasure now.",
   choose two valid states where east is permitted with different consequences. Record states, expected
   next position/collection, predicted runtime result and human verdict with a reason **before running**
   (in the comment block of `tests/review.test.mjs`).
3. **Implement — 12 min.** Complete `validHint` and `fallbackHint`; implement exactly one awaited check in
   `starter/tests/review.test.mjs` that exercises the supplied handler and stub, asserts the predicted
   public results and unchanged request input, and compares the pure rule consequence with your
   independent expectations.
4. **Verify and review — 12 min.** Run `make test`: 24 fixed checks plus your one review check. Then review
   the human labels against the observed consequences; a printed "yes" can be wrong while assertions pass.
5. **Explain — 8 min.** Show the H02 rejection of a structurally valid illegal direction, then your
   state-specific review: expectation source, supporting/contradicting observation and one limit.

## Acceptance criteria

- I edit only the two exported functions in `starter/src/validation.ts` and the single check in `starter/tests/review.test.mjs`.
- My validator checks the documented shape/content and independently permitted action without changing the response schema.
- My fallback preserves the request identifier, returns the first permitted action or null, and works with the supplied no-call branch.
- All 24 fixed checks pass, including valid output, illegal advice, malformed content, timeout/failure, no-action completion and legal but weak H06.
- My one repeatable check executes two independently chosen valid states, checks actual outcomes against prior expectations and preserves request input.
- My human verdicts and reasons assess the candidate's state-specific claim separately from runtime acceptance.
- My individual explanation rejects a structurally valid illegal action, identifies the expectation source and states an evidence limit.

## Hints

- **Hint 1 (judgment boundary):** the runtime decides shape and permission; your verdict decides whether
  "collects the treasure now" is true in each state.
- **Hint 2 (intermediate state):** t1 is at (2, 0). Which starting squares have east leading into it?
- **Hint 3 (partial operation):** `const next = evaluate(REFERENCE_BOARD, state, envelope.hint.action).state;`
  then compare `next.position`, `next.collected` and `next.score` with your written expectation.

## Knowledge check (8 minutes)

1. The supplied client receives HTTP success and parses the text `null` without a syntax error. A teammate
   says the response is now a valid hint. Which conclusion follows? A) HTTP success proves that every required
   hint field exists. B) A TypeScript assertion to `Hint` will add the missing action and explanation.
   C) Every parsed JSON value can be inspected as a non-null hint record. D) Parsing succeeded, but the value still fails the documented hint shape.
2. H02 proposes a well-shaped south action from a state whose allowed list contains east and west. H06
   proposes a permitted action with an irrelevant explanation. Which expected pair preserves the agreed
   cases? A) Accept both automatically because each explanation is a string. B) H02 returns fallback; H06 may
   pass runtime checks and needs a separate human usefulness judgment. C) Accept H02 because south is a known
   direction, and reject H06 by matching an irrelevant keyword. D) Ask the model to decide which response the tests should accept.
3. The abort-aware controlled transport rejects after its configured timeout while the game still has
   permitted actions. What should the public handler's check expect? A) A deterministic permitted fallback
   envelope with the current request identifier. B) An unhandled rejection. C) A new model request repeated
   until a preferred hint appears. D) A null hint in every failure case, even when permitted actions remain.
4. A learner's stub check verifies the envelope and game consequence and prints `useful: yes`, a value
   written in the case record. The command passes. What remains necessary? A) Treat every printed value as
   independently verified. B) Replace the stub with a live request so the model can grade the label.
   C) Review the human verdict and reason against the specific claim and observed game evidence. D) Remove the game-consequence assertions.

## Recovery

Save your two owned files and failed output outside the lab copy; obtain a fresh copy, restore only those
two files and rerun. Do not overwrite your attempt with the demo, copy generated output or change fixed
expectations.

## Optional extension

Propose one more plausible explanation and name the evidence that would make its claim assessable.
