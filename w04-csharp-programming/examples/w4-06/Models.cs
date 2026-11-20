// Supplied data models. These records are data carriers, not an implementation task.
namespace TileQueries;

/// <summary>A board tile: new Tile("treasure-1", "treasure") fills Id and Kind.</summary>
public record Tile(string Id, string Kind);

/// <summary>One score row: new ScoreEntry("Ada", 10) fills Player and Score.
/// The player names are fictional sample data.</summary>
public record ScoreEntry(string Player, int Score);
