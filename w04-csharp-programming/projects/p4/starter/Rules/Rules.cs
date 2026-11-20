// P4 starter: the rule library. InitialState is supplied; EvaluateMove is yours to implement.
// Pure functions: no console, clock, randomness or I/O, and inputs are never mutated.
namespace TreasureRules;

public static class Rules
{
    // Rejection reasons from the shared contract.
    public const string Wall = "WALL";
    public const string Edge = "EDGE";
    public const string InvalidAction = "INVALID_ACTION";
    public const string GameComplete = "GAME_COMPLETE";

    /// <summary>A fresh state for the board: start position, full budget, no score.</summary>
    public static GameState InitialState(Board board)
    {
        return new GameState(
            new Position(board.Start.X, board.Start.Y),
            board.InitialMoves,
            0,
            [],
            "playing");
    }

    /// <summary>
    /// Evaluates one action against the current state and returns (accepted, state, reason).
    /// The board, state and action are never changed; a new state is always returned.
    /// </summary>
    public static MoveResult EvaluateMove(Board board, GameState state, MoveAction? action)
    {
        // P4: implement the agreed slice here (see the project README and GAME-CONTRACT.md):
        //  - status not "playing"                        -> reject GAME_COMPLETE
        //  - missing action, type not "move", or unknown/missing direction -> reject INVALID_ACTION
        //  - off the board -> reject EDGE; into a wall -> reject WALL   (rejections return Reject(...))
        //  - accepted: move, charge one move, collect an uncollected treasure once (+value),
        //    win on the exit with every treasure BEFORE the zero-budget loss, else lost at zero.
        // Never mutate board, state or action: build a new GameState.
        throw new NotImplementedException("P4: implement Rules.EvaluateMove");
    }

    // A rejection returns an unchanged COPY of the state, never the caller's object.
    private static MoveResult Reject(GameState state, string reason)
    {
        GameState copy = new(
            new Position(state.Position.X, state.Position.Y),
            state.MovesRemaining,
            state.Score,
            [.. state.Collected],
            state.Status);
        return new MoveResult(false, copy, reason);
    }
}
