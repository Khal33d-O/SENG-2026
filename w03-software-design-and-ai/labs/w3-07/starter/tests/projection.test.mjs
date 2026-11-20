// Two nested-field checks: display-only properties exist at runtime inside nested objects even though
// the declared TypeScript types omit them. The client must receive exactly the documented fields.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { requestHint } from '../dist/request-hint.js';
import { handleHint } from '../dist/handler.js';
import { fixedClient } from '../dist/clients.js';

const changed = JSON.parse(readFileSync(new URL('../fixtures/changed-input.json', import.meta.url), 'utf8'));
const EAST = { action: { type: 'move', direction: 'east' }, explanation: 'Explore the open eastern square.' };
const DOCUMENTED = {
  context: { boardId: 'reference', position: { x: 0, y: 0 }, movesRemaining: 6 },
  allowedActions: [{ type: 'move', direction: 'east' }, { type: 'move', direction: 'south' }],
};

test('projection: direct call with labels inside position and actions sends only documented leaves', async () => {
  const client = fixedClient(EAST);
  const input = structuredClone(changed.direct);
  const before = structuredClone(input);
  const envelope = await requestHint(input, client);
  assert.deepEqual(client.calls, [DOCUMENTED], 'exact payload, no displayLabel or buttonLabel');
  assert.deepEqual(envelope, { hint: EAST, source: 'model', requestId: changed.direct.requestId });
  assert.deepEqual(input, before, 'caller input preserved');
});

test('projection: handler path with position.displayLabel sends only documented leaves', async () => {
  const client = fixedClient(EAST);
  const body = structuredClone(changed.handlerBody);
  const before = structuredClone(body);
  const envelope = await handleHint(body, { requestId: 'request-P2', client });
  assert.deepEqual(client.calls, [DOCUMENTED], 'exact payload, no displayLabel');
  assert.equal(envelope.requestId, 'request-P2');
  assert.deepEqual(body, before, 'posted body preserved');
});
