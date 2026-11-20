using Microsoft.EntityFrameworkCore;

namespace Academy.Api;

/// <summary>
/// Retained sessions in SQLite (STORE=sqlite, GAME_DB=absolute path). Scoped, like GameDb:
/// it must never be captured by a singleton.
/// </summary>
public sealed class SqliteStore(GameDb db) : ISessionStore
{
    // >>> W5.04 owned: LoadAsync
    public Task<Session?> LoadAsync(string id)
    {
        // TODO W5.04: add async, query by key with AsNoTracking().SingleOrDefaultAsync and map with FromRow.
        _ = db;
        return Task.FromResult<Session?>(null);
    }
    // <<< W5.04 owned

    // >>> W5.04 owned: SaveAsync
    public Task SaveAsync(Session session, bool failAfterWrite = false)
    {
        // TODO W5.04: add async, map with ToRow, find by key, Add when absent or assign BoardId and
        // StateJson, then await db.SaveChangesAsync().
        throw new SaveFailure("EXERCISE_INCOMPLETE: complete SqliteStore.SaveAsync.");
    }
    // <<< W5.04 owned
}
