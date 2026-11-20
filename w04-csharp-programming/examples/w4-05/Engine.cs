// DEMO (after): Engine.cs - the caller supplies the provider; the engine keeps an interface reference.
// this.provider is the field; the right-hand provider is the constructor argument.
// The provider chooses the data once per call; the unchanged rule function decides legality.
namespace TreasureRules;

public class PreviewEngine
{
    private readonly IBoardProvider provider;

    public PreviewEngine(IBoardProvider provider)
    {
        this.provider = provider;
    }

    public MoveResult Preview(GameState state, MoveAction action)
    {
        return Rules.EvaluateMove(provider.GetBoard(), state, action);
    }
}
