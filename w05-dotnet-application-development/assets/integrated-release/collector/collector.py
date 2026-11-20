#!/usr/bin/env python3
"""Supplied local collector bridge for W5.07 (standard library only).

The API's JSON exporter POSTs span records here. The bridge:
  * appends every record to action-spans.jsonl (local evidence), and
  * translates records into Loki push data (POST <loki>/loki/api/v1/push) when --loki is given.
This bridge is deliberately simple and is NOT an OTLP receiver.

Without --loki it runs in LOCAL MOCK mode and answers GET /mock/query?requestId=... from its own file.
That mock answer is NOT Grafana/Loki evidence and run.py labels it so.

    python collector.py --port 4319 --out action-spans.jsonl [--loki http://127.0.0.1:3100]
"""
import argparse
import json
import threading
import time
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

LOCK = threading.Lock()


def make_handler(out_path, loki):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def reply(self, status, body):
            data = json.dumps(body).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def do_GET(self):
            url = urllib.parse.urlparse(self.path)
            if url.path == "/healthz":
                return self.reply(200, {"status": "Healthy", "loki": loki or "local-mock"})
            if url.path == "/mock/query":
                wanted = urllib.parse.parse_qs(url.query).get("requestId", [""])[0]
                with LOCK, open(out_path, encoding="utf-8") as fh:
                    rows = [json.loads(line) for line in fh if line.strip()]
                return self.reply(200, {"mode": "local-mock (NOT Grafana/Loki evidence)",
                                        "records": [r for r in rows if r.get("requestId") == wanted]})
            self.reply(404, {"code": "NOT_FOUND"})

        def do_POST(self):
            if self.path != "/v1/action-spans":
                return self.reply(404, {"code": "NOT_FOUND"})
            length = int(self.headers.get("Content-Length") or 0)
            try:
                records = json.loads(self.rfile.read(length) or b"[]")
            except json.JSONDecodeError:
                return self.reply(400, {"code": "INVALID_REQUEST"})
            if isinstance(records, dict):
                records = [records]
            with LOCK, open(out_path, "a", encoding="utf-8") as fh:
                for r in records:
                    fh.write(json.dumps(r) + "\n")
            if loki and records:
                push(loki, records)
            self.reply(202, {"accepted": len(records)})

    return Handler


def push(loki, records):
    """Loki push format: streams of [nanosecond timestamp, log line] with low-cardinality labels."""
    streams = {}
    for r in records:
        labels = {"job": r.get("job", "academy-w5-actions"), "session": str(r.get("session", "local"))}
        key = json.dumps(labels, sort_keys=True)
        streams.setdefault(key, {"stream": labels, "values": []})["values"].append(
            [str(time.time_ns()), json.dumps(r)])
    body = json.dumps({"streams": list(streams.values())}).encode()
    req = urllib.request.Request(loki.rstrip("/") + "/loki/api/v1/push", data=body, method="POST",
                                 headers={"Content-Type": "application/json"})
    try:
        urllib.request.urlopen(req, timeout=5).read()
    except Exception as err:  # delivery failure is visible in the collector log, never invented
        print(f"collector: Loki push failed: {err}", flush=True)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=4319)
    parser.add_argument("--out", default="action-spans.jsonl")
    parser.add_argument("--loki", default="")
    args = parser.parse_args()
    open(args.out, "a", encoding="utf-8").close()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), make_handler(args.out, args.loki))
    print(f"collector bridge on http://127.0.0.1:{args.port}/v1/action-spans -> "
          f"{args.loki or 'LOCAL MOCK (no Loki)'}; file {args.out}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
