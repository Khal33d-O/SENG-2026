# W5.06 worked examples · API integration tests

[demo.sh](demo.sh) runs both demonstrations from the course `source/` folder.

```bash
python3 "$W5_PACKAGE/run.py" test --workspace "$W5_ATTEMPT/demo-tests"
```

Expected (excerpt): `ok create returns 201`, `ok legal East returns 200`, `ok East moves to x=1`,
`ok East leaves five moves`, `ok subsequent GET equals the confirmed envelope`, then the rejected-flow and
atomic-save lines, `PASS HTTP integration tests (session <id>)`, `PASS run.py test`.

```bash
python3 "$W5_PACKAGE/prepare.py" 06 "$W5_ATTEMPT/owned"
python3 "$W5_PACKAGE/run.py" test --source "$W5_ATTEMPT/owned" --workspace "$W5_ATTEMPT/before"
```

Expected: the accepted-flow lines pass, then
`Unhandled exception. System.InvalidOperationException: Check failed: Complete owned rejected-flow assertions`,
`FAIL run.py test` and a nonzero exit.

Offline trace: POST East 200/F02; POST South 409/`ILLEGAL_ACTION`; GET F02 unchanged; malformed `{`
400/`INVALID_REQUEST`; GET F02 unchanged.
