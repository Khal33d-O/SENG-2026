// W1.06 supplied application: ONE image, two roles selected at start-up by LAB_ROLE.
//   api      - listens on 8181; answers GET /api/boards/{id}.
//   frontend - listens on 8080; serves the page, exposes /public-config and forwards /api/* to API_UPSTREAM.
// Probe mode (used by lab.py probe):  dotnet Relay.dll probe URL
//   prints the HTTP status and body, or NO_HTTP_RESPONSE and exits 3 when no HTTP response arrives.
using System.Text.Json.Nodes;

if (args.Length == 2 && args[0] == "probe")
{
    using var probeClient = new HttpClient { Timeout = TimeSpan.FromSeconds(3) };
    try
    {
        var response = await probeClient.GetAsync(args[1]);
        Console.WriteLine($"HTTP {(int)response.StatusCode}");
        Console.WriteLine(await response.Content.ReadAsStringAsync());
        return 0;
    }
    catch (Exception error) when (error is HttpRequestException or TaskCanceledException)
    {
        Console.WriteLine($"NO_HTTP_RESPONSE {args[1]} ({error.Message})");
        return 3;
    }
}

string role = Environment.GetEnvironmentVariable("LAB_ROLE") ?? "frontend";
var app = WebApplication.CreateBuilder(args).Build();
app.MapGet("/healthz", () => Results.Text("Healthy"));

if (role == "api")
{
    const string Service = "w106-reference-api";
    var board = JsonNode.Parse(File.ReadAllText(Path.Combine(AppContext.BaseDirectory, "data", "board-reference.json")));
    app.MapGet("/api/boards/{id}", (string id) => id == "reference"
        ? Results.Json(new { service = Service, board })
        : Results.Json(new { code = "NOT_FOUND", message = "Board not found", service = Service }, statusCode: 404));
}
else
{
    const string Service = "w106-frontend";
    // Public settings from the environment given to THIS process when it started (--env-file).
    string upstream = Environment.GetEnvironmentVariable("API_UPSTREAM") ?? "";
    string browserUrl = Environment.GetEnvironmentVariable("BROWSER_API_URL") ?? "";
    string label = Environment.GetEnvironmentVariable("PUBLIC_LABEL") ?? "";
    var client = new HttpClient { Timeout = TimeSpan.FromSeconds(3) };

    app.UseDefaultFiles();
    app.UseStaticFiles();
    // Deliberate, explicit transfer of two PUBLIC values to the browser. Never put credentials here.
    app.MapGet("/public-config", () => Results.Json(new { browserApiUrl = browserUrl, publicLabel = label, service = Service }));
    // The frontend is the second initiator: it makes its own request to the API.
    app.MapGet("/api/{**rest}", async (string rest) =>
    {
        string target = upstream.TrimEnd('/') + "/api/" + rest;
        try
        {
            var response = await client.GetAsync(target);
            string body = await response.Content.ReadAsStringAsync();
            return Results.Content(body, "application/json", statusCode: (int)response.StatusCode);
        }
        catch (Exception error) when (error is HttpRequestException or TaskCanceledException
                                          or UriFormatException or InvalidOperationException)
        {
            return Results.Json(new { code = "UPSTREAM_UNREACHABLE", service = Service, upstream = target,
                                      message = "No HTTP response from the configured upstream" }, statusCode: 502);
        }
    });
}

app.Run();
return 0;
