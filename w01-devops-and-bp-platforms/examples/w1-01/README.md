# W1.01 worked examples: follow the board request and a changed release

The instructor runs these steps; learners observe in the browser's Network panel. All files come from
[`../../labs/w1-01/starter/supplied-runtime/`](../../labs/w1-01/starter/supplied-runtime/). Run every command from
that folder. Commands below use Podman (`docker` works the same way). Tested 2026-10-10 with .NET SDK 10.0.102
(course pin 10.0.401, `global.json` rolls forward), Podman 5.7.0 and the pinned ASP.NET 10.0.12 base.

## Prepare the original image (before class)

```bash
cd ../../labs/w1-01/starter/supplied-runtime
dotnet publish -c Release -o publish --nologo
podman build -t localhost/w1-01-a -f Containerfile .
podman image inspect localhost/w1-01-a --format '{{.Id}}'
podman run -d --name w101-a -p 127.0.0.1:5081:8080 --env-file runtime.env localhost/w1-01-a
```

Open `http://127.0.0.1:5081/`. The browser has loaded the page but has not requested a board.

## Worked Example 1: follow the board request

1. Open Developer tools → Network, filter with `boards`.
2. Press **Load board** with **Reference treasure hunt** selected. Select the request row.
3. Headers: `GET`, `/api/boards/reference`, status `200`, `X-Lab-Release: foundation-a`, `X-Lab-Environment: workshop-blue`.
4. Response: `width: 3`, `height: 3`, `initialMoves: 6`. The page reports `HTTP 200 | foundation-a | workshop-blue`.

Terminal equivalent: `curl -i http://127.0.0.1:5081/api/boards/reference`.

## Worked Example 2: follow a changed release

Keep `w101-a` running. In a separate copy, change the release text and package it:

```bash
cd ..
cp -r supplied-runtime copy-b && rm -rf copy-b/publish copy-b/bin copy-b/obj
# edit copy-b/Program.cs: const string Release = "foundation-b";
curl -si http://127.0.0.1:5081/api/boards/reference | grep X-Lab     # still foundation-a
cd copy-b
dotnet publish -c Release -o publish --nologo
podman build -t localhost/w1-01-b -f Containerfile .
podman run -d --name w101-b -p 127.0.0.1:5082:8080 --env-file runtime.env localhost/w1-01-b
curl -si http://127.0.0.1:5082/api/boards/reference | grep X-Lab     # foundation-b, workshop-blue
```

## Runtime configuration changes one instance

```bash
podman run -d --name w101-green -p 127.0.0.1:5083:8080 -e LAB_ENV=workshop-green localhost/w1-01-b
curl -si http://127.0.0.1:5083/api/boards/reference | grep X-Lab     # foundation-b, workshop-green
```

The release stays the same because the image is unchanged; the environment value changes because the new process
receives a different setting.

## Missing board (used in the lab challenge)

```bash
curl -si http://127.0.0.1:5081/api/boards/missing
# HTTP/1.1 404 ... {"code":"NOT_FOUND","message":"Board not found"}
```

## Teardown (instructor's own containers only)

```bash
podman rm -f w101-a w101-b w101-green
rm -rf ../copy-b
```

Recorded results of exactly these steps are in
[`../../labs/w1-01/starter/captures/observations.md`](../../labs/w1-01/starter/captures/observations.md).
