# W1.06 worked examples: trace the caller and destination, then repair one address

Instructor demonstration from the lab's `code` folder ([`../../labs/w1-06/code/`](../../labs/w1-06/code/)). Tested
2026-10-10 with Podman 5.7.0. Prepare the image once with `python3 lab.py prepare`.

## Worked Example 1: trace the caller and destination

Start the prepared API and a frontend (any settings file), draw the route, then predict and run:

```bash
cd ../../labs/w1-06/code
python3 lab.py up --settings checkpoints/core.env
```

```bash
python3 lab.py probe --from api --url http://127.0.0.1:8181/api/boards/reference
python3 lab.py probe --from frontend --url http://127.0.0.1:8181/api/boards/reference
python3 lab.py probe --from frontend --url http://api:8181/api/boards/reference
```

Expected: the API self-probe returns `HTTP 200`; frontend loopback returns `NO_HTTP_RESPONSE` with exit 3; the
frontend's alias probe returns `HTTP 200` and `w106-reference-api`. `--from` selects where the probe executes; it does
not rewrite the URL or move the listener.

## Worked Example 2: apply and verify one address repair

Use the equipment-preview configuration in `code/guided/settings.env` (upstream points at frontend loopback):

```bash
python3 lab.py up --settings guided/settings.env
```

Click **Load reference board**: frontend 502 (`UPSTREAM_UNREACHABLE`). Change only
`API_UPSTREAM=http://127.0.0.1:8181` to `API_UPSTREAM=http://api:8181`, save, run the same `up` again and reload: API 200
and the reference board. Then click **Request missing board**: API 404 `NOT_FOUND`, forwarded by the frontend.

```bash
python3 lab.py check
```

The check verifies identity and reference fields through the configured route; it does not execute a browser.

## Close

```bash
python3 lab.py down
```
