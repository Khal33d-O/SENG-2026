// Supplied test helpers: the reference board and a deep comparison of states.
using System.Text.Json;
using TreasureRules;

namespace TreasureRules.Tests;

public static class TestBoards
{
    /// <summary>The reference board, read from the copied fixtures/board-reference.json.</summary>
    public static Board Reference() =>
        BoardJson.Parse(File.ReadAllText(Path.Combine(AppContext.BaseDirectory, "fixtures", "board-reference.json")));

    /// <summary>A state literal, written out in full so expectations stay independent of the engine.</summary>
    public static GameState State(int x, int y, int moves, int score, string[] collected, string status) =>
        new(new Position(x, y), moves, score, collected, status);

    /// <summary>JSON text of any value, used to show that an input was not mutated.</summary>
    public static string Snapshot(object value) => JsonSerializer.Serialize(value, BoardJson.Options);
}
