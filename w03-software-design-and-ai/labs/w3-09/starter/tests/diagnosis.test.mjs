// W3.09 selected repeat. YOU OWN EXACTLY ONE awaited test in this file.
//
// Record BEFORE running (keep this comment block as your evidence):
//   Seed A (wait 15 ms): browser request ID ______  source ______  event outcome ______  latencyMs ______
//   Seed B (wait 180 ms): browser request ID ______  source ______  event outcome ______  latencyMs ______
//   Initial diagnosis (not from duration, newest row or shared fallback alone):
//   Selected repeat: scenario ______  wait ______ ms   held constant: ______
//   Independent prediction (public result + event relationship):
//   Competing explanation this result could contradict:
//
// Use the supplied handleHint, controlledClient and initialState. Capture the event through the emit
// callback, await the request before checking its event, and check the request input is unchanged.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleHint } from '../dist/handler.js';
import { controlledClient } from '../dist/scenarios.js';
import { initialState } from '../dist/rules.js';

test('diagnosis: selected controlled repeat', async () => {
  void handleHint; void controlledClient; void initialState;
  assert.fail('Choose one controlled repeat, record your prediction above, then replace this line with your awaited check.');
});
