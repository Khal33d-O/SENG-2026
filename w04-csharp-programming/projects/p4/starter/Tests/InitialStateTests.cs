// Supplied test: the initial state of the reference board (F01). Passing it is NOT completion.
using TreasureRules;

namespace TreasureRules.Tests;

public class InitialStateTests
{
    [Fact]
    public void Initial_state_matches_the_reference_board()
    {
        // Arrange: the deterministic provider fixes which board is used.
        var provider = new FixedBoardProvider(TestBoards.Reference());

        // Act
        GameState state = Rules.InitialState(provider.GetBoard());

        // Assert: literal expectations from the contract, not values computed by the engine.
        Assert.Equal(new Position(0, 0), state.Position);
        Assert.Equal(6, state.MovesRemaining);
        Assert.Equal(0, state.Score);
        Assert.Empty(state.Collected);
        Assert.Equal("playing", state.Status);
        Assert.Equal(1, provider.Calls);
    }
}
