using System.Diagnostics;
using Academy.Api;

// Supplied startup for the integrated Week 5 release (browser + API + rules + SQLite + hint + telemetry).
//   STORE=sqlite GAME_DB=/data/game.db   TRAINING_FAILURES=1   HINT_URL=...   COLLECTOR_URL=...
//   dotnet Api.dll --migrate     explicit migration, then exit (the container init step)

// Release label compiled into the image and returned in X-Lab-Release (W5.08/W5.09 change it).
const string Release = "known-good";

var migrate = args.Contains("--migrate");
var builder = WebApplication.CreateBuilder(args.Where(a => a != "--migrate").ToArray());

// Structured logs: one JSON object per line on stdout (named template fields stay queryable).
builder.Logging.ClearProviders();
builder.Logging.AddJsonConsole(options =>
{
    options.UseUtcTimestamp = true;
    options.TimestampFormat = "yyyy-MM-ddTHH:mm:ss.fffZ";
});

builder.Services.AddGameServices(builder.Configuration);
builder.Services.AddHintAdapter(builder.Configuration);
Telemetry.Start(builder.Services, builder.Configuration);

var app = builder.Build();
if (migrate) return await Plumbing.MigrateAsync(app);

var environment = app.Configuration["LAB_ENV"] ?? "local";
app.UseLabHeaders(Release, environment);

// Action telemetry wraps the error mapping, so a failed save is already a 500 when it is tagged.
app.Use(async (context, next) =>
{
    if (!Telemetry.IsAction(context))
    {
        await next(context);
        return;
    }

    using var action = Telemetry.Actions.StartActivity("game.action");
    var timer = Stopwatch.StartNew();
    await next(context);

    var status = context.Response.StatusCode;
    var outcome = status is >= 200 and < 300 ? "accepted" : "rejected";
    var traceId = action?.TraceId.ToString();
    action?.SetTag("requestId", context.TraceIdentifier);
    action?.SetTag("status", status);
    action?.SetTag("outcome", outcome);
    action?.SetTag("traceId", traceId);
    action?.SetTag("durationMs", timer.ElapsedMilliseconds);
    if (status >= 500) action?.SetStatus(ActivityStatusCode.Error, "action failed");
    app.Logger.LogInformation("Game action {RequestId} completed {Status} {Outcome} {TraceId}",
        context.TraceIdentifier, status, outcome, traceId);
});

app.UseErrorMapping();
app.UseRequestGate();
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapHealth();
Routes.Map(app);

app.Logger.LogInformation("Release {Release}; store {Store}; training failures {Failures}", Release,
    app.Configuration["STORE"] ?? "memory", app.Configuration["TRAINING_FAILURES"] == "1" ? "on" : "off");
await app.RunAsync();
return 0;
