using System.Text.Json;
using Academy.Rules;

namespace Academy.Api;

/// <summary>HTTP handlers. Routes parse bodies and choose responses; rules and storage are injected.</summary>
public static class Routes
{
    public static void Map(WebApplication app)
    {
        app.MapGet("/api/boards/{id}", GetBoard);
        app.MapPost("/api/sessions", Create);
        app.MapGet("/api/sessions/{id}", Get);
        app.MapPost("/api/sessions/{id}/actions", Act);
    }

    public static IResult GetBoard(string id, HttpContext context) =>
        id == ReferenceBoard.Id
            ? Results.Json(ReferenceBoard.Value, SessionMapping.Json)
            : Error(context, 404, "NOT_FOUND", "Board not found");

    /// <summary>POST /api/sessions { "boardId": "reference" } -> 201 + Location + envelope.</summary>
    public static async Task<IResult> Create(HttpContext context, IGameRules rules, ISessionStore store)
    {
        // Supplied board validation.
        var body = await RequestParser.ReadObjectAsync(context);
        if (body is null) return Error(context, 400, "INVALID_REQUEST", "Body must be a JSON object.");
        if (!RequestParser.TryGetString(body.Value, "boardId", out var boardId))
            return Error(context, 400, "INVALID_REQUEST", "boardId must be a string.");
        if (boardId != ReferenceBoard.Id) return Error(context, 404, "NOT_FOUND", "Board not found");

        // >>> W5.01 owned: Routes.Create after the supplied board validation
        // TODO W5.01: create the envelope from rules.Start, await store.SaveAsync and return
        // Results.Created with a Location that points to the GET route.
        return Error(context, 501, "EXERCISE_INCOMPLETE", "W5.01 exercise: complete Routes.Create.");
        // <<< W5.01 owned
    }

    /// <summary>GET /api/sessions/{id} -> 200 envelope or 404 NOT_FOUND.</summary>
    public static async Task<IResult> Get(string id, HttpContext context, ISessionStore store)
    {
        var session = await store.LoadAsync(id);
        return session is null
            ? Error(context, 404, "NOT_FOUND", "Session not found")
            : Results.Ok(session);
    }

    /// <summary>POST /api/sessions/{id}/actions { "type": "move", "direction": "east" }.</summary>
    public static async Task<IResult> Act(
        string id, HttpContext context, IGameRules rules, ISessionStore store, TrainingFailures failures)
    {
        // Supplied input-shape validation: string type "move" and a known direction.
        var body = await RequestParser.ReadObjectAsync(context);
        if (body is null
            || !RequestParser.TryGetString(body.Value, "type", out var type) || type != "move"
            || !RequestParser.TryGetString(body.Value, "direction", out var direction)
            || !Academy.Rules.Rules.Directions.ContainsKey(direction))
        {
            return Error(context, 400, "INVALID_REQUEST", "Expected { \"type\": \"move\", \"direction\": \"north|east|south|west\" }.");
        }

        // Supplied load of the authoritative session.
        var session = await store.LoadAsync(id);
        if (session is null) return Error(context, 404, "NOT_FOUND", "Session not found");

        // Supplied training-failure flag (TRAINING_FAILURES=1 and X-Training-Failure: after-write).
        var failAfterWrite = failures.Requested(context);

        var result = rules.Apply(ReferenceBoard.Value, session.State, new MoveAction(type, direction));

        if (!result.Accepted) return Error(context, 409, result.Reason!, "Move rejected; confirmed state is unchanged.");

        var updated = session with { State = result.State };
        await store.SaveAsync(updated, failAfterWrite);
        return Results.Ok(updated);
    }

    /// <summary>Every error carries code, message and the request's correlation ID.</summary>
    public static IResult Error(HttpContext context, int status, string code, string message) =>
        Results.Json(new ErrorBody(code, message, context.TraceIdentifier), SessionMapping.Json, statusCode: status);
}

/// <summary>Supplied parser: reads a JSON object body and checks field kinds.</summary>
public static class RequestParser
{
    public static async Task<JsonElement?> ReadObjectAsync(HttpContext context)
    {
        try
        {
            using var doc = await JsonDocument.ParseAsync(context.Request.Body);
            return doc.RootElement.ValueKind == JsonValueKind.Object ? doc.RootElement.Clone() : null;
        }
        catch (JsonException)
        {
            return null; // broken JSON (for example a lone "{") is a 400, not a 500
        }
    }

    public static bool TryGetString(JsonElement body, string name, out string value)
    {
        value = "";
        if (!body.TryGetProperty(name, out var prop) || prop.ValueKind != JsonValueKind.String) return false;
        value = prop.GetString()!;
        return true;
    }
}
