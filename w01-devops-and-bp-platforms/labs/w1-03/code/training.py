"""LOCAL PR TRAINING: a local pull-request rehearsal for W1.03.

Real Git commits in disposable local repositories; the proposal, checks and reviews are plain JSON
in the workspace (proposal.json). Role names are practice labels, not authenticated accounts.
This tool never calls GitHub, BP or any network service.

Commands (run from the lab folder; see README.md):
  init     --dest DIR --scenario guided|challenge|demo   create origins + clones (refuses an existing DIR)
  baseline --workspace DIR                              check the untouched starting state
  open     --workspace DIR --branch B --description F   open a proposal for a PUBLISHED branch
  update   --workspace DIR --branch B --description F   record the branch's current head + description
  check    --workspace DIR                              syntax/preview check of the proposal's committed head
  show     --workspace DIR                              print the proposal record
  review   --workspace DIR --reviewer R --path P --line N --comment F --decision comment|request-changes|approve
  verify   --workspace DIR                              final gate for the challenge
"""

import argparse
import configparser
import datetime as dt
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

sys.dont_write_bytecode = True

BANNER = "LOCAL PR TRAINING (local practice records only; no GitHub or BP service is contacted)"
AUTHOR = "learner-a"
DECISIONS = ("comment", "request-changes", "approve")
BASE_INI = "[deployment]\nnotice = Welcome to the workshop.\nreplicas = 1\nenvironment = training\n"

# Final configuration each scenario's governing request asks for (used by verify).
SCENARIOS = {
    "guided": {"notice": "Use the side entrance.", "replicas": "1", "request": "guided request"},
    "demo": {"notice": "Workshop starts at 09:30.", "replicas": "1", "request": "demo request"},
    "challenge": {"notice": "Choose Reference treasure hunt.", "replicas": "1", "request": "R2 (review update)"},
}

APP_README = """# application (supplied)

This repository contains the supplied **program**: `preview.py` reads a deployment configuration file and
prints a preview. Change this repository only when a request concerns program behaviour or how values are
interpreted. The notice text is NOT stored here: it lives in the separate `configuration` repository.
"""

CONFIG_README = """# configuration (training deployment values)

This repository owns `service.ini`, the values selected for this training deployment.
Change it when a request concerns the notice or another explicitly approved configuration value.
`environment` must stay `training`; valid `replicas` are 1 to 3; the request decides which value is intended.
"""

PREVIEW_PY = '''"""Supplied preview program: prints what the configured service would display (no instances are created)."""
import configparser
import sys

config = configparser.ConfigParser()
config.read(sys.argv[1], encoding="utf-8")
section = config["deployment"]
print("Preview notice: " + section["notice"])
print("Planned replicas: " + section["replicas"] + " (planned count only; nothing is started)")
print("Environment: " + section["environment"])
'''


# --------------------------------------------------------------------------- helpers
def env():
    e = dict(os.environ)
    e.update(GIT_CONFIG_NOSYSTEM="1", GIT_CONFIG_GLOBAL=os.devnull, GIT_TERMINAL_PROMPT="0", GIT_PAGER="cat")
    return e


def git(args, cwd=None, check=True, quiet=False):
    r = subprocess.run(["git", *args], cwd=cwd, env=env(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    out = r.stdout.decode("utf-8", "replace")
    if not quiet:
        print(f"$ git {' '.join(args)}" + (f"   (in {Path(cwd).name})" if cwd else ""))
        if out.strip():
            print("  " + out.strip().replace("\n", "\n  "))
        print(f"  exit {r.returncode}")
    if check and r.returncode != 0:
        raise SystemExit(f"git {' '.join(args)} failed: {r.stderr.decode('utf-8', 'replace').strip()}")
    return out


def now():
    return dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def write(path, text):
    Path(path).write_text(text, encoding="utf-8", newline="\n")


def load(ws, name):
    p = Path(ws) / name
    return json.loads(p.read_text(encoding="utf-8")) if p.is_file() else None


def save(ws, name, data):
    write(Path(ws) / name, json.dumps(data, indent=2) + "\n")


def origin(ws, repo):
    return str(Path(ws) / "origins" / f"{repo}.git")


def ref(ws, repo, name):
    out = subprocess.run(["git", "--git-dir", origin(ws, repo), "rev-parse", "--verify", "--quiet", name],
                         env=env(), stdout=subprocess.PIPE).stdout.decode().strip()
    return out or None


def show_file(ws, repo, commit, path):
    r = subprocess.run(["git", "--git-dir", origin(ws, repo), "show", f"{commit}:{path}"], env=env(),
                       stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return r.stdout.decode("utf-8").replace("\r\n", "\n") if r.returncode == 0 else None


def diff(ws, base, head):
    return subprocess.run(["git", "--git-dir", origin(ws, "configuration"), "diff", base, head], env=env(),
                          stdout=subprocess.PIPE).stdout.decode("utf-8").replace("\r\n", "\n")


def changed_files(ws, base, head):
    out = subprocess.run(["git", "--git-dir", origin(ws, "configuration"), "diff", "--name-only", base, head],
                         env=env(), stdout=subprocess.PIPE).stdout.decode()
    return [line for line in out.splitlines() if line]


def changed_head_lines(diff_text, path):
    """Head-side line numbers added/changed in `path` according to a unified diff."""
    lines, current, new_no = set(), None, 0
    for line in diff_text.splitlines():
        if line.startswith("+++ "):
            current = line[6:] if line.startswith("+++ b/") else None
        elif line.startswith("@@") and current == path:
            new_no = int(line.split("+")[1].split(",")[0].split(" ")[0])
        elif current == path and new_no:
            if line.startswith("+"):
                lines.add(new_no); new_no += 1
            elif line.startswith("-"):
                pass
            else:
                new_no += 1
    return sorted(lines)


def parse_ini(text):
    """Validate service.ini text. Returns (fields, errors)."""
    errors, fields = [], {}
    parser = configparser.ConfigParser()
    try:
        parser.read_string(text)
    except configparser.Error as exc:
        return {}, [f"syntax error: {exc}".splitlines()[0]]
    if "deployment" not in parser:
        return {}, ["missing [deployment] section"]
    sec = parser["deployment"]
    for key in ("notice", "replicas", "environment"):
        if key not in sec:
            errors.append(f"missing field {key}")
        else:
            fields[key] = sec[key].strip()
    extra = [k for k in sec if k not in ("notice", "replicas", "environment")]
    if extra:
        errors.append("unknown field(s): " + ", ".join(extra))
    if "notice" in fields and not fields["notice"]:
        errors.append("notice must not be empty")
    if "replicas" in fields and fields["replicas"] not in ("1", "2", "3"):
        errors.append("replicas must be an integer from 1 to 3")
    if "environment" in fields and fields["environment"] != "training":
        errors.append("environment must stay training")
    return fields, errors


def need_workspace(ws):
    info = load(ws, "workspace.json")
    if not info:
        raise SystemExit(f"FAIL: {ws} is not a training workspace (no workspace.json). Check --workspace.")
    return info


def need_proposal(ws):
    prop = load(ws, "proposal.json")
    if not prop:
        print("FAIL: No training proposal in this workspace. Publish your branch and run `open` first.")
        raise SystemExit(1)
    return prop


# --------------------------------------------------------------------------- commands
def cmd_init(a):
    dest = Path(a.dest).resolve()
    print(BANNER)
    if dest.exists():
        print(f"REFUSED: {dest} already exists. Choose a different unused destination; earlier work is kept.")
        return 1
    dest.mkdir(parents=True)
    (dest / "origins").mkdir()
    seeds = {"application": {"README.md": APP_README, "preview.py": PREVIEW_PY},
             "configuration": {"README.md": CONFIG_README, "service.ini": BASE_INI}}
    record = {"scenario": a.scenario, "created": now(), "author": AUTHOR, "mains": {}}
    for repo, files in seeds.items():
        git(["init", "--quiet", "--bare", "--initial-branch=main", origin(dest, repo)])
        with tempfile.TemporaryDirectory() as tmp:
            git(["init", "--quiet", "--initial-branch=main", tmp], quiet=True)
            for name, text in files.items():
                write(Path(tmp) / name, text)
            git(["add", "."], cwd=tmp, quiet=True)
            git(["-c", "user.name=W1.03 fixture", "-c", "user.email=fixture@example.invalid", "-c",
                 "commit.gpgsign=false", "commit", "--quiet", "-m", f"Supplied {repo} starting point"], cwd=tmp, quiet=True)
            git(["push", "--quiet", origin(dest, repo), "main"], cwd=tmp, quiet=True)
        clone = dest / repo
        git(["clone", "--quiet", "--no-hardlinks", origin(dest, repo), str(clone)])
        for key, value in (("user.name", AUTHOR), ("user.email", "learner@example.invalid"),
                           ("commit.gpgsign", "false"), ("core.autocrlf", "false"),
                           ("core.hooksPath", (clone / ".git" / "no-hooks").as_posix())):
            git(["config", "--local", key, value], cwd=clone, quiet=True)
        (clone / ".git" / "no-hooks").mkdir(exist_ok=True)
        record["mains"][repo] = ref(dest, repo, "refs/heads/main")
        print(f"{repo}: origin {origin(dest, repo)}; clone {clone}; main {record['mains'][repo]}")
    save(dest, "workspace.json", record)
    print(f"initialised scenario '{a.scenario}' in {dest}. Next: run baseline.")
    return 0


def cmd_baseline(a):
    ws = Path(a.workspace).resolve()
    info = need_workspace(ws)
    print(BANNER)
    ok = True
    for repo in ("application", "configuration"):
        clone = ws / repo
        head = git(["rev-parse", "HEAD"], cwd=clone, quiet=True).strip()
        branch = git(["branch", "--show-current"], cwd=clone, quiet=True).strip()
        dirty = git(["status", "--porcelain"], cwd=clone, quiet=True).strip()
        good = head == info["mains"][repo] == ref(ws, repo, "refs/heads/main") and branch == "main" and not dirty
        print(("PASS " if good else "FAIL ") + f"{repo}: on main at the supplied start, clean")
        ok &= good
    fields, errors = parse_ini(show_file(ws, "configuration", "main", "service.ini") or "")
    print(("PASS " if not errors else "FAIL ") + f"configuration/service.ini parses: {fields}")
    ok &= not errors
    if (ws / "proposal.json").exists():
        print("FAIL a proposal already exists (smoke/baseline applies only to an untouched workspace)")
        ok = False
    print("RESULT: " + ("PASS (baseline)" if ok else "FAIL"))
    return 0 if ok else 1


def published_head(ws, branch):
    cfg = ref(ws, "configuration", f"refs/heads/{branch}")
    app = ref(ws, "application", f"refs/heads/{branch}")
    if app and not cfg:
        print("REJECTED: this branch exists only in the application repository. "
              "The notice request belongs in configuration (configuration/service.ini).")
        raise SystemExit(1)
    if not cfg:
        print(f"REJECTED: branch {branch} is not published to the local configuration origin. "
              "Commit, then `git push -u origin {branch}` first.".replace("{branch}", branch))
        raise SystemExit(1)
    return cfg


def snapshot(ws, branch, description):
    info = need_workspace(ws)
    head = published_head(ws, branch)
    base = info["mains"]["configuration"]
    if head == base:
        print("REJECTED: the branch head equals main; there is no proposed change to review.")
        raise SystemExit(1)
    text = Path(description).read_text(encoding="utf-8")
    return {"base": base, "head": head, "diff": diff(ws, base, head), "files": changed_files(ws, base, head),
            "description": text, "time": now()}


def cmd_open(a):
    ws = Path(a.workspace).resolve()
    print(BANNER)
    if load(ws, "proposal.json"):
        print("REFUSED: a proposal is already open in this workspace; use `update` to record a new head.")
        return 1
    snap = snapshot(ws, a.branch, a.description)
    prop = {"repository": "configuration", "base_branch": "main", "head_branch": a.branch, "author": AUTHOR,
            "base": snap["base"], "head": snap["head"], "snapshots": [dict(snap, event="open")],
            "checks": [], "reviews": []}
    save(ws, "proposal.json", prop)
    print(f"opened proposal: change {a.branch} -> main in configuration")
    print(f"base {snap['base']}\nhead {snap['head']}\nchanged files: {', '.join(snap['files'])}")
    return 0


def cmd_update(a):
    ws = Path(a.workspace).resolve()
    print(BANNER)
    prop = need_proposal(ws)
    snap = snapshot(ws, a.branch, a.description)
    previous = prop["head"]
    prop["snapshots"].append(dict(snap, event="update", previous_head=previous))
    prop["head"] = snap["head"]
    save(ws, "proposal.json", prop)
    print(f"updated proposal; head {previous} -> {snap['head']}" if previous != snap["head"]
          else f"updated description; head unchanged {snap['head']}")
    if previous != snap["head"]:
        print("NOTE: earlier checks and reviews now describe a historical head. Run check for the new head.")
    return 0


def cmd_check(a):
    ws = Path(a.workspace).resolve()
    print(BANNER)
    prop = need_proposal(ws)
    head = prop["head"]
    text = show_file(ws, "configuration", head, "service.ini")
    fields, errors = parse_ini(text or "")
    output = ""
    if not errors:
        with tempfile.TemporaryDirectory() as tmp:
            ini = Path(tmp) / "service.ini"; write(ini, text)
            prog = Path(tmp) / "preview.py"; write(prog, show_file(ws, "application", "main", "preview.py"))
            r = subprocess.run([sys.executable, str(prog), str(ini)], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            output = r.stdout.decode("utf-8", "replace").replace("\r\n", "\n")
            if r.returncode != 0:
                errors.append(f"preview exited {r.returncode}")
    status = "pass" if not errors else "fail"
    prop["checks"].append({"head": head, "status": status, "fields": fields, "errors": errors,
                           "output": output, "input": "service.ini at the committed head", "time": now()})
    save(ws, "proposal.json", prop)
    print(f"check of committed head {head}: {status.upper()}")
    print(output.rstrip() if output else "\n".join(errors))
    print("This check establishes readable fields and the preview output for this head only. "
          "It does not establish that the change was requested or that anything is deployed.")
    return 0 if status == "pass" else 1


def cmd_show(a):
    ws = Path(a.workspace).resolve()
    print(BANNER)
    prop = need_proposal(ws)
    print(f"repository: {prop['repository']}   proposal: {prop['head_branch']} -> {prop['base_branch']}")
    print(f"base: {prop['base']}\nhead: {prop['head']}   (main in origin: {ref(ws, 'configuration', 'refs/heads/main')})")
    last = prop["snapshots"][-1]
    print("\n--- description (current snapshot) ---\n" + last["description"].rstrip())
    print("\n--- diff base..head ---\n" + last["diff"].rstrip())
    print("\n--- snapshots ---")
    for s in prop["snapshots"]:
        print(f"{s['time']} {s['event']:6} head {s['head'][:12]}")
    print("--- checks ---")
    for c in prop["checks"]:
        tag = "current" if c["head"] == prop["head"] else "historical (different head)"
        print(f"{c['time']} {c['status'].upper():4} head {c['head']} [{tag}]")
    print("--- reviews ---")
    for r in prop["reviews"]:
        tag = "current" if r["head"] == prop["head"] else "historical"
        print(f"{r['time']} {r['decision']:15} by {r['reviewer']} on {r['path']}:{r['line']} head {r['head'][:12]} [{tag}]")
        print("    " + r["comment"].strip().replace("\n", "\n    "))
    return 0


def cmd_review(a):
    ws = Path(a.workspace).resolve()
    print(BANNER)
    prop = need_proposal(ws)
    if a.decision not in DECISIONS:
        print(f"REJECTED: decision must be one of {', '.join(DECISIONS)}"); return 1
    if a.reviewer == prop["author"]:
        print("REJECTED: the reviewer label must differ from the author label."); return 1
    try:
        line = int(a.line)
    except ValueError:
        print(f"REJECTED: --line must be an integer you inspected with cat -n (got {a.line!r})."); return 1
    allowed = changed_head_lines(prop["snapshots"][-1]["diff"], a.path)
    if line not in allowed:
        print(f"REJECTED: {a.path}:{line} is not a changed head-side line. Changed lines: {allowed or 'none'}"); return 1
    comment = Path(a.comment).read_text(encoding="utf-8")
    if "___" in comment or not comment.strip():
        print("REJECTED: the comment still contains blanks (___) or is empty. Write your observation."); return 1
    if a.decision == "approve":
        passing = [c for c in prop["checks"] if c["head"] == prop["head"] and c["status"] == "pass"]
        if not passing:
            print(f"REJECTED: approval needs a passing check for the current head {prop['head']}. "
                  "Earlier results describe a different input."); return 1
    prop["reviews"].append({"reviewer": a.reviewer, "decision": a.decision, "path": a.path, "line": line,
                            "head": prop["head"], "comment": comment, "time": now()})
    save(ws, "proposal.json", prop)
    print(f"recorded {a.decision} by {a.reviewer} on {a.path}:{line} for head {prop['head']}")
    if a.decision == "comment":
        print("A comment is feedback, not approval.")
    return 0


def cmd_verify(a):
    ws = Path(a.workspace).resolve()
    print(BANNER)
    info = need_workspace(ws)
    prop = need_proposal(ws)
    want = SCENARIOS[info["scenario"]]
    results = []

    def check(ok, label):
        results.append(ok); print(("PASS " if ok else "FAIL ") + label)

    for repo in ("application", "configuration"):
        check(ref(ws, repo, "refs/heads/main") == info["mains"][repo], f"{repo} main unchanged in its origin")
    app_branches = subprocess.run(["git", "--git-dir", origin(ws, "application"), "for-each-ref", "--format=%(refname)",
                                   "refs/heads"], env=env(), stdout=subprocess.PIPE).stdout.decode().split()
    check(app_branches == ["refs/heads/main"], "application source unchanged (no proposed application branch)")
    head = prop["head"]
    check(prop["repository"] == "configuration" and ref(ws, "configuration", f"refs/heads/{prop['head_branch']}") == head,
          "proposal comes from the published configuration branch and records its current head")
    fields, errors = parse_ini(show_file(ws, "configuration", head, "service.ini") or "")
    check(not errors and fields.get("environment") == "training", "configuration parses; environment stays training")
    check(fields.get("notice") == want["notice"] and fields.get("replicas") == want["replicas"],
          f"current diff implements the governing request ({want['request']}): notice and replicas as requested")
    check(changed_files(ws, prop["base"], head) == ["service.ini"], "no unauthorised change outside service.ini")
    reviews, checks = prop["reviews"], prop["checks"]
    rc = [r for r in reviews if r["decision"] == "request-changes" and r["head"] != head]
    check(bool(rc), "a peer's changed-line request-changes is retained for an earlier head")
    corrected = any(s["event"] == "update" and s.get("previous_head") != s["head"] for s in prop["snapshots"])
    check(corrected, "a subsequent committed correction was recorded with an updated proposal snapshot")
    fresh = [c for c in checks if c["head"] == head and c["status"] == "pass"]
    check(bool(fresh), "a fresh passing check names the final head")
    check(any(c["head"] != head for c in checks), "the earlier check remains identifiable as history")
    approvals = [r for r in reviews if r["decision"] == "approve" and r["head"] == head and r["reviewer"] != prop["author"]]
    check(bool(approvals) and bool(fresh) and approvals[-1]["time"] >= fresh[-1]["time"],
          "a peer approval refers to the final head after its passing check")
    ok = all(results)
    print("RESULT: " + ("PASS" if ok else "FAIL") + " (machine checks only; the rubric assesses your reasoning)")
    return 0 if ok else 1


def main(argv=None):
    p = argparse.ArgumentParser(description=BANNER)
    sub = p.add_subparsers(dest="command", required=True)
    s = sub.add_parser("init"); s.add_argument("--dest", required=True)
    s.add_argument("--scenario", required=True, choices=sorted(SCENARIOS))
    for name in ("baseline", "check", "show", "verify"):
        sub.add_parser(name).add_argument("--workspace", required=True)
    for name in ("open", "update"):
        s = sub.add_parser(name); s.add_argument("--workspace", required=True)
        s.add_argument("--branch", required=True); s.add_argument("--description", required=True)
    s = sub.add_parser("review")
    for opt in ("--workspace", "--reviewer", "--path", "--line", "--comment", "--decision"):
        s.add_argument(opt, required=True)
    a = p.parse_args(argv)
    return {"init": cmd_init, "baseline": cmd_baseline, "open": cmd_open, "update": cmd_update, "check": cmd_check,
            "show": cmd_show, "review": cmd_review, "verify": cmd_verify}[a.command](a)


if __name__ == "__main__":
    sys.exit(main())
