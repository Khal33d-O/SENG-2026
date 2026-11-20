using System.Net.Http.Json;
using System.Text.Json.Nodes;
using Academy.Rules;

namespace Academy.Api;

/// <summary>
/// Supplied adapter to the existing local Week 3 hint server (HINT_URL, default http://127.0.0.1:5056).
/// The hint server computes permitted actions, validates the simulated model answer and falls back
/// deterministically (first permitted direction in N, E, S, W order, or null). No live model, no keys.
/// </summary>
public sealed class HintClient(HttpClient http, ILogger<HintClient> log)
{
    public async Task<JsonObject?> AskAsync(Board board, GameState state, int stateVersion, string requestId)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, "/api/hint")
            {
                Content = JsonContent.Create(new { board, state, stateVersion }, options: SessionMapping.Json),
            };
            request.Headers.Add("X-Request-Id", requestId);
            using var response = await http.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                log.LogWarning("Hint server returned {Status} for {RequestId}", (int)response.StatusCode, requestId);
                return null;
            }
            return await response.Content.ReadFromJsonAsync<JsonObject>();
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            // A stopped hint process is HINT_UNAVAILABLE, not a model timeout (that is handled by the hint server).
            log.LogWarning("Hint server unavailable for {RequestId}: {Reason}", requestId, ex.Message);
            return null;
        }
    }
}

public static class HintRegistration
{
    public static IServiceCollection AddHintAdapter(this IServiceCollection services, IConfiguration config)
    {
        var url = config["HINT_URL"] ?? "http://127.0.0.1:5056";
        services.AddHttpClient<HintClient>(client =>
        {
            client.BaseAddress = new Uri(url);
            client.Timeout = TimeSpan.FromSeconds(5);
        });
        return services;
    }
}
