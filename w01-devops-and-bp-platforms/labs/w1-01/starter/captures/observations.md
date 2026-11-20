# Captured observations (recorded run, not a live result)

Recorded by the course author on 2026-10-10 with Podman 5.7.0 and the supplied files in `supplied-runtime/`.
Use these when your browser or the instructor's service is unavailable. Mark any work based on them as
**captured evidence**; they do not replace your own interpretation. Request ids and image ids differ on every run.

## 1. Reference request (original image, release foundation-a, setting workshop-blue)

Image: `localhost/w1-01-a`, image ID `f2bfd1144472b967e17d7ff903060548423a247ae602835d5ac83d4d43470061`. Address used: `http://127.0.0.1:5081`.
The page displayed: `HTTP 200 | foundation-a | workshop-blue`.

```http
GET /api/boards/reference HTTP/1.1

HTTP/1.1 200 OK
Content-Length: 267
Content-Type: application/json
Date: Sat, 10 Oct 2026 12:23:20 GMT
Server: Kestrel
X-Lab-Release: foundation-a
X-Lab-Environment: workshop-blue
X-Request-Id: 17ffda75661241f3b0af303f3c80cfca

{
  "id": "reference",
  "name": "Reference treasure hunt",
  "width": 3,
  "height": 3,
  "start": { "x": 0, "y": 0 },
  "walls": [{ "x": 1, "y": 1 }],
  "treasures": [{ "id": "t1", "x": 2, "y": 0, "value": 10 }],
  "exit": { "x": 2, "y": 2 },
  "initialMoves": 6
}
```

## 2. Missing board request (same running container)

The page displayed: `HTTP 404 | foundation-a | workshop-blue`.

```http
GET /api/boards/missing HTTP/1.1

HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8
Date: Sat, 10 Oct 2026 12:23:21 GMT
Server: Kestrel
Transfer-Encoding: chunked
X-Lab-Release: foundation-a
X-Lab-Environment: workshop-blue
X-Request-Id: 5df98f19fe1b4c3d82a99a5dc863fb89

{"code":"NOT_FOUND","message":"Board not found"}
```

## 3. Source edited in a copy, original container still running

`Program.cs` in a separate copy now says `foundation-b`; nothing was rebuilt. The original container still reports:

```text
X-Lab-Release: foundation-a
X-Lab-Environment: workshop-blue
```

## 4. Changed copy published and built as `localhost/w1-01-b` (image ID `f79e3fab55e44f4f8951140fecc18ea795f1e07273d8706fb9a27d7f216f693f`), started with runtime.env

```text
X-Lab-Release: foundation-b
X-Lab-Environment: workshop-blue
```

## 5. Same `w1-01-b` image started with `LAB_ENV=workshop-green`

```text
X-Lab-Release: foundation-b
X-Lab-Environment: workshop-green
```

## 6. Health

`GET /healthz` returned `200` with body `Healthy` for every container above.
