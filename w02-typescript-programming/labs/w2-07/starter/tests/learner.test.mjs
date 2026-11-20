// OWNED FILE: your three named claims. Keep the test names exactly as they are.
// Each callback needs its own setup, ONE invocation of the rule under test, and
// explicit, contract-derived assertions. Replace each assert.fail(...) line.
import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, evaluateMove } from '../dist/rules.js';
import { costly } from '../dist/costly.js';
import { ids, snapshot } from '../fixtures.mjs';

test('my normal action', () => {
    // Setup: a fresh initialState().
    // Action: one allowed direction through evaluateMove(state, direction).
    // Assertions: accepted, reason and the COMPLETE returned state (write the
    // expected object before you run it).
    assert.fail('unfinished: my normal action has no setup, action or assertion yet');
});

test('my invalid action', () => {
    // Setup: a fresh state plus an independent before snapshot (snapshot(state)).
    // Action: one unrecognised direction such as 'up'.
    // Assertions: rejection, the reason, every returned field, and the retained
    // input after the call.
    assert.fail('unfinished: my invalid action has no setup, action or assertion yet');
});

test('my boundary regression', () => {
    // Choose your own threshold and complete tile array (not a renamed copy of the
    // demonstration). Include an equality case and a higher cost. The expected IDs
    // must reject the original inclusive predicate (>=) AND the proposed fixed-two
    // predicate (tile.cost > 2), while passing with the caller-selected strict rule.
    assert.fail('unfinished: my boundary regression has no chosen input or expected IDs yet');
});
