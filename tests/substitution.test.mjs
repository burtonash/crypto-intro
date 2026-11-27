import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeKey, isKey, encrypt, decrypt, counts, frequencyGuess, solve, accuracy } from '../site/lessons/substitution/substitution.js';
import { DEFAULT_MESSAGE } from '../site/lessons/substitution/lesson-data.js';

test('keys are reproducible permutations', () => {
  assert.equal(makeKey(42), makeKey(42));
  assert.notEqual(makeKey(42), makeKey(43));
  assert.ok(isKey(makeKey(42)));
});

test('decrypt undoes encrypt and keeps case and punctuation', () => {
  const k = makeKey(5);
  const m = 'Meet me at noon, by the bridge!';
  assert.equal(decrypt(encrypt(m, k), k), m);
});

test('substitution preserves letter frequencies (just relabelled)', () => {
  const k = makeKey(9);
  const a = counts(DEFAULT_MESSAGE).sort((x, y) => y - x);
  const b = counts(encrypt(DEFAULT_MESSAGE, k)).sort((x, y) => y - x);
  assert.deepEqual(a, b);
});

for (const seed of [1, 7, 42, 1976, 2026]) {
  test(`frequency analysis + hill climbing recovers the default message (key seed ${seed})`, () => {
    const ct = encrypt(DEFAULT_MESSAGE, makeKey(seed));
    assert.ok(accuracy(DEFAULT_MESSAGE, ct, frequencyGuess(ct)) > 0.15, 'frequency guess alone gets some letters');
    assert.equal(accuracy(DEFAULT_MESSAGE, ct, solve(ct, { seed })), 1);
  });
}
