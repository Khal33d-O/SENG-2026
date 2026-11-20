# W4.06 · Select tiles and summarise scores

**Session:** W4.06 Collections, generics and LINQ · **Module:** 120 minutes (47 teaching and demos, one
45-minute challenge, 20 comparison and repair, 8 knowledge check)

Monday's typed list held several values in order. Today you select tile IDs and turn scores into an ordered
summary: small in-memory collections of familiar game data.

## Outcomes

* Describe typed lists, dictionaries and generic collection interfaces.
* Explain filtering, projection and ordering.
* Write a LINQ query using them.
* Compare its results and clarity with an ordinary loop.

## Supplied and owned

| Supplied (keep unchanged) | You own |
|---|---|
| `Probe.csproj`, `global.json`, `Models.cs` (`Tile`, `ScoreEntry`) | The three marked methods in `Queries.cs` |
| `LoopQueries.cs` — complete equivalent ordinary-loop implementation | One labelled assertion in `Program.cs` (task 4) |
| `Program.cs` — fixed assertions with independently stated expected arrays | Your trace and explanation in [evidence.md](evidence.md) |

The book's sample players (Ada, Ben, Cy, Dee, Eli; A, B, C) are fictional.

## Setup

Use prepared SDK 10.0.401 (local `global.json` rolls forward from 10.0.100), then run from `starter`:

```bash
dotnet run --project Probe.csproj --disable-build-servers
```

**Initial behaviour.** The starter compiles, returns empty query arrays and reports every dictionary key as
missing. It fails behaviour checks (`Assertions: 6/17 passed`) and exits 1. Preserve this initial observation.

## Required results

* `MatchingTiles(IEnumerable<Tile> tiles, string kind)` returns IDs whose kind equals the requested kind,
  retaining source order. Empty input or no matching kind produces an empty string array.
* `ScoreSummary(IEnumerable<ScoreEntry> scores, int minimum)` keeps rows with score at least the minimum,
  orders by numeric score descending, then returns `Player:Score` strings. Equal scores keep input order.
* `Lookup(Dictionary<string, Tile> tiles, string id)` returns the present tile's kind or `"missing"`.
* The methods do not mutate inputs; each query materialises its strings using `ToArray`.

For the supplied tiles, kind `treasure` selects `treasure-1, treasure-2`. Scores Ada 10, Ben 30, Cy 20, Dee 0 at
minimum 10 produce `Ben:30, Cy:20, Ada:10`. For A 20, B 20, C 10 at minimum 0: `A:20, B:20, C:10`.

## Syntax you will use (from the demos)

```csharp
List<Tile> tiles = new List<Tile>();
tiles.Add(new Tile("treasure-1", "treasure"));
Dictionary<string, Tile> byId = new Dictionary<string, Tile>();
byId.Add("treasure-1", tiles[0]);
```

```csharp
public static string Lookup(Dictionary<string, Tile> tiles, string id)
{
    if (tiles.TryGetValue(id, out Tile? tile)) return tile.Kind;
    return "missing";
}
```

```csharp
public static string[] MatchingTiles(IEnumerable<Tile> tiles, string kind)
```

A query and the same steps as a loop:

```csharp
return tiles.Where(tile => tile.Kind == kind)
    .Select(tile => tile.Id).ToArray();
```

```csharp
List<string> result = new List<string>();
foreach (Tile tile in tiles)
{
    if (tile.Kind == kind) result.Add(tile.Id);
}
return result.ToArray();
```

```csharp
return scores.Where(row => row.Score >= minimum)
    .OrderByDescending(row => row.Score)
    .Select(row => $"{row.Player}:{row.Score}").ToArray();
```

Complete demos: [../../examples/w4-06/](../../examples/w4-06/README.md).

## Work through one query task

1. **Predict and run — 5 minutes.** Write the treasure IDs and score summary before execution; separate
   intended wrong values from setup errors.
2. **Select IDs and look up a tile — 15 minutes.** Complete `MatchingTiles` (filter, project, materialise) and
   `Lookup` with a present/missing branch. Explain the `out` value before dereferencing it.
3. **Summarise scores — 10 minutes.** Inclusive filter, numeric descending order and string projection. The
   full `LoopQueries.cs` is supplied; you do not implement a sorting algorithm.
4. **Compare normal and boundary values — 10 minutes.** Run the fixed checks (empty/no-match, exact threshold,
   zero score, absent key, ties, materialisation). Add one labelled assertion before the summary for a
   different kind or minimum; predict the exact array and compare query and loop. Simple option: kind `wall`
   should return `wall-1`.
5. **Explain individually — 5 minutes.** Translate one query into the supplied loop: predicate,
   retained/projected value and ordering; say which is easier to explain and support it with a trace.

## Expected completion

The unextended reference runner passes **17/17** assertions and exits zero; your added check increases the
total. Two implementations agreeing on a wrong value would not satisfy the requirement.

## Hints

* **Hint 1 — name the steps.** Keep / change each element / order / make a definite array: which LINQ operator is each?
* **Hint 2 — boundary.** A missing minimum row points to `>` versus `>=`; names in the wrong order point to the ordering direction or key.
* **Hint 3 — dictionary.** `TryGetValue` returns false for a missing key; only read `tile.Kind` on the true branch.

## Repair from the requirement

An extra row points to the filter; a missing-key failure to dictionary access; if only the empty case fails,
check whether the implementation assumes an element exists. Keep original expected values while diagnosing.
For unavailable execution, keep the command and first error. Generated `bin/` and `obj/` are not hand-in files.

## Individual evidence

Retain the edited source, first prediction, final output, one added observation and your explanation (why a
row at the minimum is kept; why formatting before sorting could change the numeric order).

## Knowledge check

1. A function only needs to enumerate Tile objects supplied as a list or array. Which input type expresses that requirement?
2. Which pipeline produces `Player:Score` strings for scores at least ten, highest first?
3. `TryGetValue` returns false for a missing ID. What should this exercise's `Lookup` do?
4. A materialised score summary is saved, then a new high score is added to the input. Which account is correct?
