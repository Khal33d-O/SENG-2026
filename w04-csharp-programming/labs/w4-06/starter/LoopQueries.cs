// Supplied, complete ordinary-loop versions of the three operations.
// Use them to compare results and to explain a query step by step. Do not edit.
namespace TileQueries;

public static class LoopQueries
{
    /// <summary>IDs of tiles whose kind matches, in source order (filter, project, materialise).</summary>
    public static string[] MatchingTiles(IEnumerable<Tile> tiles, string kind)
    {
        List<string> result = new List<string>();
        foreach (Tile tile in tiles)
        {
            if (tile.Kind == kind) result.Add(tile.Id);
        }
        return result.ToArray();
    }

    /// <summary>"Player:Score" for rows with score >= minimum, highest score first, ties in input order.</summary>
    public static string[] ScoreSummary(IEnumerable<ScoreEntry> scores, int minimum)
    {
        // 1. Filter: keep rows at or above the minimum (inclusive) in a new list.
        List<ScoreEntry> kept = new List<ScoreEntry>();
        foreach (ScoreEntry row in scores)
        {
            if (row.Score >= minimum) kept.Add(row);
        }

        // 2. Order: insert each row after every existing row with an equal or higher score.
        //    The while checks the bound BEFORE reading ordered[index].
        List<ScoreEntry> ordered = new List<ScoreEntry>();
        foreach (ScoreEntry row in kept)
        {
            int index = 0;
            while (index < ordered.Count && ordered[index].Score >= row.Score) index++;
            ordered.Insert(index, row);
        }

        // 3. Project: format each ordered row as text, after ordering by the number.
        List<string> result = new List<string>();
        foreach (ScoreEntry row in ordered)
        {
            result.Add($"{row.Player}:{row.Score}");
        }
        return result.ToArray();
    }

    /// <summary>The tile's kind, or "missing" when the ID is not a key.</summary>
    public static string Lookup(Dictionary<string, Tile> tiles, string id)
    {
        if (tiles.ContainsKey(id)) return tiles[id].Kind;  // check first, then index
        return "missing";
    }
}
