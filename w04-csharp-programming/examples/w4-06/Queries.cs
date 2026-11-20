// DEMO: LINQ queries and a dictionary lookup.
// IEnumerable<T> only promises enumeration, so lists and arrays are both accepted.
// Each query materialises a NEW string array with ToArray; inputs are never changed.
namespace TileQueries;

public static class Queries
{
    /// <summary>IDs of tiles whose Kind equals kind, in source order. No match -> empty array.</summary>
    public static string[] MatchingTiles(IEnumerable<Tile> tiles, string kind)
    {
        return tiles.Where(tile => tile.Kind == kind)
            .Select(tile => tile.Id).ToArray();
    }

    /// <summary>"Player:Score" for rows with Score >= minimum (inclusive), highest numeric score first;
    /// OrderByDescending is stable, so equal scores keep their input order. Order BEFORE formatting.</summary>
    public static string[] ScoreSummary(IEnumerable<ScoreEntry> scores, int minimum)
    {
        return scores.Where(row => row.Score >= minimum)
            .OrderByDescending(row => row.Score)
            .Select(row => $"{row.Player}:{row.Score}").ToArray();
    }

    /// <summary>The present tile's Kind, or the explicit string "missing" for an absent ID.</summary>
    public static string Lookup(Dictionary<string, Tile> tiles, string id)
    {
        if (tiles.TryGetValue(id, out Tile? tile)) return tile.Kind;
        return "missing";
    }
}
