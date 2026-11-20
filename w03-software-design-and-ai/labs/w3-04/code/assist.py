"""W3.04 assisted-workflow helper. Run from the lab's code directory (Windows: python instead of python3).

  W304_ATTEMPT=$(python3 assist.py prepare --prompt ../document/demo-task.txt)
  python3 assist.py inspect "$W304_ATTEMPT"
  python3 assist.py check "$W304_ATTEMPT"
  python3 assist.py run "$W304_ATTEMPT" [--mode recorded|manual|external]
  python3 assist.py recover "$W304_ATTEMPT"

prepare prints the path of this attempt's record (attempts/<id>/record.json). Every attempt has its own
directory; nothing is overwritten. NO model is called by this helper:

  --mode recorded  (default) replays the course's recorded demonstration run: its events and its edit.
  --mode manual    you edit <attempt>/workspace/src/rules.ts yourself first; run records it as a human edit.
  --mode external  a facilitator-prepared assistant edited the workspace (outside this helper, under the
                   generated permission file); run records the resulting diff as an external-tool edit.

Each attempt may be run once. check builds a FRESH copy of the workspace and records the rule and test
hashes it actually executed, plus a file-scope audit against the pristine starter.
"""
import argparse, difflib, hashlib, json, os, shutil, subprocess, sys, tempfile, time
if hasattr(sys.stdout, "reconfigure"):  # Windows consoles: print test-runner symbols safely
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

CODE = os.path.dirname(os.path.abspath(__file__))
STARTER = os.path.join(CODE, "starter")
ATTEMPTS = os.path.join(CODE, "attempts")
RULE = os.path.join("src", "rules.ts")
IGNORE = shutil.ignore_patterns("node_modules", "dist")


def sha(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def files_under(root):
    out = {}
    for base, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in ("node_modules", "dist")]
        for name in files:
            full = os.path.join(base, name)
            out[os.path.relpath(full, root).replace(os.sep, "/")] = sha(full)
    return out


def load(record_path):
    record_path = os.path.abspath(record_path)
    if os.path.isdir(record_path):
        record_path = os.path.join(record_path, "record.json")
    if not os.path.exists(record_path):
        sys.exit(f"no attempt record at {record_path}: use the path printed by prepare")
    with open(record_path, encoding="utf-8") as f:
        return record_path, json.load(f)


def save(record_path, record):
    with open(record_path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(record, f, indent=2)


def event(attempt, kind, **data):
    with open(os.path.join(attempt, "events.jsonl"), "a", encoding="utf-8", newline="\n") as f:
        f.write(json.dumps({"ts": time.strftime("%Y-%m-%dT%H:%M:%S"), "type": kind, **data}) + "\n")


def permissions(workspace):
    """Exact-path permission configuration for a facilitator-prepared tool (version-1 style: ordered rules,
    singular `permission`). It is generated for inspection; this helper never executes a tool with it.
    Permission rules are not a security sandbox."""
    ws = workspace.replace(os.sep, "/")
    allow_read = [f"{ws}/contract.md", f"{ws}/src/rules.ts", f"{ws}/tests/rules.test.mjs"]
    return {
        "$comment": "Prepared W3.04 boundary: three reads, one editable file; shell, web and delegation denied.",
        "permission": {
            "read": {**{p: "allow" for p in allow_read}, "*": "deny"},
            "edit": {f"{ws}/src/rules.ts": "allow", "*": "deny"},
            "bash": "deny",
            "webfetch": "deny",
            "task": "deny",
            "*": "deny",
        },
    }


def cmd_prepare(args):
    prompt = os.path.abspath(args.prompt)
    if not os.path.exists(prompt):
        sys.exit(f"instruction file not found: {args.prompt}")
    os.makedirs(ATTEMPTS, exist_ok=True)
    stamp = time.strftime("%Y%m%d-%H%M%S")
    n = 1
    while os.path.exists(os.path.join(ATTEMPTS, f"attempt-{stamp}-{n}")):
        n += 1
    attempt = os.path.join(ATTEMPTS, f"attempt-{stamp}-{n}")
    workspace = os.path.join(attempt, "workspace")
    shutil.copytree(STARTER, workspace, ignore=IGNORE)
    os.makedirs(os.path.join(attempt, "original"))
    shutil.copy(os.path.join(workspace, RULE), os.path.join(attempt, "original", "rules.ts"))
    shutil.copy(prompt, os.path.join(attempt, "instruction.txt"))
    with open(os.path.join(attempt, "permissions.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(permissions(workspace), f, indent=2)
    record = {"attempt": attempt, "workspace": workspace, "instruction": "instruction.txt",
              "instructionSha256": sha(prompt), "originalRuleSha256": sha(os.path.join(workspace, RULE)),
              "pristine": files_under(STARTER), "run": None, "checks": [], "recoveries": []}
    record_path = os.path.join(attempt, "record.json")
    save(record_path, record)
    event(attempt, "prepared", instruction=os.path.basename(prompt))
    print(record_path)


def diff_rule(record):
    original = open(os.path.join(record["attempt"], "original", "rules.ts"), encoding="utf-8").read().splitlines()
    current = open(os.path.join(record["workspace"], RULE), encoding="utf-8").read().splitlines()
    return list(difflib.unified_diff(original, current, "original/src/rules.ts", "workspace/src/rules.ts", lineterm=""))


def scope(record):
    now = files_under(record["workspace"])
    before = record["pristine"]
    changed = sorted(p for p in set(now) | set(before) if now.get(p) != before.get(p))
    return changed


def cmd_inspect(args):
    record_path, record = load(args.attempt)
    print(f"attempt:     {record['attempt']}")
    print(f"instruction: {os.path.join(record['attempt'], 'instruction.txt')}")
    print("---- instruction ----")
    print(open(os.path.join(record["attempt"], "instruction.txt"), encoding="utf-8").read().rstrip())
    print("---- prepared permissions (exact workspace paths) ----")
    print(open(os.path.join(record["attempt"], "permissions.json"), encoding="utf-8").read().rstrip())
    print("---- run ----")
    print(json.dumps(record["run"], indent=2) if record["run"] else "not run yet")
    events = os.path.join(record["attempt"], "events.jsonl")
    if os.path.exists(events):
        print("---- events ----")
        print(open(events, encoding="utf-8").read().rstrip())
    print("---- changed files versus the pristine starter ----")
    print("\n".join(scope(record)) or "(none)")
    print("---- rule diff ----")
    print("\n".join(diff_rule(record)) or "(no change)")
    print("---- checks ----")
    for c in record["checks"]:
        print(f"{c['id']}: exit {c['exitCode']}  pass {c['pass']}/{c['tests']}  rule {c['ruleSha256'][:12]}  tests {c['testSha256'][:12]}")


def find_tsc():
    local = os.path.join(STARTER, "node_modules", "typescript", "bin", "tsc")
    if os.path.exists(local):
        return ["node", local]
    found = shutil.which("tsc")
    if not found:
        sys.exit("TypeScript not found: run `npm ci --ignore-scripts --no-audit --no-fund` in code/starter first.")
    return [found]


def cmd_check(args):
    record_path, record = load(args.attempt)
    n = len(record["checks"]) + 1
    tmp = tempfile.mkdtemp(prefix=f"w304-check-{n}-")
    try:
        fresh = os.path.join(tmp, "starter")
        shutil.copytree(record["workspace"], fresh, ignore=IGNORE)
        result = {"id": f"check-{n}", "ts": time.strftime("%Y-%m-%dT%H:%M:%S"),
                  "ruleSha256": sha(os.path.join(fresh, RULE)), "testSha256": sha(os.path.join(fresh, "tests", "rules.test.mjs")),
                  "changedFiles": scope(record)}
        build = subprocess.run(find_tsc() + ["-p", "tsconfig.json"], cwd=fresh, capture_output=True, text=True, encoding="utf-8", errors="replace")
        if build.returncode:
            out, code = build.stdout + build.stderr, build.returncode
            result.update(tests=0, passed=0)
        else:
            run = subprocess.run(["node", "--test", "--test-reporter=tap", "tests/rules.test.mjs"], cwd=fresh, capture_output=True, text=True, encoding="utf-8", errors="replace")
            out, code = run.stdout + run.stderr, run.returncode
        count = lambda key: next((int(l.split()[2]) for l in out.splitlines() if l.startswith(f"# {key} ")), 0)
        result.update(exitCode=code, tests=count("tests"), **{"pass": count("pass"), "fail": count("fail")})
        os.makedirs(os.path.join(record["attempt"], "checks"), exist_ok=True)
        with open(os.path.join(record["attempt"], "checks", f"check-{n}.txt"), "w", encoding="utf-8", newline="\n") as f:
            f.write(out)
        record["checks"].append(result)
        save(record_path, record)
        for line in out.splitlines():
            if line.startswith(("ok ", "not ok ", "# tests", "# pass", "# fail")) or "expected" in line or "actual" in line:
                print(line)
        print(f"recorded {result['id']}: rule sha256 {result['ruleSha256'][:12]}, test sha256 {result['testSha256'][:12]}, "
              f"changed files: {', '.join(result['changedFiles']) or 'none'}")
        return code
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def cmd_run(args):
    record_path, record = load(args.attempt)
    if record["run"]:
        sys.exit("this attempt has already used its one run; prepare a new attempt only when the facilitator directs it")
    attempt, workspace = record["attempt"], record["workspace"]
    if args.mode == "recorded":
        recorded = json.load(open(os.path.join(CODE, "recorded", "demo-run.json"), encoding="utf-8"))
        for e in recorded["events"]:
            event(attempt, e["type"], **{k: v for k, v in e.items() if k != "type"}, source="recorded demonstration")
        shutil.copy(os.path.join(CODE, "recorded", recorded["editedFile"]), os.path.join(workspace, RULE))
        status = {"mode": "recorded", "processExit": recorded["processExit"], "finalMessage": recorded["finalMessage"]}
    else:
        if not diff_rule(record) and not scope(record):
            sys.exit(f"no change found in {workspace}: make the {args.mode} edit first, then run")
        event(attempt, "edit", path="src/rules.ts", author="human" if args.mode == "manual" else "external tool (facilitator-prepared)")
        status = {"mode": args.mode, "processExit": 0,
                  "finalMessage": "edit recorded by assist.py; no checks were run by the editor"}
    status["changedFiles"] = scope(record)
    record["run"] = status
    save(record_path, record)
    event(attempt, "finished", **status)
    print(json.dumps(status, indent=2))


def cmd_recover(args):
    record_path, record = load(args.attempt)
    attempt, workspace = record["attempt"], record["workspace"]
    n = len(record["recoveries"]) + 1
    backup = os.path.join(attempt, f"recovery-{n}")
    os.makedirs(backup)
    for src, name in ((os.path.join(workspace, RULE), "rules.ts"), (os.path.join(attempt, "instruction.txt"), "instruction.txt")):
        shutil.copy2(src, os.path.join(backup, name))
        if sha(src) != sha(os.path.join(backup, name)):
            sys.exit(f"backup verification failed for {name}; nothing restored")
    shutil.copy(os.path.join(attempt, "original", "rules.ts"), os.path.join(workspace, RULE))
    record["recoveries"].append({"backup": backup, "ts": time.strftime("%Y-%m-%dT%H:%M:%S")})
    save(record_path, record)
    event(attempt, "recovered", backup=backup)
    print(f"verified backup of rule and instruction in {backup}; original rule restored. "
          "Prior events and checks are intact. Recovery is not evidence that the task was completed.")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="command", required=True)
    pr = sub.add_parser("prepare"); pr.add_argument("--prompt", required=True); pr.set_defaults(fn=cmd_prepare)
    for name, fn in (("inspect", cmd_inspect), ("check", cmd_check), ("recover", cmd_recover)):
        s = sub.add_parser(name); s.add_argument("attempt"); s.set_defaults(fn=fn)
    r = sub.add_parser("run"); r.add_argument("attempt"); r.add_argument("--mode", choices=["recorded", "manual", "external"], default="recorded"); r.set_defaults(fn=cmd_run)
    args = p.parse_args()
    return args.fn(args) or 0


if __name__ == "__main__":
    sys.exit(main())
