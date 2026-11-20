// SUPPLIED public game-rule tests (twelve named checks over the shared fixtures
// F01-F11). Use them as the contract reference; do not edit. Your own normal and
// invalid tests belong in tests/learner.test.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { REFERENCE_BOARD, initialState, evaluateMove } from '../dist/rules.js';

const load = (name) =>
    JSON.parse(readFileSync(new URL(`../fixtures/${name}`, import.meta.url), 'utf8'));

// Run one shared fixture: evaluate its action and compare the whole result.
// The input state is snapshotted first so the check can confirm it was not mutated.
function checkFixture(id) {
    const fixture = load(`treasure/${id}.json`);
    const state = fixture.state ?? initialState();
    const before = structuredClone(state);
    const result = evaluateMove(state, fixture.action?.direction);
    assert.deepEqual(result, fixture.expected, `${id}: ${fixture.description}`);
    assert.deepEqual(state, before, `${id}: input state is not mutated`);
}

test('F01 start: initialState() matches the reference board and fixture', () => {
    assert.deepEqual(REFERENCE_BOARD, load('board-reference.json'));
    assert.deepEqual(initialState(), load('treasure/F01.json').expected.state);
});

test('F02 east from the start moves to (1,0) and costs one move', () => checkFixture('F02'));
test('F03 moving into the wall is rejected with WALL and an unchanged state', () => checkFixture('F03'));
test('F04 moving off the board is rejected with EDGE and an unchanged state', () => checkFixture('F04'));
test('F05 reaching the treasure scores ten and records it once', () => checkFixture('F05'));
test('F06 reaching the exit holding the treasure wins', () => checkFixture('F06'));
test('F07 a win on the final move counts before the zero-budget loss', () => checkFixture('F07'));
test('F08 spending the last move without winning loses', () => checkFixture('F08'));

test('F09 any action after a win or a loss is rejected with GAME_COMPLETE', () => {
    checkFixture('F09A');
    checkFixture('F09B');
});

test('F10A an unknown direction is rejected without field changes', () => checkFixture('F10A'));
test('F10B a missing direction is rejected without field changes', () => checkFixture('F10B'));
test('F11 reaching the exit without the treasure does not win', () => checkFixture('F11'));
