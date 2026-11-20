# W3.05 command guide

All commands run from your working copy of `assets/`. Each `git` call prints the actual command and its
location and appends it to `<run>/evidence/commands.log` (run directories live in `~/academy-w305-runs/`).

| Purpose | Command |
|---|---|
| Show locations, HEAD, branch/detached, short status, worktree list | `python3 review.py state "$W305_STATE"` |
| Worktree listing | `python3 review.py git "$W305_STATE" source worktree list` |
| Short status of a location | `python3 review.py git "$W305_STATE" <location> status --short` |
| Working tracked files vs index | `python3 review.py git "$W305_STATE" source diff` |
| Index (staged) vs HEAD | `python3 review.py git "$W305_STATE" source diff --cached` |
| Complete committed file list | `python3 review.py git "$W305_STATE" source diff --name-only @base @proposal` |
| Detailed committed comparison | `python3 review.py git "$W305_STATE" source diff @base @proposal` |
| A branch's committed file list | `python3 review.py git "$W305_STATE" source diff --name-only @base review/annotations` |
| Store a location's HEAD as a token | `python3 review.py record "$W305_STATE" proposal source` |
| **Detached route:** new location at a revision | `python3 review.py git "$W305_STATE" source worktree add --detach @fresh <@rev>` |
| **Named-branch route:** new location on a new branch | `python3 review.py git "$W305_STATE" source worktree add -b review/proposal @fresh <@rev>` |
| Move an existing review HEAD (detached) | `python3 review.py git "$W305_STATE" review switch --detach <@rev>` |
| Verified move of the loose review note | `python3 review.py save-note "$W305_STATE"` |
| Bound check (location, HEAD = revision, clean, compile, wall/state regression) | `python3 review.py check "$W305_STATE" <location> <@rev>` |
| Preservation check | `python3 review.py preserve "$W305_STATE"` |

Tokens: `@base`, `@proposal` (revisions); `@review`, `@fresh` (directories). After `worktree add ... @fresh`,
the new location is called `fresh`. Choosing the start point and applying a form to your state is your
decision. Do not use `reset`, `clean`, `--force` or `worktree remove --force`.
