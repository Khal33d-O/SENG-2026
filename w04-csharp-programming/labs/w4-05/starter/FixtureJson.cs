// Supplied JSON helpers: read names case-insensitively, write camelCase.
using System.Text.Json;
using System.Text.Json.Nodes;

namespace TreasureRules;

public static class FixtureJson
{
    /// <summary>Case-insensitive reading and camelCase writing, matching the external contract.</summary>
    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };
}
