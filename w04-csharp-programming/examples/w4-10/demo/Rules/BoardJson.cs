// Supplied JSON options and board parsing for the external (camelCase) contract.
using System.Text.Json;

namespace TreasureRules;

public static class BoardJson
{
    /// <summary>Reads names case-insensitively and writes camelCase (position, movesRemaining, collected ...).</summary>
    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    /// <summary>Parses board wire data such as fixtures/board-reference.json.</summary>
    public static Board Parse(string json) =>
        JsonSerializer.Deserialize<Board>(json, Options)
        ?? throw new JsonException("Board JSON was empty.");
}
