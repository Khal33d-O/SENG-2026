// Worked Example 1: the full public-setter class (callers can bypass the guard).
public class GameSession
{
    public int MovesRemaining { get; set; }
    public GameSession(int moves) { MovesRemaining = moves < 0 ? 0 : moves; }
    public bool TrySpendMove()
    {
         if (MovesRemaining == 0) return false;
         MovesRemaining -= 1;
         return true;
    }
}
