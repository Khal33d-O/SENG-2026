#!/usr/bin/env python3
"""HTTP acceptance checker for the Week 5 session API (W5.01-W5.05).

Run it from your work directory in a second terminal while the host is running:

    python3 check.py --case start      # W5.01 / W5.02: create 201 + Location + F01, GET 200, 400/404 errors
    python3 check.py --case action     # W5.03 / W5.04: East 200/F02, South 409, malformed 400, missing 404
    python3 check.py --case failure    # W5.05: injected after-write failure keeps every F02 field
    python3 check.py --case reload --id <sessionId> --expect F02   # W5.04 retention after restart

Options: --base http://127.0.0.1:5055 (default). Exit code 0 = PASS, 1 = FAIL, 2 = host unreachable.
Only the Python standard library is used.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))


class CheckFailed(Exception):
    pass


def fixture_state(fixture_id):
    """Expected state from fixtures/<id>.json (the shared, independently authored fixtures)."""
    with open(os.path.join(HERE, "fixtures", f"{fixture_id}.json"), encoding="utf-8") as f:
        return json.load(f)["expected"]["state"]


def call(base, method, path, body=None, raw=None, headers=None):
    """Send one request; return (status, headers, parsed JSON or None). Never raises on 4xx/5xx."""
    data = raw.encode("utf-8") if raw is not None else (json.dumps(body).encode("utf-8") if body is not None else None)
    req = urllib.request.Request(base + path, data=data, method=method)
    req.add_header("Accept", "application/json")
    if data is not None:
        req.add_header("Content-Type", "application/json")
    for k, v in (headers or {}).items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            status, hdrs, text = resp.status, dict(resp.headers), resp.read().decode("utf-8")
    except urllib.error.HTTPError as err:
        status, hdrs, text = err.code, dict(err.headers), err.read().decode("utf-8")
    try:
        parsed = json.loads(text) if text else None
    except json.JSONDecodeError:
        parsed = None
    return status, hdrs, parsed


def expect(condition, message):
    if not condition:
        raise CheckFailed(message)


def expect_status(status, wanted, what, body):
    expect(status == wanted, f"{what}: expected HTTP {wanted}, got {status} {json.dumps(body)}")


def expect_error(status, body, wanted_status, wanted_code, what):
    expect_status(status, wanted_status, what, body)
    expect(isinstance(body, dict), f"{what}: error body is not a JSON object")
    expect(body.get("code") == wanted_code, f"{what}: expected code {wanted_code}, got {body.get('code')}")
    expect(isinstance(body.get("message"), str) and body["message"], f"{what}: missing message")
    expect(isinstance(body.get("requestId"), str) and body["requestId"], f"{what}: missing requestId")
    print(f"  ok   {what}: {status} {wanted_code} requestId={body['requestId']}")


def expect_state(envelope, fixture_id, what):
    wanted = fixture_state(fixture_id)
    actual = (envelope or {}).get("state")
    for field in ("position", "movesRemaining", "score", "collected", "status"):
        expect(actual is not None and actual.get(field) == wanted[field],
               f"{what}: state.{field} expected {json.dumps(wanted[field])}, got "
               f"{json.dumps(None if actual is None else actual.get(field))}")
    print(f"  ok   {what}: state equals {fixture_id} {json.dumps(actual)}")


def create(base):
    status, hdrs, body = call(base, "POST", "/api/sessions", {"boardId": "reference"})
    expect_status(status, 201, "POST /api/sessions", body)
    expect(isinstance(body, dict) and body.get("sessionId"), "POST /api/sessions: envelope has no sessionId")
    location = hdrs.get("Location") or hdrs.get("location") or ""
    expect(location.endswith(f"/api/sessions/{body['sessionId']}"),
           f"POST /api/sessions: Location '{location}' does not point to the GET route for {body['sessionId']}")
    expect(body.get("boardId") == "reference", "POST /api/sessions: boardId is not 'reference'")
    print(f"  ok   POST /api/sessions: 201 Location {location}")
    expect_state(body, "F01", "created session")
    return body


def get(base, session_id):
    status, _, body = call(base, "GET", f"/api/sessions/{session_id}")
    expect_status(status, 200, f"GET /api/sessions/{session_id}", body)
    return body


def case_start(base):
    created = create(base)
    retrieved = get(base, created["sessionId"])
    expect(retrieved == created, f"GET after create returned a different envelope: {json.dumps(retrieved)}")
    print("  ok   GET returned ID: 200, same envelope")
    status, _, body = call(base, "POST", "/api/sessions", {})
    expect_error(status, body, 400, "INVALID_REQUEST", "POST {} (missing boardId)")
    status, _, body = call(base, "POST", "/api/sessions", {"boardId": 7})
    expect_error(status, body, 400, "INVALID_REQUEST", "POST non-string boardId")
    status, _, body = call(base, "POST", "/api/sessions", {"boardId": "unknown-board"})
    expect_error(status, body, 404, "NOT_FOUND", "POST unknown boardId")
    print(f"PASS F01 create 201 + retrieve 200 (session {created['sessionId']})")


def move(base, session_id, direction, headers=None):
    return call(base, "POST", f"/api/sessions/{session_id}/actions",
                {"type": "move", "direction": direction}, headers=headers)


def case_action(base):
    created = create(base)
    sid = created["sessionId"]
    status, _, east = move(base, sid, "east")
    expect_status(status, 200, "POST east", east)
    expect_state(east, "F02", "east")
    status, _, body = move(base, sid, "south")
    expect_error(status, body, 409, "ILLEGAL_ACTION", "POST south into the wall")
    expect(get(base, sid) == east, "GET after rejected south differs from the East envelope")
    print("  ok   GET after rejection: exactly the East envelope")
    path = f"/api/sessions/{sid}/actions"
    for label, kwargs in [("missing direction", {"body": {"type": "move"}}),
                          ("unknown direction 'up'", {"body": {"type": "move", "direction": "up"}}),
                          ("numeric direction", {"body": {"type": "move", "direction": 1}}),
                          ("broken JSON '{'", {"raw": "{"})]:
        status, _, body = call(base, "POST", path, **kwargs)
        expect_error(status, body, 400, "INVALID_REQUEST", label)
    expect(get(base, sid) == east, "GET after malformed requests differs from the East envelope")
    print("  ok   GET after malformed requests: still F02")
    status, _, body = move(base, "no-such-session", "east")
    expect_error(status, body, 404, "NOT_FOUND", "POST action for a missing session")
    print(f"PASS action: East 200/F02, South 409 ILLEGAL_ACTION, malformed 400, missing 404 (session {sid})")
    print(json.dumps(east, indent=2))


def case_failure(base):
    created = create(base)
    sid = created["sessionId"]
    status, _, before = move(base, sid, "east")
    expect_status(status, 200, "POST east", before)
    expect_state(before, "F02", "before failure")
    status, _, body = move(base, sid, "east", headers={"X-Training-Failure": "after-write"})
    if status == 200:
        raise CheckFailed("The failure hook did not fire: start the host with TRAINING_FAILURES=1.")
    expect_error(status, body, 500, "SAVE_FAILED", "POST east with X-Training-Failure: after-write")
    after = get(base, sid)
    if after != before:
        raise CheckFailed("failed save retained candidate state: GET after the 500 is "
                          f"{json.dumps(after['state'])}, expected unchanged F02 {json.dumps(before['state'])}")
    print("  ok   GET after SAVE_FAILED: every F02 field unchanged")
    status, _, recovered = move(base, sid, "east")
    expect_status(status, 200, "explicit later East", recovered)
    expect_state(recovered, "F05", "explicit later East")
    print(f"PASS failed save retains every state field; later East succeeds (session {sid})")


def case_reload(base, session_id, fixture_id):
    expect(session_id, "--case reload needs --id <sessionId>")
    body = get(base, session_id)
    expect_state(body, fixture_id, f"reloaded {session_id}")
    print(f"PASS reload {session_id} equals {fixture_id}")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--case", required=True, choices=["start", "action", "failure", "reload"])
    parser.add_argument("--base", default=os.environ.get("CHECK_BASE", "http://127.0.0.1:5055"))
    parser.add_argument("--id", help="session ID for --case reload")
    parser.add_argument("--expect", default="F02", help="fixture ID for --case reload (default F02)")
    args = parser.parse_args()
    base = args.base.rstrip("/")
    try:
        if args.case == "start":
            case_start(base)
        elif args.case == "action":
            case_action(base)
        elif args.case == "failure":
            case_failure(base)
        else:
            case_reload(base, args.id, args.expect)
    except CheckFailed as failure:
        print(f"FAIL {args.case}: {failure}")
        return 1
    except urllib.error.URLError as err:
        print(f"FAIL {args.case}: cannot reach {base} ({err.reason}). Is the host running on port 5055?")
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
