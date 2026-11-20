# W2.06 worked examples

Both worked examples are **complete pages inside the lab starter** and need its development server
(they call `/api/boards/reference` and `/api/demo/message` on the same origin):

```bash
cd ../../labs/w2-06/starter
npm ci
npm start      # http://127.0.0.1:4176/ -> "HTTP response inspection" and "Asynchronous message request"
```

| File | Worked example |
|---|---|
| [`demos/inspect.html`](demos/inspect.html) (copy) | **Worked Example 1: inspect the response and its JSON text** — awaits `fetch`, then `response.text()`; shows status, content type and body without treating it as an object |
| [`demos/message.html`](demos/message.html) (copy) | **Worked Example 2: request and check a service message** — `readMessage` checks HTTP status, awaits the parsed value, checks the object and its `message` property |
| [`response.json`](response.json) | Captured body of a normal `GET /api/boards/reference` (the supplied .NET API serves the shared reference fixture, which also carries `name` and the treasure's `value`; the book's contract excerpt omits those extra fields, which the shape guard ignores) |
| [`demo-observations.md`](demo-observations.md) | Captured observations for a blocked live demonstration |
