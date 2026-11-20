using System.Text.Json.Serialization;
using Academy.Rules;

namespace Academy.Api;

/// <summary>
/// The session envelope returned by the API: a generated session ID, the board it uses and the
/// authoritative state. JSON output is camelCase: { "sessionId", "boardId", "state", "id" }.
/// </summary>
public sealed record Session(string SessionId, string BoardId, GameState State)
{
    /// <summary>Alias required by API-CONTRACT.md (`id`); always equal to SessionId.</summary>
    [JsonPropertyName("id")]
    public string Id => SessionId;
}

/// <summary>Error body: { "code", "message", "requestId" }. Never contains a stack trace.</summary>
public sealed record ErrorBody(string Code, string Message, string RequestId);

/// <summary>The one board this release supports (same values as fixtures/board-reference.json).</summary>
public static class ReferenceBoard
{
    public const string Id = "reference";

    public static readonly Board Value = new(
        Id: Id,
        Name: "Reference treasure hunt",
        Width: 3,
        Height: 3,
        Start: new Position(0, 0),
        Walls: [new Position(1, 1)],
        Treasures: [new Treasure("t1", 2, 0, 10)],
        Exit: new Position(2, 2),
        InitialMoves: 6);
}

/// <summary>Rule adapter contract used by the routes. It knows nothing about HTTP or storage.</summary>
public interface IGameRules
{
    GameState Start(Board board);
    MoveResult Apply(Board board, GameState state, MoveAction action);
}

/// <summary>Delegates to the unchanged Week 4 library and translates rule reasons to API codes.</summary>
public sealed class GameRules : IGameRules
{
    public GameState Start(Board board) => Academy.Rules.Rules.InitialState(board);

    public MoveResult Apply(Board board, GameState state, MoveAction action)
    {
        var result = Academy.Rules.Rules.EvaluateMove(board, state, action);
        // WALL and EDGE are both "a well-shaped action that is not allowed here".
        var reason = result.Reason switch
        {
            null => null,
            "WALL" or "EDGE" => "ILLEGAL_ACTION",
            "GAME_COMPLETE" => "GAME_COMPLETE",
            _ => "INVALID_REQUEST",
        };
        return result with { Reason = reason };
    }
}

/// <summary>Storage contract. Routes depend on this interface, never on a concrete store.</summary>
public interface ISessionStore
{
    Task<Session?> LoadAsync(string id);
    Task SaveAsync(Session session, bool failAfterWrite = false);
}

/// <summary>A controlled storage failure; the error middleware maps it to 500 SAVE_FAILED.</summary>
public sealed class SaveFailure(string message) : Exception(message)
{
    public SaveFailure() : this("Training failure injected after the write and before commit.") { }
}
