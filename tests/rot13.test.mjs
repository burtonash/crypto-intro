import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rot13 } from '../site/lessons/rot13/lesson-logic.js';

test('HELLO is URYYB', () => assert.equal(rot13('HELLO'), 'URYYB'));
test('ROT13 is its own inverse', () => {
  const msg = 'Why did the chicken cross the road? To get to the other side!';
  assert.equal(rot13(rot13(msg)), msg);
});
test('A–M swap with N–Z', () => assert.equal(rot13('ABCDEFGHIJKLMnopqrstuvwxyz'), 'NOPQRSTUVWXYZabcdefghijklm'));
