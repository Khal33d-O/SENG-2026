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
// >>> W5.06 owned: domain rejection and malformed JSON assertions
// TODO W5.06: replace this failing check with your own rejected-flow assertions:
// South after East -> 409 ILLEGAL_ACTION and raw malformed JSON "{" -> 400 INVALID_REQUEST,
// each with a non-empty requestId and followed by an unchanged GET (JsonNode.DeepEquals).
Check(false, "Complete owned rejected-flow assertions");
// <<< W5.06 owned

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
