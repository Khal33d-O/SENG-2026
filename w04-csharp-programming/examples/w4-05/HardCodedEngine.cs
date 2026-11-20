// DEMO (before): the engine chooses its own collaborator AND its board.
// To use another board you would have to edit this file.
namespace TreasureRules;

public class HardCodedEngine
{
    // Concrete type, constructed here: the caller has no say in which provider or board is used.
    private readonly FixedBoardProvider provider =
        new FixedBoardProvider(Boards.Open());

    public MoveResult Preview(GameState state, MoveAction action)
    {
        // Same rule function as PreviewEngine; only the construction decision differs.
        return Rules.EvaluateMove(provider.GetBoard(), state, action);
    }
}
