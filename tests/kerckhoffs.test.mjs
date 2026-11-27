import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encrypt, decrypt, searchRecipes, STEPS } from '../site/lessons/kerckhoffs/recipes.js';

const MSG = 'The shipment arrives on Tuesday at the north dock. Tell nobody.';

test('every step is undone by its inverse', () => {
  for (const s of STEPS) assert.equal(s.undo(s.apply(MSG)), MSG, s.id);
});
test('decrypt undoes a three-step recipe', () => {
  const r = ['rev', 'shift7', 'swap'];
  assert.equal(decrypt(encrypt(MSG, r), r), MSG);
});
for (const r of [['shift7'], ['rev', 'shift7', 'swap'], ['mirror', 'swap'], ['swap', 'shift19', 'rev']]) {
  test(`Eve recovers the message from recipe ${r.join(' → ')}`, () => {
    const found = searchRecipes(encrypt(MSG, r));
    assert.equal(found.text, MSG);
    assert.ok(found.tried > 20000);
  });
}
