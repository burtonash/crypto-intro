import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ENCODINGS, byId, decodeAll } from '../site/lessons/secret-messages/encodings.js';

test('known encodings of MEET AT NOON', () => {
  assert.equal(byId.base64.encode('MEET AT NOON'), 'TUVFVCBBVCBOT09O');
  assert.equal(byId.hex.encode('HI'), '48 49');
  assert.equal(byId.binary.encode('A'), '01000001');
  assert.equal(byId.reverse.encode('NOON AT'), 'TA NOON');
  assert.equal(byId.morse.encode('SOS hi'), '... --- ... / .... ..');
});

for (const e of ENCODINGS) {
  test(`${e.id} round-trips`, () => {
    const msg = e.id === 'morse' ? 'MEET AT NOON' : 'Meet at noon, café!';
    assert.equal(e.decode(e.encode(msg)), msg);
  });
}

test('decoders reject text that is not theirs', () => {
  assert.equal(byId.hex.decode('XYZ'), null);
  assert.equal(byId.binary.decode('0102'), null);
  assert.equal(byId.base64.decode('a'), null);
  assert.equal(byId.morse.decode('hello'), null);
});

for (const id of ['reverse', 'hex', 'binary', 'base64', 'morse']) {
  test(`Eve recognises ${id} without being told`, () => {
    const rows = decodeAll(byId[id].encode('MEET ME AT NOON'));
    const best = rows.find((r) => r.best);
    assert.equal(best.id, id);
    assert.equal(best.text.toUpperCase(), 'MEET ME AT NOON');
  });
}
