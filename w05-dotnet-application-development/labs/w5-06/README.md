# W5.06 · Write rejected-flow integration tests

**Session:** W5.06 · API integration tests · 120 minutes
**Driving question:** What does an API integration test exercise?

One challenge · 45 minutes owned work inside the 120-minute module: 10 minutes retrieval/prediction,
20 concepts and syntax, 20 two worked demonstrations, 45 the practical challenge, 15
comparison/repair, 10 individual knowledge check.

## Outcomes

* Explain which real boundaries an HTTP integration test reaches: routing, JSON parsing, dependency
  injection, the real rule library and the selected store (SQLite), through a real Kestrel process.
* Start the test application with known data: a new workspace database, the existing migration
  applied explicitly, processes stopped in `finally`.
* Test a complete game-session flow with `HttpClient.PostAsJsonAsync`, `JsonNode` and
  `JsonNode.DeepEquals`.
* Verify error responses and the absence of unwanted state changes with an independent GET.

## Supplied and owned

**Owned scope: `Tests/Program.cs`: domain rejection and malformed JSON assertions; the host/database
launcher is supplied** (`run.py`, `Tests/FixtureSupport.cs`, the accepted-flow statements and the
atomic save check). The starter's owned block is a deliberate failing `Check(false, "Complete owned
rejected-flow assertions")`, so the first run exits nonzero.

## Starting point

Start in the academy repository root (the course `source/` folder) in the prepared shell (.NET SDK
10.0.401, Node/tsc, Python 3, Playwright/Chromium). Read the package manifest and commands
([assets/integrated-release/README.md](../../assets/integrated-release/README.md)).

The book prints the first command wrapped across two lines:

```bash
export W5_PACKAGE="$PWD/learner/units/w05-dotnet-application-development/assets/integrated-
    release"
```

Type it as **one line** (the folder is `integrated-release`):

```bash
export W5_PACKAGE="$PWD/learner/units/w05-dotnet-application-development/assets/integrated-release"
export W5_ATTEMPT="$(mktemp -d)"
```

Keep this terminal and the printed attempt path. New paths preserve earlier evidence. A setup failure is
not a learner result: use the offline trace, retain the error and ask the facilitator to restore the
prepared dependency.

## Concepts and syntax

`HttpClient.PostAsJsonAsync` serialises an object; `await` waits for the HTTP result. `StatusCode` is
an enum, so `(int)response.StatusCode` compares its numeric value. `JsonNode.Parse` builds a JSON tree;
`node["state"]` selects a property; `GetValue<T>()` reads a typed scalar. `JsonNode.DeepEquals`
compares every nested field without depending on property order. A raw `StringContent` containing `{`
is malformed JSON (serialising an object cannot create malformed syntax). The supplied `Check` method
throws on false, giving a nonzero process exit.

## Worked demonstrations

Scripts: [examples/w5-06](../../examples/w5-06/README.md).

### Demo 1 · run the complete accepted-flow and rejection example

```bash
python3 "$W5_PACKAGE/run.py" test --workspace "$W5_ATTEMPT/demo-tests"
```

Expect create 201, legal action 200, x=1/five moves, and subsequent stored-state equality. Read the
supplied `Tests/Program.cs` accepted-flow statements as they execute.

### Demo 2 · expose the owned missing test scope

```bash
python3 "$W5_PACKAGE/prepare.py" 06 "$W5_ATTEMPT/owned"
python3 "$W5_PACKAGE/run.py" test --source "$W5_ATTEMPT/owned" --workspace "$W5_ATTEMPT/before"
```

Expect a nonzero exit with `Complete owned rejected-flow assertions`. The starter is deliberately
incomplete. Compare the complete example's 409 wall and 400 malformed responses, each followed by an
unchanged GET.

Offline trace: POST East 200/F02; POST South 409/`ILLEGAL_ACTION`; GET F02 unchanged; malformed `{`
400/`INVALID_REQUEST`; GET F02 unchanged.

## Practical challenge

Replace the TODO/throw in `$W5_ATTEMPT/owned/Tests/Program.cs` with your own assertions for South
after East and raw malformed JSON. For each, check status, exact code, a non-empty requestId and every
subsequent state field. Run again with `--workspace "$W5_ATTEMPT/after"`:

```bash
python3 "$W5_PACKAGE/run.py" test --source "$W5_ATTEMPT/owned" --workspace "$W5_ATTEMPT/after"
```

Add one independently chosen malformed shape or completed-session rejection case with a justified
expected state. Keep the first failed exit and the passing run. Do not alter routes to satisfy a
mistaken assertion.

### Acceptance criteria

* `before` exits nonzero with `Check failed: Complete owned rejected-flow assertions`.
* `after` prints `PASS HTTP integration tests` and `PASS run.py test`.
* Your assertions cover: South after East → 409 `ILLEGAL_ACTION`; raw `{` → 400 `INVALID_REQUEST`;
  each with a non-empty `requestId` and `JsonNode.DeepEquals` against a fresh GET; plus one case you
  chose and justified.
* Deliberately changing one expected value makes the run fail; restoring it passes again.

## Staged hints

1. Capture the confirmed envelope before making a rejected request.
2. Use StringContent for malformed JSON; serialising an object cannot create malformed syntax.
3. Check response and JsonNode.DeepEquals against a fresh GET; the expected error codes are
   INVALID_REQUEST and ILLEGAL_ACTION.

## Check and recovery

Show isolated database paths (`<workspace>/data/game.db`) and your owned assertions; deliberately
change one expected value to prove the test fails, then restore it and retain the result. Record it in
[evidence.md](evidence.md).

If blocked, preserve the attempt and commands first. Use a new prepared copy for comparison, then
explain the difference before applying a repair to your owned work. Do not replace your evidence with
an instructor result. Record who helped, what you changed and what you can now explain independently.

**Teardown:** `run.py` stops its own processes. Workspaces under `$W5_ATTEMPT` hold your logs and
databases; remove them only after recording evidence.

## Individual knowledge check

1. Name three real boundaries reached by this HttpClient test.
2. Why does each test attempt need a separate SQLite file and generated session?
3. Explain PostAsJsonAsync, await and JsonNode.DeepEquals in the accepted flow.
4. A rejected action returns 409 but consumes a move. Which assertion detects it?
5. Individually add or show one rejected-flow assertion and explain why the subsequent GET is
   necessary.
