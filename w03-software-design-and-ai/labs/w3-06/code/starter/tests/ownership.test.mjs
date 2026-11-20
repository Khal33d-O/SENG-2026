// YOUR INTEGRATION CHECK (W3.06). Edit only this file. Keep exactly one unskipped integration test.
// Claim under review: two sessions that are alive at the same time keep their own state - opening or
// advancing one must not overwrite the other. Use the real opener, decoder, session and rule; control only
// the external save service with controlledResponses. Derive expected values independently (board facts,
// or a snapshot captured BEFORE the operation under examination). Do not inspect stage names, process
// arguments or source text.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openSession } from '../dist/session.js';
import { controlledResponses } from '../dist/responses.js';

test('ownership: overlapping live sessions keep their own state', async () => {
  void openSession; void controlledResponses;
  assert.fail('Missing check: open two live sessions, make accepted progress and observe each session while both exist.');
});
