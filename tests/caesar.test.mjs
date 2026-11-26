import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encrypt, decrypt, bruteForce, normaliseShift } from '../site/lessons/caesar/caesar.js';

test('HELLO shifted by 3 is KHOOR', () => {
  assert.equal(encrypt('HELLO', 3), 'KHOOR');
});

test('wraps around the end of the alphabet', () => {
  assert.equal(encrypt('XYZ', 3), 'ABC');
  assert.equal(encrypt('abc', -3), 'xyz');
});

test('keeps case, spaces and punctuation', () => {
  assert.equal(encrypt('Attack at dawn!', 3), 'Dwwdfn dw gdzq!');
});

test('decrypt undoes encrypt for every key', () => {
  const msg = 'The quick brown fox, 1976.';
  for (let s = 0; s < 26; s++) assert.equal(decrypt(encrypt(msg, s), s), msg);
});

test('normaliseShift maps any integer to 0–25', () => {
  assert.equal(normaliseShift(29), 3);
  assert.equal(normaliseShift(-1), 25);
  assert.equal(normaliseShift('7'), 7);
  assert.equal(normaliseShift('junk'), 0);
});

test('brute force tries exactly 25 keys', () => {
  const c = bruteForce('KHOOR');
  assert.equal(c.length, 25);
  assert.deepEqual(c.map((x) => x.shift), Array.from({ length: 25 }, (_, i) => i + 1));
  assert.equal(c.filter((x) => x.best).length, 1);
});

for (const [msg, key] of [
  ['HELLO', 3], ['HELLO', 13], ['ATTACK AT DAWN', 7], ['MEET ME AT NOON', 19],
  ['Bright ideas, broken ciphers, and the occasional soldering burn', 11],
  ['SECRET', 1], ['PAY BOB TEN POUNDS', 25],
]) {
  test(`brute force finds "${msg}" under shift ${key}`, () => {
    const best = bruteForce(encrypt(msg, key)).find((x) => x.best);
    assert.equal(best.shift, key);
    assert.equal(best.text, msg);
  });
}
