// Supplied fixed assertions. Expected arrays are stated independently of either implementation:
// do not change them to agree with faulty output. Add your one labelled assertion where marked.
using TileQueries;

int passed = 0;
int failed = 0;

// ---- Supplied fixtures (fictional sample data) ---------------------------------------------
List<Tile> tiles =
[
    new("start-1", "start"),
    new("treasure-1", "treasure"),
    new("wall-1", "wall"),
    new("treasure-2", "treasure"),
    new("exit-1", "exit"),
];
Dictionary<string, Tile> byId = new Dictionary<string, Tile>();
foreach (Tile tile in tiles) byId.Add(tile.Id, tile);

List<ScoreEntry> scores =
[
    new("Ada", 10),
    new("Ben", 30),
    new("Cy", 20),
    new("Dee", 0),
];
List<ScoreEntry> ties = [new("A", 20), new("B", 20), new("C", 10)];
string tilesBefore = string.Join(",", tiles);
string scoresBefore = string.Join(",", scores);

// ---- Matching tiles -------------------------------------------------------------------------
Expect("tiles: kind treasure", Queries.MatchingTiles(tiles, "treasure"), ["treasure-1", "treasure-2"]);
Expect("tiles: no matching kind", Queries.MatchingTiles(tiles, "door"), []);
Expect("tiles: empty array input", Queries.MatchingTiles(Array.Empty<Tile>(), "treasure"), []);

// ---- Score summary --------------------------------------------------------------------------
Expect("scores: minimum 10 (inclusive)", Queries.ScoreSummary(scores, 10), ["Ben:30", "Cy:20", "Ada:10"]);
Expect("scores: minimum 30", Queries.ScoreSummary(scores, 30), ["Ben:30"]);
Expect("scores: minimum 40 (no match)", Queries.ScoreSummary(scores, 40), []);
Expect("scores: ties keep input order", Queries.ScoreSummary(ties, 0), ["A:20", "B:20", "C:10"]);
Expect("scores: empty input", Queries.ScoreSummary(new List<ScoreEntry>(), 0), []);

// ---- Dictionary lookup ----------------------------------------------------------------------
ExpectText("lookup: present treasure-1", Queries.Lookup(byId, "treasure-1"), "treasure");
ExpectText("lookup: absent key", Queries.Lookup(byId, "absent"), "missing");

// ---- Materialisation: a saved array does not change; a fresh call sees the new row ---------
List<ScoreEntry> live = new List<ScoreEntry>(scores);
string[] saved = Queries.ScoreSummary(live, 10);
live.Add(new ScoreEntry("Eli", 40));
Expect("materialised: saved summary unchanged after adding Eli 40", saved, ["Ben:30", "Cy:20", "Ada:10"]);
Expect("materialised: fresh call includes Eli first", Queries.ScoreSummary(live, 10), ["Eli:40", "Ben:30", "Cy:20", "Ada:10"]);

// ---- Query and loop agree on the same data --------------------------------------------------
Expect("agree: matching tiles (query vs loop)", Queries.MatchingTiles(tiles, "treasure"), LoopQueries.MatchingTiles(tiles, "treasure"));
Expect("agree: score summary minimum 10 (query vs loop)", Queries.ScoreSummary(scores, 10), LoopQueries.ScoreSummary(scores, 10));
Expect("agree: ties (query vs loop)", Queries.ScoreSummary(ties, 0), LoopQueries.ScoreSummary(ties, 0));
Expect("agree: lookup present/absent (query vs loop)",
    [Queries.Lookup(byId, "treasure-1"), Queries.Lookup(byId, "absent")],
    [LoopQueries.Lookup(byId, "treasure-1"), LoopQueries.Lookup(byId, "absent")]);

// ---- Inputs are not mutated -----------------------------------------------------------------
ExpectText("inputs: tiles and scores unchanged", $"{string.Join(",", tiles)} | {string.Join(",", scores)}", $"{tilesBefore} | {scoresBefore}");

// ---- LEARNER ASSERTION (task 4) -------------------------------------------------------------
// Add ONE labelled assertion here, before the summary, for a different kind or minimum.
// Predict the exact array first, and compare query and loop on the same data.

// ---- Summary --------------------------------------------------------------------------------
Console.WriteLine();
Console.WriteLine($"Assertions: {passed}/{passed + failed} passed");
return failed == 0 ? 0 : 1;

// ---- Supplied test transport ----------------------------------------------------------------
void Expect(string label, string[] actual, string[] expected)
{
    Record(label, actual.SequenceEqual(expected), Show(actual), Show(expected));
}

void ExpectText(string label, string actual, string expected)
{
    Record(label, actual == expected, $"\"{actual}\"", $"\"{expected}\"");
}

void Record(string label, bool ok, string actual, string expected)
{
    if (ok) passed++; else failed++;
    Console.WriteLine(ok ? $"PASS {label}: {actual}" : $"FAIL {label}: expected {expected}, actual {actual}");
}

static string Show(string[] values) => "[" + string.Join(", ", values) + "]";
