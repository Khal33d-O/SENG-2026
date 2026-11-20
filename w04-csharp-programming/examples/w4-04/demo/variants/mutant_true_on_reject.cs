// PREFLIGHT MUTANT (known defect): refuses at zero but reports true. Passes 10 of the 13 checks.
public class GameSession
{
    public int MovesRemaining { get; private set; }
    public GameSession(int moves) { MovesRemaining = moves < 0 ? 0 : moves; }
    public bool TrySpendMove()
    {
        if (MovesRemaining == 0) return true;
        MovesRemaining -= 1;
        return true;
    }
}
