namespace Academy.Api;

/// <summary>
/// Supplied decorator selected with STORE=traced. It writes a load message and delegates to the
/// same storage contract, so routes and rules are unchanged.
/// </summary>
public sealed class TracedMemoryStore(MemoryStore inner, ILogger<TracedMemoryStore> log) : ISessionStore
{
    public Task<Session?> LoadAsync(string id)
    {
        log.LogInformation("Training store: load {SessionId}", id);
        return inner.LoadAsync(id);
    }

    public Task SaveAsync(Session session, bool failAfterWrite = false)
    {
        log.LogInformation("Training store: save {SessionId}", session.SessionId);
        return inner.SaveAsync(session, failAfterWrite);
    }
}
