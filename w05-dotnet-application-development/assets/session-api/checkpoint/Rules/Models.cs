namespace Academy.Rules;

// Records give value semantics and `with` copies. External JSON uses camelCase
// (movesRemaining); the C# properties stay PascalCase (MovesRemaining).

public sealed record Position(int X, int Y);

public sealed record Treasure(string Id, int X, int Y, int Value);

public sealed record Board(
    string Id,
    string Name,
    int Width,
    int Height,
    Position Start,
    IReadOnlyList<Position> Walls,
    IReadOnlyList<Treasure> Treasures,
    Position Exit,
    int InitialMoves);

public sealed record GameState(
    Position Position,
    int MovesRemaining,
    int Score,
    IReadOnlyList<string> Collected,
    string Status);

/// <summary>An action as received: both fields may be missing or wrong.</summary>
public sealed record MoveAction(string? Type, string? Direction);

/// <summary>Result of evaluating one action. A rejection carries a reason and an unchanged copy.</summary>
public sealed record MoveResult(bool Accepted, string? Reason, GameState State);
