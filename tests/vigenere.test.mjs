import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encrypt, decrypt, guessLength, crack, autocorrelation } from '../site/lessons/vigenere/vigenere.js';
import { DEFAULT_MESSAGE, DEFAULT_KEY } from '../site/lessons/vigenere/lesson-data.js';

test('classic example: ATTACKATDAWN with LEMON', () => assert.equal(encrypt('ATTACKATDAWN', 'LEMON'), 'LXFOPVEFRNHR'));
test('spaces do not consume key letters; case is kept', () => assert.equal(encrypt('Attack at dawn', 'lemon'), 'Lxfopv ef rnhr'));
test('decrypt undoes encrypt', () => assert.equal(decrypt(encrypt(DEFAULT_MESSAGE, 'KEY'), 'KEY'), DEFAULT_MESSAGE));

test('autocorrelation peaks at multiples of the key length', () => {
  const ac = autocorrelation(encrypt(DEFAULT_MESSAGE, DEFAULT_KEY), 15);
  const rate = (s) => ac[s - 1].rate;
  const off = ac.filter((a) => a.shift % 5).map((a) => a.rate);
  for (const s of [5, 10, 15]) assert.ok(rate(s) > Math.max(...off), `shift ${s}`);
});

for (const key of ['LEMON', 'KEY', 'CIPHER', 'MAYNARD', 'RADIO']) {
  test(`cracks the default message under ${key}`, () => {
    const ct = encrypt(DEFAULT_MESSAGE, key);
    assert.equal(guessLength(ct), key.length);
    const r = crack(ct);
    assert.equal(r.key, key);
    assert.equal(r.plaintext, DEFAULT_MESSAGE);
  });
}
