// Supplied board fixtures. Do not edit: the runner's expected results depend on them.
// Open() mirrors the shared reference board (source/shared/fixtures/board-reference.json).
// Blocked() is the same board with one extra wall directly east of the start.
namespace TreasureRules;

public static class Boards
{
    /// <summary>3x3 reference board: start (0,0), wall (1,1), t1 at (2,0), exit (2,2), six moves.
    /// East from the start reaches (1,0) and is legal.</summary>
    public static Board Open()
    {
        return new Board(
            "reference",
            "Reference treasure hunt",
            3,
            3,
            new Position(0, 0),
            [new Position(1, 1)],
            [new Treasure("t1", 2, 0, 10)],
            new Position(2, 2),
            6);
    }

    /// <summary>The reference board plus a wall at (1,0), so east from the start is rejected.</summary>
    public static Board Blocked()
    {
        return new Board(
            "blocked",
            "Reference board with a wall east of the start",
            3,
            3,
            new Position(0, 0),
            [new Position(1, 1), new Position(1, 0)],
            [new Treasure("t1", 2, 0, 10)],
            new Position(2, 2),
            6);
    }
}
