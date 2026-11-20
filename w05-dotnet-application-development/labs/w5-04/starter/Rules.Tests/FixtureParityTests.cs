using System.Text.Json;
using System.Text.Json.Nodes;
using Academy.Rules;
using Xunit;

namespace Academy.Rules.Tests;

/// <summary>Runs every shared fixture through the C# rules and compares the whole result.</summary>
public class FixtureParityTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly string Dir = Path.Combine(AppContext.BaseDirectory, "fixtures");

    public static TheoryData<string> FixtureIds()
    {
        var ids = new TheoryData<string>();
        foreach (var file in Directory.GetFiles(Dir, "F*.json").Order()) ids.Add(Path.GetFileNameWithoutExtension(file));
        return ids;
    }

    [Fact]
    public void All13FixturesArePresent() => Assert.Equal(13, Directory.GetFiles(Dir, "F*.json").Length);

    [Theory]
    [MemberData(nameof(FixtureIds))]
    public void RulesAgreeWithFixture(string id)
    {
        var fixture = JsonNode.Parse(File.ReadAllText(Path.Combine(Dir, id + ".json")))!;
        var board = JsonSerializer.Deserialize<Board>(File.ReadAllText(Path.Combine(Dir, "board-reference.json")), Json)!;
        var input = fixture["state"] is null
            ? Rules.InitialState(board)
            : fixture["state"].Deserialize<GameState>(Json)!;
        var before = JsonSerializer.SerializeToNode(input, Json);
        var expected = fixture["expected"]!;

        JsonNode actual;
        if (fixture["action"] is null)
        {
            // F01: no action, just the initial state.
            actual = new JsonObject { ["accepted"] = null, ["reason"] = null, ["state"] = JsonSerializer.SerializeToNode(input, Json) };
        }
        else
        {
            var action = fixture["action"].Deserialize<MoveAction>(Json);
            actual = JsonSerializer.SerializeToNode(Rules.EvaluateMove(board, input, action), Json)!;
        }

        Assert.True(JsonNode.DeepEquals(expected, actual), $"{id}: expected {expected.ToJsonString()} but got {actual.ToJsonString()}");
        // Inputs are never mutated.
        Assert.True(JsonNode.DeepEquals(before, JsonSerializer.SerializeToNode(input, Json)), $"{id}: input state was mutated");
    }
}
