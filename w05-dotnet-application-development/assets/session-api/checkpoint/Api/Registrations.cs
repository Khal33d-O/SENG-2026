using Microsoft.EntityFrameworkCore;

namespace Academy.Api;

/// <summary>
/// Dependency injection: the service collection is the registration list ASP.NET Core uses to
/// supply handler parameters such as IGameRules and ISessionStore.
/// </summary>
public static class Registrations
{
    public static IServiceCollection AddGameServices(this IServiceCollection services, IConfiguration config)
    {
        // Supplied plumbing: one request gate (serialises this single training host's requests)
        // and the TRAINING_FAILURES switch.
        services.AddSingleton<RequestGate>();
        services.AddSingleton(new TrainingFailures(config["TRAINING_FAILURES"] == "1"));

        // >>> W5.02 owned: library, memory and interface registrations
        services.AddSingleton<IGameRules, GameRules>();
        services.AddSingleton<MemoryStore>();
        services.AddSingleton<ISessionStore>(sp => sp.GetRequiredService<MemoryStore>());
        // <<< W5.02 owned

        // Supplied configuration branch: STORE replaces the interface registration, never a route
        // or rule. The last ISessionStore registration wins.
        var store = (config["STORE"] ?? "memory").ToLowerInvariant();
        switch (store)
        {
            case "memory":
                break;
            case "traced":
                services.AddSingleton<ISessionStore>(sp => new TracedMemoryStore(
                    sp.GetRequiredService<MemoryStore>(),
                    sp.GetRequiredService<ILogger<TracedMemoryStore>>()));
                break;
            case "sqlite":
                var path = Path.GetFullPath(config["GAME_DB"] ?? "game.db");
                Directory.CreateDirectory(Path.GetDirectoryName(path)!);
                // GameDb and SqliteStore are scoped: one per request.
                services.AddDbContext<GameDb>(options => options.UseSqlite($"Data Source={path}"));
                services.AddScoped<ISessionStore, SqliteStore>();
                break;
            default:
                throw new InvalidOperationException($"Unknown STORE '{store}'. Use memory, traced or sqlite.");
        }

        return services;
    }
}
