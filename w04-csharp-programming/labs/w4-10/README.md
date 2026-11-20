# W4.10 lab · Extend the shared comparison and package the library

**Session:** W4.10 Project preparation: translating rules and checking parity · One 45-minute practical challenge
within the 120-minute module (10 retrieval and prediction, 20 concepts, 20 demonstrations, 45 challenge,
15 comparison and repair, 10 knowledge checks and recovery). Continue into P4 afterwards.

## Outcomes

* Decide which rules belong in a C# domain library and which effects stay outside it.
* Map state and actions between TypeScript, JSON and C# (camelCase external names).
* Explain behavioural parity and check it against independent fixtures.
* Build the API skeleton against the library and name the integration seam.

## What the starter is

The supplied **teaching checkpoint** contains the complete reference rule engine (`Rules/`), console runner
(`ConsoleApp/`), the 13 shared JSON fixtures (`fixtures/`, byte-identical to `source/shared/fixtures/treasure/`
plus `board-reference.json`), a TypeScript comparison runner (`typescript/`), `compare.py` and a compiling API
skeleton (`ApiSkeleton/`). It is supplied for studying a boundary and for recovery; using it unchanged is not
independent completion of P4.

## Start and ownership

Use the academy shell prepared in W4.01: .NET SDK 10.0.401, Node 24.13.0 and Python 3 (`dotnet --version`,
`node --version`). The authoring repository's `source designer/build/tooling/environment.sh` is not published;
use [environment.sh](environment.sh). Commands begin at the repository root — the **`source/`** folder here.

**You edit:** `ConsoleApp/Program.cs` — complete the serialization line. Add one fixture under `fixtures` and an
annotation note (`ANNOTATION.md`). Keep library/adapter plumbing supplied.

```bash
cd learner/units/w04-csharp-programming/labs/w4-10/starter
python3 compare.py fixtures/F02.json
```

(Windows: `py -3 compare.py fixtures/F02.json` or `python compare.py ...`.)

**Initial behaviour.** The starter builds but the comparison FAILs because its first output line is `{}` (every
C# field shows `(missing)`). The fixture report below it can still say `PASS`: that does not mean the external
serialization mapping passed.

### The TypeScript side

`compare.py` runs `node typescript/src/runner.ts <fixture>`: Node 24 runs this erasable-syntax TypeScript
directly (Node ≥ 22.18). To type-check or compile with the pinned TypeScript 5.9.3:

```bash
cd typescript && npm ci && npm run typecheck && npm run build && cd ..
python3 compare.py --ts-dist          # uses typescript/dist/runner.js
```

## Concepts

The domain library owns accepted actions, constraints, progress and completion: it takes board, current state and
action and returns acceptance, resulting state and a rejection reason — no rendering, sound, keys or HTTP.

TypeScript `position: { x: number; y: number }` ↔ JSON `"position":{"x":1,"y":0}` ↔ C# `Position(1,0)`. C# records
use `Position`, `X`, `Y`; external JSON uses camelCase. The provided options read names case-insensitively and
write camelCase — read [Mapping.cs.example](starter/Mapping.cs.example):

```csharp
string json = JsonSerializer.Serialize(actual, FixtureLoader.Json);
```

The external action is `{ "type": "move", "direction": "east" }` — a request, not an asserted new score. The
shared contract's names: `collected` (the book's `CollectedTreasureIds`), `movesRemaining`, `status`
(`playing`/`won`/`lost`). A missing direction deserialises as null and the rules reject it — the contract reason is
`INVALID_ACTION` (the API reports it as 400 `INVALID_REQUEST`). The TypeScript adapter normalises an omitted
reason to JSON null.

Parity: the same input produces the agreed observable outcomes (acceptance, reason, position, treasure IDs, score,
remaining moves, status). `compare.py` compares parsed JSON objects (property order is irrelevant) with each
fixture's independently authored expected object; a nonzero result stops a release check. The TypeScript runner
uses the fixed reference board — keep it unchanged for this module.

`ApiSkeleton/Program.cs` holds `RuleBoundary.Apply(board, storedState, action)`, which delegates to
`Rules.EvaluateMove` through a project reference; its only live route is `/health`.

Demonstrations (F02 annotation; F07 with a temporary completion-priority mutant):
[../../examples/w4-10/](../../examples/w4-10/README.md).

## Work through the challenge

Spend 5 minutes predicting/reproducing, 25 implementing and checking, 10 comparing a normal and boundary path,
and 5 capturing your explanation.

1. Annotate `position`, `movesRemaining`, collected treasure IDs and `direction` across TS, JSON and C# in F02 (use
   `ANNOTATION.md`). Read `Mapping.cs.example`.
2. Replace `{}` with serialization of `actual` using the supplied camelCase options. Run F02, then the complete
   suite: `python3 compare.py`.
3. Author one new two-action fixture (for example returning to the start) as `fixtures/L01.json`, using an
   `"actions"` array applied in order from `"state"` (null = initial state). Calculate the expected state from the
   contract before running either implementation. Keep the reference board fixed.
4. Demonstrate one controlled mismatch, restore correctness and build the skeleton:
   `dotnet build ApiSkeleton/ApiSkeleton.csproj`. Name the library function and inputs the future API needs.

## Completion and individual evidence

All thirteen shared cases and your extra comparison pass (`14/14 fixtures: C# and TypeScript both match the
expected result`); the API skeleton builds. The annotation distinguishes C# names from external field names. Each
learner identifies a mismatching field and shows the trusted-state/action-only boundary. Submit changed source,
exact commands and observed outcomes using [evidence.md](evidence.md).

## Hints and recovery

* **Hint 1.** The console's line 1 is what `compare.py` parses; the PASS line underneath is the console's own check.
* **Hint 2.** Without the options, `JsonSerializer.Serialize(actual)` writes `Accepted`, `State` — compare the field names.
* **Hint 3.** For your fixture, copy F02's shape, set `"state": null`, replace `"action"` with `"actions": [...]` and
  write the expected object by hand.

Preserve failed output before correcting a defect: a final PASS alone does not show diagnosis. Open a fresh starter
and isolate one failing command if needed.

## Knowledge check

1. Map C# MovesRemaining to the JSON and TypeScript field names.
2. Both implementations agree on lost for F07. Is that sufficient parity evidence?
3. Which inputs belong at the rule-library boundary?
4. Why should a browser action not include an asserted new score?
5. Does building ApiSkeleton mean the session API is implemented?
