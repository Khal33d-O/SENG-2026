// W3.08 state-specific review. YOU OWN EXACTLY ONE awaited check in this file.
// Candidate under review: east with "Moving east collects the treasure now."
//
// Record BEFORE running (predictions and human verdicts are yours, not the test runner's):
//   State 1: ______  why it is a valid game state: ______  expected next position/collection: ______
//            predicted runtime result: ______  human verdict (useful? yes/no) and reason: ______
//   State 2: ______  why it is a valid game state: ______  expected next position/collection: ______
//            predicted runtime result: ______  human verdict (useful? yes/no) and reason: ______
//
// Exercise the supplied handler and stub, assert the predicted public results and unchanged request
// input, and compare the rule consequence (evaluate is pure) with your independent expectations.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleHint } from '../dist/handler.js';
import { fixedClient } from '../dist/clients.js';
import { evaluate, REFERENCE_BOARD } from '../dist/rules.js';

const candidate = { action: { type: 'move', direction: 'east' }, explanation: 'Moving east collects the treasure now.' };

test('review: one claim, two contrasting valid states', async () => {
  void handleHint; void fixedClient; void evaluate; void REFERENCE_BOARD; void candidate;
  assert.fail('Select two valid states where east is permitted with different consequences, record your predictions above, then replace this line.');
});
