// Two ordinary function examples for requestHint (clean nested inputs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requestHint } from '../dist/request-hint.js';
import { fixedClient } from '../dist/clients.js';

const EAST = { action: { type: 'move', direction: 'east' }, explanation: 'Explore the open eastern square.' };

test('function: initial context reaches the client and the envelope returns its hint', async () => {
  const client = fixedClient(EAST);
  const input = {
    requestId: 'request-F1',
    game: { boardId: 'reference', position: { x: 0, y: 0 }, movesRemaining: 6 },
    allowedActions: [{ type: 'move', direction: 'east' }, { type: 'move', direction: 'south' }],
  };
  const before = structuredClone(input);
  const envelope = await requestHint(input, client);
  assert.deepEqual(client.calls, [{
    context: { boardId: 'reference', position: { x: 0, y: 0 }, movesRemaining: 6 },
    allowedActions: [{ type: 'move', direction: 'east' }, { type: 'move', direction: 'south' }],
  }], 'exactly one call with the documented payload');
  assert.deepEqual(envelope, { hint: EAST, source: 'model', requestId: 'request-F1' });
  assert.deepEqual(input, before, 'caller input preserved');
});

test('function: a second context keeps its own request id and actual client hint', async () => {
  const answer = { action: { type: 'move', direction: 'north' }, explanation: 'North leads towards the treasure row.' };
  const client = fixedClient(answer);
  const input = {
    requestId: 'request-F2',
    game: { boardId: 'reference', position: { x: 2, y: 1 }, movesRemaining: 3 },
    allowedActions: [{ type: 'move', direction: 'north' }, { type: 'move', direction: 'south' }],
  };
  const envelope = await requestHint(input, client);
  assert.equal(client.calls.length, 1);
  assert.deepEqual(client.calls[0].context, { boardId: 'reference', position: { x: 2, y: 1 }, movesRemaining: 3 });
  assert.deepEqual(envelope, { hint: answer, source: 'model', requestId: 'request-F2' });
  assert.ok(!('then' in envelope.hint), 'the envelope holds the resolved hint, not a promise');
});
