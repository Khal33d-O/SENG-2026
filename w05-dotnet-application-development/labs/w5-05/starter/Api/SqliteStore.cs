using Microsoft.EntityFrameworkCore;

namespace Academy.Api;

/// <summary>
/// Retained sessions in SQLite (STORE=sqlite, GAME_DB=absolute path). Scoped, like GameDb:
/// it must never be captured by a singleton.
/// </summary>
public sealed class SqliteStore(GameDb db) : ISessionStore
{
    public async Task<Session?> LoadAsync(string id)
    {
        // Query by key; AsNoTracking because this read is not going to be modified.
        var row = await db.Sessions.AsNoTracking().SingleOrDefaultAsync(s => s.SessionId == id);
        return row is null ? null : SessionMapping.FromRow(row);
    }

    public async Task SaveAsync(Session session, bool failAfterWrite = false)
    {
        // >>> W5.05 owned: transaction lifetime
        // TODO W5.05: begin the outer transaction here (await using) so a failure before commit rolls back.
        // <<< W5.05 owned
        var mapped = SessionMapping.ToRow(session);
        var row = await db.Sessions.SingleOrDefaultAsync(s => s.SessionId == session.SessionId);
        if (row is null)
        {
            db.Sessions.Add(mapped);
        }
        else
        {
            row.BoardId = mapped.BoardId;
            row.StateJson = mapped.StateJson;
        }

        await db.SaveChangesAsync();
        // Supplied teaching failure: SQL has written the candidate row, but nothing is committed yet.
        if (failAfterWrite) throw new SaveFailure();
        // >>> W5.05 owned: commit
        // TODO W5.05: commit only on the successful path, after the failure guard.
        // <<< W5.05 owned
    }
}
