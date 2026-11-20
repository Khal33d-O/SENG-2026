// Worked Example 2 alternative: a private integer field with a get-only property.
// Same public read and request interface; a different representation.
public class GameSession
{
    private int movesRemaining;

    public int MovesRemaining => movesRemaining;

    public GameSession(int moves)
    {
        movesRemaining = moves < 0 ? 0 : moves;
    }

    public bool TrySpendMove()
    {
        if (movesRemaining == 0) return false;
        movesRemaining -= 1;
        return true;
    }
}
