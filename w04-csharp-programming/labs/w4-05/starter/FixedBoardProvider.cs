// LEARNER FILE: a deterministic provider that always returns the board it was given.
namespace TreasureRules;

// The class already declares ": IBoardProvider" so that the starter compiles and the
// runner can hand this object to PreviewEngine. Once you add GetBoard to the interface,
// the compiler will insist that this class implements it.
public class FixedBoardProvider : IBoardProvider
{
    // TODO (task 2): add a private readonly field that retains the constructor's board.

    /// <summary>How many times GetBoard has been called. The runner reads this to see
    /// which provider instance an engine actually used.</summary>
    public int Calls { get; private set; }

    public FixedBoardProvider(Board board)
    {
        // TODO (task 2): store the board argument in your field.
    }

    // TODO (task 2): implement the public provider operation.
    // Each call adds one to Calls and returns the stored board (the same reference every time).
}
