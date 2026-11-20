// W4.03 lab challenge: select the first open position from an ordered candidate array.
// You own the BODY of FindFirstOpenPosition. Keep the signature, the class shell and
// PositionRules.IsOpenPosition unchanged. Use an ordinary foreach or for loop (no LINQ).
namespace TreasureRules;

public static class CandidateRules
{
    /// <summary>
    /// Contract:
    ///  * inspect candidates in their supplied array order and return the earliest open position;
    ///  * an unsuitable candidate does not establish that every later candidate is unsuitable;
    ///  * return null when the array is empty or none of its positions is open;
    ///  * preserve the board and the candidate array, including their order.
    /// Inputs are initialised and non-null; an empty candidate array is valid.
    /// </summary>
    public static Position? FindFirstOpenPosition(
        Board board, Position[] candidates)
    {
        // Starter: compiles, but always reports "no open position".
        return null;
    }
}
