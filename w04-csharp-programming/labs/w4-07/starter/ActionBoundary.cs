// LEARNER FILE: you edit this file only.
//
// The action boundary sits between a caller (this console today, an HTTP endpoint later)
// and the supplied rule engine (Rules/Rules.cs). It classifies a request:
//   * accepted                      -> the rule engine's new state
//   * unknown or missing direction  -> INVALID_REQUEST, state unchanged (an expected player error)
//   * wall or edge (rule WALL/EDGE) -> ILLEGAL_ACTION,  state unchanged (an expected rule rejection)
// A broken programmer assumption (bad index, missing board) is NOT a player error: let it throw.
namespace TreasureRules;

public static class ActionBoundary
{
    /// <summary>Returns the id of the first treasure on the known reference board.</summary>
    public static string TreasureLabel(Board board)
    {
        // SEEDED FAULT (task 1 and 2): reproduce, inspect, then repair this lookup.
        // Set a breakpoint on the return line and inspect index and board.Treasures.Length.
        int index = board.Treasures.Length;
        return board.Treasures[index].Id;
    }

    /// <summary>Applies one move request through the boundary.</summary>
    public static MoveResult Apply(Board board, GameState state, string? direction)
    {
        if (direction is not ("north" or "east" or "south" or "west"))
        {
            // TODO (task 3): an unknown or missing direction is an expected player error.
            // Replace this throw with an explicit rejected result that keeps the state unchanged.
            throw new ArgumentException("Unknown direction");
        }

        MoveResult rule = Rules.EvaluateMove(board, state, new MoveAction("move", direction));
        if (rule.Accepted)
        {
            return rule;
        }

        // Rule rejections keep the rule engine's unchanged state copy; only the category changes.
        return rule with { Reason = Category(rule.Reason) };
    }

    // SUPPLIED: maps contract rule reasons to the boundary (API) categories.
    private static string? Category(string? ruleReason) => ruleReason switch
    {
        Rules.Wall or Rules.Edge => "ILLEGAL_ACTION",
        Rules.InvalidAction => "INVALID_REQUEST",
        _ => ruleReason, // GAME_COMPLETE stays as it is
    };
}
