# W4.06 demos — dictionary lookup and score summary

From this directory:

```bash
dotnet run --project Probe.csproj --disable-build-servers
```

* **Demo 1: Add a dictionary lookup.** `Program.cs` creates the list, builds a dictionary for known tile IDs and
  checks the present `treasure-1` and absent `absent` keys with both `Queries.Lookup` (`TryGetValue`) and the
  loop-support `LoopQueries.Lookup` (`ContainsKey`, then `tiles[id]`). `missing` is a separate branch, not a
  guessed tile kind. A tile array is accepted by the same `IEnumerable<Tile>` method.
* **Demo 2: Filter, order and project scores.** Read `Queries.ScoreSummary` and `LoopQueries.ScoreSummary` side
  by side; both give `Ben:30, Cy:20, Ada:10` at minimum 10, `Ben:30` at 30, nothing at 40 and keep ties in input
  order. The saved summary evaluated before Eli 40 was added stays the same; a fresh call puts `Eli:40` first;
  the original list is not sorted in place.

Observed final line: `Demo checks: 16/16 passed`, exit 0.

`Queries.cs` here is the complete query version (the lab's solution shape); `LoopQueries.cs` is identical to the
lab's supplied loop file.
