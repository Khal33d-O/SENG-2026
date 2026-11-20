// SUPPLIED: the known reference board. Do not edit.
// Mirrors source/shared/fixtures/board-reference.json.
namespace TreasureRules;

public static class Boards
{
    /// <summary>3x3 reference board: start (0,0), wall (1,1), ONE treasure t1 at (2,0), exit (2,2), six moves.</summary>
    public static Board Reference()
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
}
