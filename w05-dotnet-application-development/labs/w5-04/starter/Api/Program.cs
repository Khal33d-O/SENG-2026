using Academy.Api;

// Supplied startup for the Week 5 session API.
//   STORE=memory|traced|sqlite   GAME_DB=/absolute/path/game.db   TRAINING_FAILURES=1
//   dotnet run --project Api -- --migrate                 (explicit migration, then exit)
//   dotnet run --project Api -- --urls http://127.0.0.1:5055

const string Release = "session-api-w5";

var migrate = args.Contains("--migrate");
var builder = WebApplication.CreateBuilder(args.Where(a => a != "--migrate").ToArray());
builder.Services.AddGameServices(builder.Configuration);

var app = builder.Build();
if (migrate) return await Plumbing.MigrateAsync(app);

var environment = app.Configuration["LAB_ENV"] ?? "local";
app.UseLabHeaders(Release, environment);
app.UseErrorMapping();
app.UseRequestGate();
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapHealth();
Routes.Map(app);

app.Logger.LogInformation("Store {Store}; training failures {Failures}",
    app.Configuration["STORE"] ?? "memory", app.Configuration["TRAINING_FAILURES"] == "1" ? "on" : "off");
await app.RunAsync();
return 0;
