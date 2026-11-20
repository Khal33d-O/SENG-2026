# W5.02 worked examples · Dependency injection and service boundaries

| Script | Demonstration | Expected |
|---|---|---|
| [demo1.sh](demo1.sh) | Demo 1 · Register library and memory services | before: POST `201` then GET `404` (`FAIL start`); after the three singleton registrations: `PASS F01 create 201 + retrieve 200` |
| [demo2.sh](demo2.sh) | Demo 2 · Replace through the interface (`STORE=traced`) | same `201`/F01 and `200`; host output contains `Training store: load <id>` |

```bash
STORE=traced dotnet run --no-build --project Api -- --urls http://127.0.0.1:5055
```

```bash
python3 check.py --case start
```

Offline trace: transient dictionary: `POST` → `201`; `GET` returned ID → `404`. Singleton/decorator:
`POST` → `201`; `GET` returned ID → `200`, F01 unchanged.
