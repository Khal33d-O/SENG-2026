# Review checklist

1. Repository and direction: is this the configuration repository, proposing `change/notice` into `main`?
2. Full diff: compare **every** changed line (`git diff main HEAD`, no path filter) with the governing request.
3. Check input and output: does the recorded check name the **current** head? What did its preview print?
4. Decision: comment, request-changes or approve, attached to a changed head-side line, with a reason.
   A comment is never counted as approval.
