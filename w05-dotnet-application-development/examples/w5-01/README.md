# W5.01 worked examples · ASP.NET Core and HTTP contracts

Run from the course `source/` folder.

| Script | Demonstration | Expected |
|---|---|---|
| [demo1.sh](demo1.sh) | Demo 1 · Run the supplied in-memory route (complete checkpoint, `STORE=memory`) | `HTTP/1.1 201 Created`, `Location: /api/sessions/<id>`, state F01; `PASS F01 create 201 + retrieve 200` |
| [demo2.sh](demo2.sh) | Demo 2 · Add the bounded route around the library | before: `501 EXERCISE_INCOMPLETE` and `FAIL start`; after applying the three route statements: `PASS` |

The commands each script runs are the book's:

```bash
python3 learner/units/w05-dotnet-application-development/assets/session-api/prepare.py 01 /tmp/academy-w5-01
cd /tmp/academy-w5-01
dotnet restore Api/Api.csproj
dotnet build Api/Api.csproj --no-restore
STORE=memory dotnet run --no-build --project Api -- --urls http://127.0.0.1:5055
```

Second terminal:

```bash
curl -i -H 'Content-Type: application/json' -d '{"boardId":"reference"}' http://127.0.0.1:5055/api/sessions
python3 check.py --case start
```

Expected response (IDs differ on every run):

```
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /api/sessions/<sessionId>
X-Request-Id: req-<12 hex>

{"sessionId":"<sessionId>","boardId":"reference","state":{"position":{"x":0,"y":0},"movesRemaining":6,"score":0,"collected":[],"status":"playing"},"id":"<sessionId>"}
```

Offline trace: `POST {}` → `400 INVALID_REQUEST`; `POST {boardId:reference}` → `201`, Location
`/api/sessions/<id>`, state F01; `GET <id>` → `200`, same envelope.
