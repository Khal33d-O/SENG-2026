// SUPPLIED (W4.08): the board dependency, its deterministic test double, and the engine.
// The double replaces board retrieval only - Rules.EvaluateMove still executes for real.
namespace TreasureRules;

/// <summary>Supplies the board an engine applies moves to (introduced in W4.05).</summary>
public interface IBoardProvider
{
    Board GetBoard();
}

/// <summary>Test double: always returns the board passed to its constructor; Calls counts requests.</summary>
public class FixedBoardProvider : IBoardProvider
{
    private readonly Board board;
    public int Calls { get; private set; }
    public FixedBoardProvider(Board board) { this.board = board; }
    public Board GetBoard()
    {
        Calls++;
        return board;
    }
}

/// <summary>
/// Applies one move request through the action boundary (as in W4.07): it obtains the board from the
/// provider, calls the real rule operation and reports rejections in the boundary categories
/// used by the future API: rule WALL/EDGE -> ILLEGAL_ACTION, rule INVALID_ACTION -> INVALID_REQUEST.
/// </summary>
public class Engine
{
    private readonly IBoardProvider provider;

    public Engine(IBoardProvider provider)
    {
        this.provider = provider;
    }

    public MoveResult Apply(GameState state, string? direction)
    {
        MoveResult rule = Rules.EvaluateMove(provider.GetBoard(), state, new MoveAction("move", direction));
        return rule.Accepted ? rule : rule with { Reason = Category(rule.Reason) };
    }

    private static string? Category(string? ruleReason) => ruleReason switch
    {
        Rules.Wall or Rules.Edge => "ILLEGAL_ACTION",
        Rules.InvalidAction => "INVALID_REQUEST",
        _ => ruleReason, // GAME_COMPLETE is already a boundary category
    };
}

/// <summary>The reference board (source/shared/fixtures/board-reference.json) as C# data.</summary>
public static class Boards
{
    public static Board Reference() => new(
        "reference", "Reference treasure hunt", 3, 3,
        new Position(0, 0),
        [new Position(1, 1)],
        [new Treasure("t1", 2, 0, 10)],
        new Position(2, 2),
        6);
}
