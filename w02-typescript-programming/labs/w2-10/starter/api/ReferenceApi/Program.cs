// Supplied reference API (net10.0). Serves the fixed reference board definition exactly as stored.
// tools/serve.py builds and starts it, then forwards /api/boards/* to it.
var app = WebApplication.CreateBuilder(args).Build();
var dataDir = Path.Combine(AppContext.BaseDirectory, "data");

app.MapGet("/api/boards/reference", () =>
    Results.Text(File.ReadAllText(Path.Combine(dataDir, "board-reference.json")), "application/json; charset=utf-8"));
app.MapGet("/api/boards/{id}", (string id) =>
    Results.Json(new { code = "NOT_FOUND", message = "Board not found" }, statusCode: 404));
app.MapGet("/healthz", () => Results.Text("Healthy"));

app.Run();
