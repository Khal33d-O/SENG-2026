// SUPPLIED (W4.09): the board record (shared contract wire data) and the load-result record.
namespace BoardLoading;

public record Position(int X, int Y);

public record Treasure(string Id, int X, int Y, int Value);

/// <summary>Board wire data, as in source/shared/fixtures/board-reference.json.</summary>
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

/// <summary>The loader's result: Loaded, the Board when loaded, and an Error category otherwise
/// (INVALID_FILE or UNAVAILABLE_FILE).</summary>
public record LoadResult(bool Loaded, Board? Board, string? Error);
