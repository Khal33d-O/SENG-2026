// LEARNER FILE: the component that previews a move using a supplied board provider.
namespace TreasureRules;

public class PreviewEngine
{
    // TODO (task 3): add a private readonly field typed as the interface, IBoardProvider.

    public PreviewEngine(IBoardProvider provider)
    {
        // TODO (task 3): assign the supplied provider to your field (this.provider = provider;).
        // At the moment the argument is accepted and then ignored.
    }

    /// <summary>Evaluates one action with the established rules. Never changes its inputs.</summary>
    public MoveResult Preview(GameState state, MoveAction action)
    {
        // TODO (task 3): this is the hard-coded board. Obtain the board from the supplied
        // provider instead, once per call. Keep the call to Rules.EvaluateMove.
        return Rules.EvaluateMove(Boards.Open(), state, action);
    }
}
