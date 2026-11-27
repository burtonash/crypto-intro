import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chars, utf8, hex, spoof, nonAscii, naiveBlocked, mojibake, uplus } from '../site/lessons/text-as-numbers/textnum.js';

test('ASCII letters are one byte each', () => {
  assert.deepEqual(utf8('HELLO'), [72, 69, 76, 76, 79]);
  assert.equal(hex(utf8('Hi')), '48 69');
});
test('UTF-8 uses more bytes beyond ASCII', () => {
  assert.equal(hex(utf8('é')), 'C3 A9');
  assert.equal(hex(utf8('€')), 'E2 82 AC');
  assert.equal(uplus(chars('€')[0].cp), 'U+20AC');
});
test('a spoofed name looks the same but has different bytes', () => {
  const fake = spoof('paypal');
  assert.notEqual(fake, 'paypal');
  assert.equal(fake.length, 6);
  assert.notDeepEqual(utf8(fake), utf8('paypal'));
  assert.equal(nonAscii(fake).length, 1);
});
test('the naive blocklist lets the spoof through', () => {
  assert.equal(naiveBlocked('PayPal', ['paypal']), true);
  assert.equal(naiveBlocked(spoof('paypal'), ['paypal']), false);
});
test('UTF-8 read as Windows-1252 garbles accents', () => {
  assert.equal(mojibake('café'), 'cafÃ©');
});
