namespace Academy.Rules;

/// <summary>
/// Treasure-hunt rules (shared GAME-CONTRACT.md). These functions never mutate their inputs and
/// agree with fixtures F01-F11. The API calls them through an adapter; nothing here knows about HTTP.
/// </summary>
public static class Rules
{
    public static readonly IReadOnlyDictionary<string, (int Dx, int Dy)> Directions =
        new Dictionary<string, (int, int)>
        {
            ["north"] = (0, -1),
            ["east"] = (1, 0),
            ["south"] = (0, 1),
            ["west"] = (-1, 0),
        };

    public static GameState InitialState(Board board) =>
        new(board.Start, board.InitialMoves, 0, Array.Empty<string>(), "playing");

    public static MoveResult EvaluateMove(Board board, GameState state, MoveAction? action)
    {
        if (state.Status != "playing") return Reject(state, "GAME_COMPLETE");
        if (action is null || action.Type != "move" || action.Direction is null
            || !Directions.TryGetValue(action.Direction, out var step))
        {
            return Reject(state, "INVALID_ACTION");
        }

        var x = state.Position.X + step.Dx;
        var y = state.Position.Y + step.Dy;
        if (x < 0 || y < 0 || x >= board.Width || y >= board.Height) return Reject(state, "EDGE");
        if (board.Walls.Any(w => w.X == x && w.Y == y)) return Reject(state, "WALL");

        // 1. Move and charge one move.
        var collected = state.Collected.ToList();
        var score = state.Score;
        // 2. An uncollected treasure scores once.
        foreach (var t in board.Treasures)
        {
            if (t.X == x && t.Y == y && !collected.Contains(t.Id))
            {
                collected.Add(t.Id);
                score += t.Value;
            }
        }

        var moves = state.MovesRemaining - 1;
        var allCollected = board.Treasures.All(t => collected.Contains(t.Id));
        // 3. Win on the exit is checked before 4. the zero-budget loss (fixture F07).
        var status = x == board.Exit.X && y == board.Exit.Y && allCollected ? "won"
            : moves == 0 ? "lost"
            : "playing";

        return new MoveResult(true, null, new GameState(new Position(x, y), moves, score, collected, status));
    }

    private static MoveResult Reject(GameState state, string reason) =>
        new(false, reason, state with { Collected = state.Collected.ToArray() });
}
