using System.Text.Json;
using Academy.Rules;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Academy.Api;

/// <summary>One row of the Sessions table. StateJson holds the whole GameState as JSON text.</summary>
public sealed class SessionRow
{
    public string SessionId { get; set; } = "";
    public string BoardId { get; set; } = "";
    public string StateJson { get; set; } = "";
}

/// <summary>
/// Supplied EF Core context (scoped: one per request). The schema decisions below are fixed and
/// match the InitialSessions migration; do not change them in the sessions.
/// </summary>
public sealed class GameDb(DbContextOptions<GameDb> options) : DbContext(options)
{
    public DbSet<SessionRow> Sessions => Set<SessionRow>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<SessionRow>(row =>
        {
            row.ToTable("Sessions");
            row.HasKey(s => s.SessionId);
            row.Property(s => s.BoardId).IsRequired();
            row.Property(s => s.StateJson).IsRequired();
        });
    }
}

/// <summary>Lets the EF tools build the context at design time (used to author the migration).</summary>
public sealed class GameDbDesignTimeFactory : IDesignTimeDbContextFactory<GameDb>
{
    public GameDb CreateDbContext(string[] args) =>
        new(new DbContextOptionsBuilder<GameDb>().UseSqlite("Data Source=design-time.db").Options);
}

/// <summary>Converts between the API envelope and the stored row.</summary>
public static class SessionMapping
{
    /// <summary>Web defaults: camelCase names, so every GameState field round-trips.</summary>
    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public static SessionRow ToRow(Session session)
    {
        return new SessionRow
        {
            SessionId = session.SessionId,
            BoardId = session.BoardId,
            StateJson = JsonSerializer.Serialize(session.State, Json),
        };
    }

    public static Session FromRow(SessionRow row) =>
        new(row.SessionId, row.BoardId,
            JsonSerializer.Deserialize<GameState>(row.StateJson, Json)
                ?? throw new InvalidOperationException($"Session {row.SessionId} has empty state."));
}
