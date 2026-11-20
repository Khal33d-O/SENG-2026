"""W3.05 review helper. Run from a working copy of the assets folder (Windows: python, not python3).

  W305_STATE=$(python3 review.py prepare demo|challenge)     new disposable repository; prints state file
  python3 review.py state  "$W305_STATE"                      locations, HEAD, branch/detached, status
  python3 review.py git    "$W305_STATE" <location> <git args...>
  python3 review.py record "$W305_STATE" <token> <location>   store a location's HEAD as @<token>
  python3 review.py check  "$W305_STATE" <location> <@rev>    bound check: location, HEAD, clean, compile, test
  python3 review.py preserve "$W305_STATE"                    compare unrelated work with the checkpoint
  python3 review.py save-note "$W305_STATE"                   verified move of the loose review note

<location> is a location name from `state` (source, review, ...). Tokens in git arguments are supplied
substitutions: @base and @proposal are revisions; @review and @fresh are directory paths. The helper prints
each actual Git command and its location, and appends it to the outer evidence directory's commands.log.
It only ever touches the repository it created; it never runs reset, clean or forced removal.
Repositories are created under ~/academy-w305-runs/<mode><n> (override with the W305_RUNS variable).
"""
import hashlib, json, os, shutil, subprocess, sys, tempfile, time
if hasattr(sys.stdout, "reconfigure"):  # Windows consoles: print test-runner symbols safely
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ASSETS = os.path.dirname(os.path.abspath(__file__))
FIXTURE = os.path.join(ASSETS, "fixture")
# Disposable repositories live OUTSIDE the course folder, in a short path (Windows path-length limits).
RUNS = os.environ.get("W305_RUNS") or os.path.join(os.path.expanduser("~"), "academy-w305-runs")
BRANCH = "feature/familiar-fix"


def sha_bytes(data):
    return hashlib.sha256(data).hexdigest()


def sha_file(path):
    with open(path, "rb") as f:
        return sha_bytes(f.read())


def run_git(cwd, *args, check=True, quiet=False):
    r = subprocess.run(["git", "-C", cwd, *args], capture_output=True)
    if check and r.returncode:
        sys.exit(f"git {' '.join(args)} failed in {cwd}:\n{r.stderr.decode(errors='replace')}")
    return r


def out(cwd, *args):
    return run_git(cwd, *args).stdout.decode().strip()


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)


def fixture(name):
    with open(os.path.join(FIXTURE, name), encoding="utf-8") as f:
        return f.read()


def commit(cwd, message, *paths):
    run_git(cwd, "add", "--", *paths)
    run_git(cwd, "commit", "-q", "-m", message)
    return out(cwd, "rev-parse", "HEAD")


def load(state_path):
    if not os.path.exists(state_path):
        sys.exit(f"state file not found: {state_path} (use the path printed by prepare)")
    with open(state_path, encoding="utf-8") as f:
        return json.load(f)


def save(state):
    with open(state["stateFile"], "w", encoding="utf-8", newline="\n") as f:
        json.dump(state, f, indent=2)


def log(state, text):
    with open(os.path.join(state["evidence"], "commands.log"), "a", encoding="utf-8", newline="\n") as f:
        f.write(f"{time.strftime('%Y-%m-%dT%H:%M:%S')} {text}\n")


def checkpoint(state):
    """Bytes of the unrelated work that the review must preserve."""
    src = state["locations"]["source"]
    cp = {"sourceWorking": {}, "stagedNote": None, "reviewBranch": None, "looseNote": None}
    for name in ("draft-notes.md", "scratch.txt"):
        p = os.path.join(src, name)
        cp["sourceWorking"][name] = sha_file(p) if os.path.exists(p) else None
    staged = run_git(src, "show", ":draft-notes.md", check=False)
    cp["stagedNote"] = sha_bytes(staged.stdout) if staged.returncode == 0 else None
    if state["mode"] == "challenge":
        cp["reviewBranch"] = out(src, "rev-parse", "review/annotations")
        cp["looseNote"] = sha_file(os.path.join(state["locations"]["review"], "loose-note.md"))
    return cp


def cmd_prepare(mode):
    if mode not in ("demo", "challenge"):
        sys.exit("usage: python3 review.py prepare demo|challenge")
    n = 1  # short directory names keep Windows paths well under the length limit
    while os.path.exists(os.path.join(RUNS, f"{mode}{n}")):
        n += 1
    run_dir = os.path.join(RUNS, f"{mode}{n}")
    source = os.path.join(run_dir, "source")
    evidence = os.path.join(run_dir, "evidence")
    os.makedirs(source)
    os.makedirs(evidence)
    run_git(source, "-c", "core.longpaths=true", "init", "-q", "-b", "main")
    for key, value in (("core.longpaths", "true"), ("user.name", "Course Fixture"), ("user.email", "fixture@example.invalid"), ("commit.gpgsign", "false"), ("core.autocrlf", "false")):
        run_git(source, "config", key, value)
    for name in ("src/board.ts", "tests/wall.test.mjs", "tsconfig.json", "package.json", ".gitignore"):
        write(os.path.join(source, name), fixture(name))
    write(os.path.join(source, "src/rules.ts"), fixture("src/rules.ts"))
    write(os.path.join(source, "draft-notes.md"), fixture("draft-notes.md"))
    base = commit(source, "Baseline: familiar game rule (known blocked-move defect)", ".")
    state = {"mode": mode, "stateFile": os.path.join(run_dir, "state.json"), "runDir": run_dir, "evidence": evidence,
             "tokens": {"@base": base, "@proposal": None, "@review": os.path.join(run_dir, "review"),
                        "@fresh": os.path.join(run_dir, "fresh")},
             "locations": {"source": source}, "checks": [], "savedNotes": []}
    if mode == "challenge":
        run_git(source, "switch", "-q", "-c", BRANCH)
        write(os.path.join(source, "src/rules.ts"), fixture("src/rules.corrected.ts"))
        state["tokens"]["@proposal"] = commit(source, "Preserve state when a move is rejected", "src/rules.ts")
        review = state["tokens"]["@review"]
        run_git(source, "worktree", "add", "-q", "-b", "review/annotations", review, state["tokens"]["@proposal"])
        write(os.path.join(review, "review-notes.md"), fixture("notes/review-notes.md"))
        commit(review, "Save review annotation", "review-notes.md")
        write(os.path.join(review, "loose-note.md"), fixture("notes/loose-note.md"))
        state["locations"]["review"] = review
    # Unrelated work in the source location: staged note + further working edit (MM) + untracked scratch.
    if mode == "demo":
        write(os.path.join(source, "src/rules.ts"), fixture("src/rules.corrected.ts"))  # uncommitted correction
    write(os.path.join(source, "draft-notes.md"), fixture("notes/draft-notes.v2.md"))
    run_git(source, "add", "draft-notes.md")
    write(os.path.join(source, "draft-notes.md"), fixture("notes/draft-notes.v3.md"))
    write(os.path.join(source, "scratch.txt"), fixture("notes/scratch.txt"))
    state["checkpoint"] = checkpoint(state)
    save(state)
    log(state, f"prepared {mode}: base {base} proposal {state['tokens']['@proposal']}")
    print(state["stateFile"])


def location_of(state, name):
    if name not in state["locations"]:
        # a location created by worktree add is registered by its token name
        token = f"@{name}"
        path = state["tokens"].get(token)
        if path and os.path.isdir(path):
            state["locations"][name] = path
            save(state)
        else:
            sys.exit(f"unknown or missing location '{name}'; known: {', '.join(state['locations'])}")
    return state["locations"][name]


def substitute(state, arg):
    value = state["tokens"].get(arg, arg)
    if value is None:
        sys.exit(f"{arg} is not recorded yet (use: review.py record <state> {arg[1:]} <location>)")
    return value


def cmd_git(state_path, location, args):
    state = load(state_path)
    cwd = location_of(state, location)
    real = [substitute(state, a) for a in args]
    shown = "git " + " ".join(real)
    print(f"[{location}: {cwd}]\n$ {shown}", flush=True)
    r = subprocess.run(["git", "-C", cwd, *real])
    log(state, f"[{location}] {shown} -> exit {r.returncode}")
    for name, path in state["tokens"].items():  # register new worktrees by token name
        if name in ("@review", "@fresh") and path and os.path.isdir(path) and name[1:] not in state["locations"]:
            state["locations"][name[1:]] = path
    save(state)
    return r.returncode


def describe(cwd):
    head = out(cwd, "rev-parse", "HEAD")
    branch = run_git(cwd, "symbolic-ref", "-q", "--short", "HEAD", check=False).stdout.decode().strip()
    status = out(cwd, "status", "--short", "--untracked-files=all")
    return head, branch or "(detached HEAD)", status


def cmd_state(state_path):
    state = load(state_path)
    print(f"mode: {state['mode']}    evidence: {state['evidence']}")
    for token, value in state["tokens"].items():
        print(f"{token:10} {value}")
    for name, cwd in state["locations"].items():
        if not os.path.isdir(cwd):
            print(f"\n[{name}] {cwd} (missing)")
            continue
        head, branch, status = describe(cwd)
        print(f"\n[{name}] {cwd}\n  HEAD {head}  {branch}\n  status --short:\n" + ("\n".join("    " + l for l in status.splitlines()) or "    (clean)"))
    print("\n$ git worktree list\n" + out(state["locations"]["source"], "worktree", "list"))
    print("\nbranches: " + out(state["locations"]["source"], "branch", "--format=%(refname:short) %(objectname:short)").replace("\n", " | "))


def cmd_record(state_path, token, location):
    state = load(state_path)
    head = out(location_of(state, location), "rev-parse", "HEAD")
    state["tokens"][f"@{token}"] = head
    save(state)
    log(state, f"recorded @{token} = {head} from {location}")
    print(f"@{token} = {head}")


def find_tsc():
    local = os.path.join(ASSETS, "node_modules", "typescript", "bin", "tsc")
    if os.path.exists(local):
        return ["node", local]
    found = shutil.which("tsc")
    if not found:
        sys.exit("TypeScript 5.9.3 not found: run `npm ci` once in the assets folder")
    return [found]


def cmd_check(state_path, location, rev):
    state = load(state_path)
    cwd = location_of(state, location)
    expected = substitute(state, rev)
    head, branch, status = describe(cwd)
    record = {"id": f"check-{len(state['checks']) + 1}", "location": location, "directory": cwd, "requested": rev,
              "expectedRevision": expected, "head": head, "branch": branch, "status": status}
    refusal = None
    if head != expected:
        refusal = f"REFUSED: {location} HEAD {head[:12]} is not the requested {rev} {expected[:12]}"
    elif status:
        refusal = f"REFUSED: {location} is not clean (tracked or untracked changes):\n{status}"
    if refusal:
        record["result"] = refusal
        print(refusal)
        code = 3
    else:
        tmp = tempfile.mkdtemp(prefix=".check-", dir=ASSETS)
        try:
            files = out(cwd, "ls-files").splitlines()
            for rel in files:
                dst = os.path.join(tmp, rel)
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                shutil.copy(os.path.join(cwd, rel), dst)
            print(f"[{location}] HEAD {head} {branch}, clean; compiling {len(files)} tracked files", flush=True)
            build = subprocess.run(find_tsc() + ["-p", "tsconfig.json"], cwd=tmp)
            if build.returncode:
                record["result"] = "compile failed"
                code = build.returncode
            else:
                r = subprocess.run(["node", "--test", "tests/wall.test.mjs"], cwd=tmp, capture_output=True, text=True, encoding="utf-8", errors="replace")
                print(r.stdout)
                code = r.returncode
                record["result"] = "pass" if code == 0 else "fail: wall/state regression"
                record["output"] = r.stdout[-2000:]
        finally:
            shutil.rmtree(tmp, ignore_errors=True)
    state["checks"].append(record)
    save(state)
    with open(os.path.join(state["evidence"], f"{record['id']}.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(record, f, indent=2)
    log(state, f"check {location} {rev} -> {record['result'].splitlines()[0]}")
    print(f"recorded {record['id']} in {state['evidence']}")
    return code


def cmd_save_note(state_path):
    state = load(state_path)
    if state["mode"] != "challenge":
        sys.exit("save-note applies to the challenge's loose review note")
    src = os.path.join(state["locations"]["review"], "loose-note.md")
    if not os.path.exists(src):
        sys.exit(f"no loose note at {src}; nothing moved")
    dst = os.path.join(state["evidence"], "saved-notes", "loose-note.md")
    if os.path.exists(dst):
        sys.exit(f"{dst} already exists; refusing to overwrite")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)
    if sha_file(src) != sha_file(dst):
        sys.exit("verification failed; original note left in place")
    os.remove(src)
    state["savedNotes"].append({"from": src, "to": dst, "sha256": sha_file(dst)})
    save(state)
    log(state, f"save-note {src} -> {dst}")
    print(f"verified copy saved to {dst}; removed only {src}")


def cmd_preserve(state_path):
    state = load(state_path)
    now = checkpoint_now(state)
    before = state["checkpoint"]
    rows = []
    for name, value in before["sourceWorking"].items():
        rows.append((f"source working {name}", value, now["sourceWorking"].get(name)))
    rows.append(("source staged draft-notes.md (exact bytes)", before["stagedNote"], now["stagedNote"]))
    if state["mode"] == "challenge":
        rows.append(("review/annotations tip (saved annotation)", before["reviewBranch"], now["reviewBranch"]))
        rows.append(("loose review note (in place or verified save)", before["looseNote"], now["looseNote"]))
    ok = True
    for label, a, b in rows:
        same = a == b
        ok &= same
        print(f"{'SAME' if same else 'DIFF'}  {label}: before {str(a)[:12]}  now {str(b)[:12]}")
    result = "PASS unrelated work preserved" if ok else "FAIL unrelated work changed"
    print(result)
    with open(os.path.join(state["evidence"], "preservation.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump({"result": result, "rows": rows}, f, indent=2)
    log(state, f"preserve -> {result}")
    return 0 if ok else 1


def checkpoint_now(state):
    src = state["locations"]["source"]
    cp = {"sourceWorking": {}, "stagedNote": None, "reviewBranch": None, "looseNote": None}
    for name in state["checkpoint"]["sourceWorking"]:
        p = os.path.join(src, name)
        cp["sourceWorking"][name] = sha_file(p) if os.path.exists(p) else None
    staged = run_git(src, "show", ":draft-notes.md", check=False)
    cp["stagedNote"] = sha_bytes(staged.stdout) if staged.returncode == 0 else None
    if state["mode"] == "challenge":
        tip = run_git(src, "rev-parse", "review/annotations", check=False)
        tip = tip.stdout.decode().strip() if tip.returncode == 0 else None
        has_note = tip and run_git(src, "cat-file", "-e", f"{tip}:review-notes.md", check=False).returncode == 0
        cp["reviewBranch"] = tip if has_note else None
        loose = os.path.join(state["locations"]["review"], "loose-note.md")
        if os.path.exists(loose):
            cp["looseNote"] = sha_file(loose)
        else:
            saved = [s for s in state["savedNotes"] if os.path.exists(s["to"])]
            cp["looseNote"] = sha_file(saved[-1]["to"]) if saved else None
    return cp


def main(argv):
    if len(argv) < 2:
        sys.exit(__doc__)
    c = argv[1]
    if c == "prepare" and len(argv) == 3:
        return cmd_prepare(argv[2])
    if c == "state" and len(argv) == 3:
        return cmd_state(argv[2])
    if c == "git" and len(argv) >= 5:
        return cmd_git(argv[2], argv[3], argv[4:])
    if c == "record" and len(argv) == 5:
        return cmd_record(argv[2], argv[3], argv[4])
    if c == "check" and len(argv) == 5:
        return cmd_check(argv[2], argv[3], argv[4])
    if c == "preserve" and len(argv) == 3:
        return cmd_preserve(argv[2])
    if c == "save-note" and len(argv) == 3:
        return cmd_save_note(argv[2])
    sys.exit(__doc__)


if __name__ == "__main__":
    sys.exit(main(sys.argv) or 0)
