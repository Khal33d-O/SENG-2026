# Hint 3: start a path operation

```js
const accepted = runPath([/* your accepted path */]);
const withRejected = runPath([/* the same path with one justified rejected insertion */]);
assert.deepEqual(withRejected, accepted, 'complete public state agrees');
```

You still choose both paths and write the progress expectation from the specification.
