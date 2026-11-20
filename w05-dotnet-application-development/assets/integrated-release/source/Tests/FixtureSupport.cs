using System.Net.Http.Json;
using System.Text.Json.Nodes;

/// <summary>
/// Supplied helpers for the HTTP runner. run.py starts the API on a fresh workspace database and sets
/// BASE_URL; tests create their own session IDs, so earlier attempts cannot change the results.
/// </summary>
public static class FixtureSupport
{
    public static HttpClient CreateClient()
    {
        var baseUrl = Environment.GetEnvironmentVariable("BASE_URL") ?? "http://127.0.0.1:5055";
        Console.WriteLine($"Testing {baseUrl}");
        return new HttpClient { BaseAddress = new Uri(baseUrl), Timeout = TimeSpan.FromSeconds(20) };
    }

    /// <summary>Throws on false, giving a nonzero process exit.</summary>
    public static void Check(bool condition, string message)
    {
        if (!condition) throw new InvalidOperationException($"Check failed: {message}");
        Console.WriteLine($"  ok   {message}");
    }

    public static async Task<JsonNode> ReadJsonAsync(HttpResponseMessage response) =>
        JsonNode.Parse(await response.Content.ReadAsStringAsync())
        ?? throw new InvalidOperationException("Check failed: response body was empty");

    /// <summary>Independent read of the stored session (a fresh GET, not the earlier response).</summary>
    public static async Task<JsonNode> GetSessionAsync(HttpClient client, string id)
    {
        var response = await client.GetAsync($"/api/sessions/{id}");
        Check((int)response.StatusCode == 200, $"GET /api/sessions/{id} returns 200");
        return await ReadJsonAsync(response);
    }

    public static Task<HttpResponseMessage> MoveAsync(HttpClient client, string id, string direction) =>
        client.PostAsJsonAsync($"/api/sessions/{id}/actions", new { type = "move", direction });

    /// <summary>Expected state from the shared fixtures (copied next to the runner).</summary>
    public static JsonNode FixtureState(string id)
    {
        var path = Path.Combine(AppContext.BaseDirectory, "fixtures", $"{id}.json");
        return JsonNode.Parse(File.ReadAllText(path))!["expected"]!["state"]!.DeepClone();
    }

    public static void CheckError(JsonNode body, string code, string what)
    {
        Check(body["code"]?.GetValue<string>() == code, $"{what}: code {code}");
        Check(!string.IsNullOrWhiteSpace(body["requestId"]?.GetValue<string>()), $"{what}: non-empty requestId");
    }
}
