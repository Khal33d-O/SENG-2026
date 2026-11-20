using System.Net.Http.Json;
using System.Text;
using System.Text.Json.Nodes;
using static FixtureSupport;

// HTTP integration tests: routing, JSON parsing, dependency injection, the real rule library and the
// SQLite store, through a real local Kestrel process. Run with run.py (it supplies BASE_URL).

var client = CreateClient();

// --- Supplied accepted flow ---------------------------------------------------------------------
var created = await client.PostAsJsonAsync("/api/sessions", new { boardId = "reference" });
Check((int)created.StatusCode == 201, "create returns 201");
var session = await ReadJsonAsync(created);
var id = session["sessionId"]!.GetValue<string>();
Check(JsonNode.DeepEquals(session["state"], FixtureState("F01")), "created state equals F01");

var east = await MoveAsync(client, id, "east");
Check((int)east.StatusCode == 200, "legal East returns 200");
var confirmed = await ReadJsonAsync(east);
Check(confirmed["state"]!["position"]!["x"]!.GetValue<int>() == 1, "East moves to x=1");
Check(confirmed["state"]!["movesRemaining"]!.GetValue<int>() == 5, "East leaves five moves");
Check(JsonNode.DeepEquals(confirmed, await GetSessionAsync(client, id)), "subsequent GET equals the confirmed envelope");

// --- Rejected flow ------------------------------------------------------------------------------
// South after East hits the centre wall: 409 ILLEGAL_ACTION and nothing stored changes.
var south = await MoveAsync(client, id, "south");
Check((int)south.StatusCode == 409, "South into the wall returns 409");
CheckError(await ReadJsonAsync(south), "ILLEGAL_ACTION", "South into the wall");
Check(JsonNode.DeepEquals(confirmed, await GetSessionAsync(client, id)), "GET after the wall equals the confirmed envelope");

// Raw "{" cannot be produced by serialising an object, so StringContent is used.
var malformed = await client.PostAsync($"/api/sessions/{id}/actions",
    new StringContent("{", Encoding.UTF8, "application/json"));
Check((int)malformed.StatusCode == 400, "malformed JSON returns 400");
CheckError(await ReadJsonAsync(malformed), "INVALID_REQUEST", "malformed JSON");
Check(JsonNode.DeepEquals(confirmed, await GetSessionAsync(client, id)), "GET after malformed JSON equals the confirmed envelope");

// Independently chosen case: a well-formed body with an unknown direction is input, not a rule: 400.
var unknown = await MoveAsync(client, id, "up");
Check((int)unknown.StatusCode == 400, "unknown direction 'up' returns 400");
CheckError(await ReadJsonAsync(unknown), "INVALID_REQUEST", "unknown direction");
Check(JsonNode.DeepEquals(confirmed, await GetSessionAsync(client, id)), "GET after the unknown direction is unchanged");

// --- Supplied atomic save check (only when the host runs with TRAINING_FAILURES=1) ---------------
if (Environment.GetEnvironmentVariable("TRAINING_FAILURES") == "1")
{
    var request = new HttpRequestMessage(HttpMethod.Post, $"/api/sessions/{id}/actions")
    {
        Content = JsonContent.Create(new { type = "move", direction = "east" }),
    };
    request.Headers.Add("X-Training-Failure", "after-write");
    var failed = await client.SendAsync(request);
    Check((int)failed.StatusCode == 500, "after-write failure returns 500");
    CheckError(await ReadJsonAsync(failed), "SAVE_FAILED", "after-write failure");
    Check(JsonNode.DeepEquals(confirmed, await GetSessionAsync(client, id)), "GET after SAVE_FAILED keeps every confirmed field");
}

Console.WriteLine($"PASS HTTP integration tests (session {id})");
return 0;
