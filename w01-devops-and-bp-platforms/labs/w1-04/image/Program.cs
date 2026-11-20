// Supplied foundation page and board API (Week 1).
// You are NOT expected to write or understand every C# statement here.
// Look for three things only:
//   1. Release     - the packaged release label compiled into the image.
//   2. LAB_ENV     - the public runtime setting read when the process starts.
//   3. the routes  - "/api/boards/{id}" and "/healthz".

const string Release = "foundation-a"; // change this in a COPY, then publish + build a new image

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Public runtime setting supplied when the container starts (runtime.env). Not a credential.
string environmentLabel = Environment.GetEnvironmentVariable("LAB_ENV") ?? "unset";

// The shared reference board, packaged with the application.
string referenceBoard = File.ReadAllText(
    Path.Combine(AppContext.BaseDirectory, "data", "board-reference.json"));

// Every response carries the two lab headers plus a correlation id.
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Lab-Release"] = Release;
    context.Response.Headers["X-Lab-Environment"] = environmentLabel;
    context.Response.Headers["X-Request-Id"] = Guid.NewGuid().ToString("N");
    await next();
});

// GET / serves wwwroot/index.html; site.css and app.js are served beside it.
app.UseDefaultFiles();
app.UseStaticFiles();

// GET /api/boards/reference -> 200 board JSON; any other board -> 404 NOT_FOUND.
app.MapGet("/api/boards/{id}", (string id) =>
    id == "reference"
        ? Results.Text(referenceBoard, "application/json")
        : Results.Json(new { code = "NOT_FOUND", message = "Board not found" }, statusCode: 404));

// GET /healthz -> 200 "Healthy" (a narrow liveness signal only).
app.MapGet("/healthz", () => Results.Text("Healthy"));

app.Run();
