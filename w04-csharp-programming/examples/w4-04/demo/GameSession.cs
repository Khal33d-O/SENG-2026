// Worked Example 2: the complete private-setter form (callers observe, only the class assigns).
public class GameSession
{
    public int MovesRemaining { get; private set; }
    public GameSession(int moves) { MovesRemaining = moves < 0 ? 0 : moves; }
    public bool TrySpendMove()
    {
         if (MovesRemaining == 0) return false;
         MovesRemaining -= 1;
         return true;
    }
}
