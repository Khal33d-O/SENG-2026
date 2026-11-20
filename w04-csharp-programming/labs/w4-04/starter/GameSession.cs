// W4.04 lab challenge: complete this ONE class. Keep the public names and types.
// You may use public getters with private setters, or private int fields with get-only properties.
//
//   MovesRemaining  - the session's total unspent allowance.
//   ReservedMoves   - a portion of that allowance held back from ordinary spending.
//   Invariant       - 0 <= ReservedMoves <= MovesRemaining.
//   Constructor     - negative initial moves normalise to zero; every new session has zero reserve.
//   TryReserveMoves - replaces the reservation for 0 <= amount <= MovesRemaining (0 releases it);
//                     otherwise returns false and preserves both values.
//   TrySpendMoves   - accepts 0 < amount <= MovesRemaining - ReservedMoves: subtracts from
//                     MovesRemaining, keeps ReservedMoves, returns true; otherwise false, both preserved.
//
// STARTER (deliberately incomplete): public setters, no normalisation, operations always refuse.
public class GameSession
{
    public int MovesRemaining { get; set; }
    public int ReservedMoves { get; set; }

    public GameSession(int moves)
    {
        MovesRemaining = moves;
        ReservedMoves = 0;
    }

    public bool TryReserveMoves(int amount)
    {
        return false;
    }

    public bool TrySpendMoves(int amount)
    {
        return false;
    }
}
