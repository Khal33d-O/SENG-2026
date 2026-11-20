// Supplied data models for the reference treasure hunt.
// These records are data carriers that mirror the shared game contract
// (source/shared/contract/GAME-CONTRACT.md). External JSON uses camelCase
// names (position, movesRemaining, collected ...); C# uses PascalCase.
namespace TreasureRules;

/// <summary>A board cell. x is the column (east is x + 1); y is the row (south is y + 1).</summary>
public record Position(int X, int Y);

/// <summary>A treasure on the board, worth Value points the first time it is entered.</summary>
public record Treasure(string Id, int X, int Y, int Value);

/// <summary>Wire data for a board. JSON "initialMoves" maps to InitialMoves.</summary>
public record Board(
    string Id,
    string Name,
    int Width,
    int Height,
    Position Start,
    Position[] Walls,
    Treasure[] Treasures,
    Position Exit,
    int InitialMoves);

/// <summary>Rule state. Status is "playing", "won" or "lost".</summary>
public record GameState(
    Position Position,
    int MovesRemaining,
    int Score,
    string[] Collected,
    string Status);

/// <summary>A requested action: { "type": "move", "direction": "east" }. Either field may be missing.</summary>
public record MoveAction(string? Type, string? Direction);

/// <summary>The rule result: accepted flag, resulting state and an optional rejection reason.</summary>
public record MoveResult(bool Accepted, GameState State, string? Reason);
