// PREFLIGHT MUTANT (known defect): protected state, but the exhaustion guard was removed.
// Compiles; passes only 7 of the 13 checks.
public class GameSession
{
    public int MovesRemaining { get; private set; }
    public GameSession(int moves) { MovesRemaining = moves < 0 ? 0 : moves; }
    public bool TrySpendMove()
    {
        MovesRemaining -= 1;
        return true;
    }
}
