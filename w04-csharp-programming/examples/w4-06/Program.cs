// W4.06 complete demo: typed list, dictionary lookup, LINQ queries and their equivalent loops.
// Run from this directory:  dotnet run --project Probe.csproj --disable-build-servers
using TileQueries;

int passed = 0;
int failed = 0;

// ---- Demo 1: a typed list and a dictionary keyed by tile ID --------------------------------
List<Tile> tiles = new List<Tile>();
tiles.Add(new Tile("treasure-1", "treasure"));
Dictionary<string, Tile> byId = new Dictionary<string, Tile>();
byId.Add("treasure-1", tiles[0]);

tiles.Add(new Tile("wall-1", "wall"));
tiles.Add(new Tile("treasure-2", "treasure"));
byId.Add("wall-1", tiles[1]);
byId.Add("treasure-2", tiles[2]);

Console.WriteLine("Demo 1: dictionary lookup (TryGetValue) and the loop-support version (ContainsKey)");
Same("present treasure-1", Queries.Lookup(byId, "treasure-1"), "treasure");
Same("absent absent", Queries.Lookup(byId, "absent"), "missing");
Same("loop version present", LoopQueries.Lookup(byId, "treasure-1"), "treasure");
Same("loop version absent", LoopQueries.Lookup(byId, "absent"), "missing");
Same("matching treasure (query)", Show(Queries.MatchingTiles(tiles, "treasure")), "[treasure-1, treasure-2]");
Same("matching treasure (loop)", Show(LoopQueries.MatchingTiles(tiles, "treasure")), "[treasure-1, treasure-2]");
Same("array input also accepted", Show(Queries.MatchingTiles(tiles.ToArray(), "wall")), "[wall-1]");

// ---- Demo 2: filter, order and project scores ----------------------------------------------
Console.WriteLine();
Console.WriteLine("Demo 2: score summary (query and loop on the same data)");
List<ScoreEntry> scores = [new("Ada", 10), new("Ben", 30), new("Cy", 20), new("Dee", 0)];
List<ScoreEntry> ties = [new("A", 20), new("B", 20), new("C", 10)];
Same("minimum 10 (query)", Show(Queries.ScoreSummary(scores, 10)), "[Ben:30, Cy:20, Ada:10]");
Same("minimum 10 (loop)", Show(LoopQueries.ScoreSummary(scores, 10)), "[Ben:30, Cy:20, Ada:10]");
Same("minimum 30", Show(Queries.ScoreSummary(scores, 30)), "[Ben:30]");
Same("minimum 40", Show(Queries.ScoreSummary(scores, 40)), "[]");
Same("ties keep input order (query)", Show(Queries.ScoreSummary(ties, 0)), "[A:20, B:20, C:10]");
Same("ties keep input order (loop)", Show(LoopQueries.ScoreSummary(ties, 0)), "[A:20, B:20, C:10]");

// A saved summary was evaluated before Eli 40 was added; a fresh call sees Eli.
string[] saved = Queries.ScoreSummary(scores, 10);
scores.Add(new ScoreEntry("Eli", 40));
Same("saved summary after adding Eli 40", Show(saved), "[Ben:30, Cy:20, Ada:10]");
Same("fresh call after adding Eli 40", Show(Queries.ScoreSummary(scores, 10)), "[Eli:40, Ben:30, Cy:20, Ada:10]");
Same("original list not sorted in place", string.Join(",", scores.Select(s => s.Player)), "Ada,Ben,Cy,Dee,Eli");

Console.WriteLine();
Console.WriteLine($"Demo checks: {passed}/{passed + failed} passed");
return failed == 0 ? 0 : 1;

void Same(string label, string actual, string expected)
{
    bool ok = actual == expected;
    if (ok) passed++; else failed++;
    Console.WriteLine(ok ? $"  PASS {label}: {actual}" : $"  FAIL {label}: expected {expected}, actual {actual}");
}

static string Show(string[] values) => "[" + string.Join(", ", values) + "]";
