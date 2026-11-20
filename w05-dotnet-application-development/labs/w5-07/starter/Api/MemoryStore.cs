using System.Collections.Concurrent;

namespace Academy.Api;

/// <summary>
/// In-memory sessions for one running process. The dictionary only survives between requests
/// when this object is registered as a singleton.
/// </summary>
public sealed class MemoryStore : ISessionStore
{
    private readonly ConcurrentDictionary<string, Session> sessions = new();

    public Task<Session?> LoadAsync(string id) =>
        Task.FromResult(sessions.TryGetValue(id, out var session) ? session : null);

    public Task SaveAsync(Session session, bool failAfterWrite = false)
    {
        sessions.TryGetValue(session.SessionId, out var previous);
        sessions[session.SessionId] = session;
        if (failAfterWrite)
        {
            // Memory has no transaction, so the training failure restores the previous value itself.
            if (previous is null) sessions.TryRemove(session.SessionId, out _);
            else sessions[session.SessionId] = previous;
            throw new SaveFailure();
        }
        return Task.CompletedTask;
    }
}
