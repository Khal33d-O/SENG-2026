// SUPPLIED (W4.08): three passing tests - a two-row theory and the F07 regression.
// Arrange builds the board, provider and input; Act calls the rule once; Assert checks the result.
using TreasureRules;

namespace TreasureRules.Tests;

public class RuleTests
{
    [Theory]
    [InlineData("east", true, 1, 0, 5, null)]
    [InlineData("west", false, 0, 0, 6, "ILLEGAL_ACTION")]
    public void Initial_move(string direction, bool accepted,
        int x, int y, int moves, string? reason)
    {
        // Arrange: each data row creates its own provider, engine and six-move state.
        var provider = new FixedBoardProvider(Boards.Reference());
        var engine = new Engine(provider);
        GameState start = Rules.InitialState(Boards.Reference());

        // Act
        MoveResult actual = engine.Apply(start, direction);

        // Assert: the parameters are independent expected values (never recomputed by the rule).
        Assert.Equal(accepted, actual.Accepted);
        Assert.Equal(reason, actual.Reason);
        Assert.Equal(new Position(x, y), actual.State.Position);
        Assert.Equal(moves, actual.State.MovesRemaining);
        Assert.Equal(1, provider.Calls);
    }

    // Regression (F07): the final accepted move reaches the exit with the treasure and zero moves.
    // A known defect checked the zero budget before the win and reported "lost".
    [Fact]
    public void F07_final_move_win_is_won_not_lost()
    {
        var provider = new FixedBoardProvider(Boards.Reference());
        var engine = new Engine(provider);
        GameState state = Rules.InitialState(Boards.Reference());

        foreach (string direction in new[] { "east", "east", "west", "east", "south", "south" })
        {
            state = engine.Apply(state, direction).State;
        }

        Assert.Equal(new Position(2, 2), state.Position);
        Assert.Equal(0, state.MovesRemaining);
        Assert.Equal(10, state.Score);
        Assert.Equal(new[] { "t1" }, state.Collected); // xUnit sequence comparison for the array
        Assert.Equal("won", state.Status);
        Assert.Equal(6, provider.Calls);
    }
}
