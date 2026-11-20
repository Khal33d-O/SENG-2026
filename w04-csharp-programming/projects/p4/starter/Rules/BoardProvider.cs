// Supplied deterministic board provider (a test double for board selection).
// Tests and the console use it so that board data cannot vary between runs.
namespace TreasureRules;

/// <summary>Supplies the board a component should use.</summary>
public interface IBoardProvider
{
    Board GetBoard();
}

/// <summary>
/// Always returns the board given to its constructor. Calls counts requests so a test can
/// show that the component really used this instance. It does not deep-copy the board.
/// </summary>
public class FixedBoardProvider : IBoardProvider
{
    private readonly Board board;

    public int Calls { get; private set; }

    public FixedBoardProvider(Board board)
    {
        this.board = board;
    }

    public Board GetBoard()
    {
        Calls++;
        return board;
    }
}

/// <summary>Composes a provider with the rule operation: one GetBoard call per Apply.</summary>
public class GameEngine
{
    private readonly IBoardProvider provider;

    public GameEngine(IBoardProvider provider)
    {
        this.provider = provider;
    }

    public GameState Start() => Rules.InitialState(provider.GetBoard());

    public MoveResult Apply(GameState state, MoveAction? action) =>
        Rules.EvaluateMove(provider.GetBoard(), state, action);
}
