// Checks YOUR declared expectations in src/learner-checks.ts.
// Run with: npm run check:mine
// A passing comparison shows that your expected IDs match the function in
// src/neighbours.ts. It does NOT prove that your boundary example
// distinguishes the rival rule: explain that disagreement yourself.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { neighbours } from '../dist/neighbours.js';
import { inside } from '../dist/supplied.js';
import {
  board,
  origin,
  access,
  normalInput,
  normalExpected,
  boundaryInput,
  boundaryExpected
} from '../dist/learner-checks.js';
import { idsOf } from './support.mjs';

test('template completed: board is rectangular (width differs from height)', () => {
  assert.notEqual(board.width, board.height, 'replace the starting square board with a rectangular one');
});

test('template completed: origin is inside the board', () => {
  assert.ok(inside({ id: 'origin', x: origin.x, y: origin.y, cost: 0 }, board));
});

test('normal example: retains at least one tile', () => {
  assert.ok(normalExpected.length > 0, 'normalExpected must name at least one retained tile');
});

test('normal example: actual IDs match your expected IDs', () => {
  assert.deepEqual(idsOf(neighbours(normalInput, origin, board, access)), normalExpected);
});

test('boundary example: contains a disputed tile', () => {
  assert.ok(boundaryInput.length > 0, 'boundaryInput must contain at least one tile');
});

test('boundary example: actual IDs match your expected IDs', () => {
  assert.deepEqual(idsOf(neighbours(boundaryInput, origin, board, access)), boundaryExpected);
});
