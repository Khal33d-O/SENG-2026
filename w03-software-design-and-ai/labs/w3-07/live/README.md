# Prepared live demonstration (facilitator-side; not required for completion)

The book's live demonstration swaps the server-side model client while the browser route, handler and
adapter contract stay the same. **This course repository deliberately contains no live client, provider
configuration, account or credential**, and no learner makes a provider call in this lab.

If the delivery environment has prepared a live route (book: a temporary authenticated local tool server,
or a separately configured HTTPS endpoint with a server-held token), the facilitator:

1. Starts it outside this repository; the credential stays in the server process environment, never in
   `browser/`, the model payload or the public envelope.
2. Implements the `ModelClient` shape from `starter/src/contracts.ts` on the server side and translates the
   external reply to the documented `Hint` shape; the handler's guard and fallback still apply.
3. Makes one prepared request and records: date, execution type ("live, facilitator-run"), the public
   envelope, the redacted server observation and the matching browser request identifier.

If no live route is prepared or the service is unavailable, record "live observation not performed"
rather than describing a stub replay as a fresh model response. A recorded live call establishes only that
the prepared path responded in that run; it does not replace the controlled checks or guarantee future
availability, latency or useful advice. A longer live deadline does not change the deterministic
two-second reference timeout used by `make timeout`.
