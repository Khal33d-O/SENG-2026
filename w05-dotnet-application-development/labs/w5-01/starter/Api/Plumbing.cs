using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

namespace Academy.Api;

// Supplied plumbing. Read it, but the sessions do not ask you to change it.

/// <summary>Turns on the after-write teaching failure for one request when TRAINING_FAILURES=1.</summary>
public sealed class TrainingFailures(bool enabled)
{
    public const string Header = "X-Training-Failure";
    public bool Enabled { get; } = enabled;

    public bool Requested(HttpContext context) =>
        Enabled && string.Equals(context.Request.Headers[Header], "after-write", StringComparison.OrdinalIgnoreCase);
}

/// <summary>
/// Serialises API requests in this single training host. It is not a multi-instance
/// database concurrency solution.
/// </summary>
public sealed class RequestGate
{
    private readonly SemaphoreSlim gate = new(1, 1);

    public async Task RunAsync(Func<Task> work)
    {
        await gate.WaitAsync();
        try { await work(); }
        finally { gate.Release(); }
    }
}

public static partial class Plumbing
{
    [GeneratedRegex("^[A-Za-z0-9._-]{1,64}$")]
    private static partial Regex SafeId();

    /// <summary>
    /// Correlation: reuse a safe incoming X-Request-Id or generate one, store it in
    /// HttpContext.TraceIdentifier and echo it with the public lab headers.
    /// </summary>
    public static IApplicationBuilder UseLabHeaders(this IApplicationBuilder app, string release, string environment) =>
        app.Use(async (context, next) =>
        {
            var incoming = context.Request.Headers["X-Request-Id"].ToString();
            context.TraceIdentifier = SafeId().IsMatch(incoming) ? incoming : "req-" + Guid.NewGuid().ToString("N")[..12];
            context.Response.OnStarting(() =>
            {
                context.Response.Headers["X-Request-Id"] = context.TraceIdentifier;
                context.Response.Headers["X-Lab-Release"] = release;
                context.Response.Headers["X-Lab-Environment"] = environment;
                return Task.CompletedTask;
            });
            await next(context);
        });

    /// <summary>Maps a controlled save failure to 500 SAVE_FAILED (no stack trace in the body).</summary>
    public static IApplicationBuilder UseErrorMapping(this IApplicationBuilder app) =>
        app.Use(async (context, next) =>
        {
            try
            {
                await next(context);
            }
            catch (SaveFailure failure) when (!context.Response.HasStarted)
            {
                var log = context.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("Academy.Api.Errors");
                log.LogWarning("Save failed for {RequestId}: {Reason}", context.TraceIdentifier, failure.Message);
                context.Response.Clear();
                await Routes.Error(context, 500, "SAVE_FAILED", "The session could not be saved; confirmed state is unchanged.")
                    .ExecuteAsync(context);
            }
            catch (Exception ex) when (!context.Response.HasStarted)
            {
                var log = context.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("Academy.Api.Errors");
                log.LogError(ex, "Unhandled error for {RequestId}", context.TraceIdentifier);
                context.Response.Clear();
                await Routes.Error(context, 500, "INTERNAL_ERROR", "Unexpected server error.").ExecuteAsync(context);
            }
        });

    /// <summary>Only one /api request at a time in this training host.</summary>
    public static IApplicationBuilder UseRequestGate(this IApplicationBuilder app) =>
        app.Use(async (context, next) =>
        {
            if (!context.Request.Path.StartsWithSegments("/api")) { await next(context); return; }
            await context.RequestServices.GetRequiredService<RequestGate>().RunAsync(() => next(context));
        });

    /// <summary>
    /// /health and /healthz: in SQLite mode the check queries the Sessions table, so a reachable
    /// process with a missing schema returns 503.
    /// </summary>
    public static void MapHealth(this WebApplication app)
    {
        async Task<IResult> Health(HttpContext context)
        {
            var db = context.RequestServices.GetService<GameDb>();
            if (db is null) return Results.Text("Healthy");
            try
            {
                await db.Sessions.AsNoTracking().AnyAsync();
                return Results.Text("Healthy");
            }
            catch (Exception)
            {
                return Results.Text("Unhealthy: Sessions table unavailable (apply --migrate)", statusCode: 503);
            }
        }

        app.MapGet("/health", (Delegate)Health);
        app.MapGet("/healthz", (Delegate)Health);
    }

    /// <summary>The explicit migration step: MigrateAsync, never EnsureCreated.</summary>
    public static async Task<int> MigrateAsync(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetService<GameDb>();
        if (db is null)
        {
            Console.Error.WriteLine("--migrate needs STORE=sqlite and GAME_DB=<absolute path>.");
            return 2;
        }

        var pending = (await db.Database.GetPendingMigrationsAsync()).ToList();
        await db.Database.MigrateAsync();
        var applied = await db.Database.GetAppliedMigrationsAsync();
        Console.WriteLine(pending.Count == 0
            ? $"No pending migrations. Applied: {string.Join(", ", applied)}"
            : $"Applied migrations: {string.Join(", ", pending)}");
        Console.WriteLine($"Database: {db.Database.GetDbConnection().DataSource}");
        return 0;
    }
}
