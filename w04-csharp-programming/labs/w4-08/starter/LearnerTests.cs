// LEARNER FILE (W4.08): replace this failing placeholder with
//   * a [Theory] with [InlineData] rows for south, north, "upwards" and null from the start, using
//     FixedBoardProvider and Engine, asserting acceptance, reason, EVERY state field, provider use
//     and that the input state was not mutated;
//   * a [Fact] wall regression: east then south into the wall at (1,1).
// Write literal expected values before coding. Keep the supplied RuleTests.cs unchanged.
using TreasureRules;

namespace TreasureRules.Tests;

public class LearnerTests
{
    [Fact]
    public void Complete_the_challenge()
    {
        // Deliberately red: an untouched starter must not look like completed work.
        Assert.Fail("Replace this placeholder with your theory and wall regression (see the lab README).");
    }
}
