// DEMO: a deterministic provider that always returns the board it was given.
// readonly stops reassignment; it does not deep-copy or freeze the board's arrays.
// Calls is an observation counter: board content stays the same, the counter changes.
namespace TreasureRules;

public class FixedBoardProvider : IBoardProvider
{
    private readonly Board board;
    public int Calls { get; private set; }
    public FixedBoardProvider(Board board) { this.board = board; }
    public Board GetBoard()
    {
         Calls++;
         return board;
    }
}
