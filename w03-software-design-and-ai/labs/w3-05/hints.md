# W3.05 staged hints

**Hint 1.** Run `state` and copy, for each location, its HEAD hash and whether it says a branch name or
`(detached HEAD)`. Compare each HEAD with `@proposal` character by character — not with a folder name.

**Hint 2.** The review location fails the bound check for two separate reasons: its HEAD is the annotation
commit, and `loose-note.md` is untracked. A fresh location avoids both; reusing the location needs the
note preserved first (`save-note`) and its HEAD moved to `@proposal` (the `review/annotations` branch keeps
the annotation commit reachable).

**Hint 3.** One complete route: `git ... source worktree add --detach @fresh @proposal`, then
`check ... fresh @proposal`, then `preserve`. Your account must still explain why this fits your state and
what the teammate's shortcut would have done.
