// Arc 1 · Episode 6 — a home-made "secret method" cipher: a short recipe of
// simple steps, with no key. Its only secret is the recipe itself.
import { englishScore } from '../../assets/js/english.js';
import { encrypt as caesar } from '../caesar/caesar.js';

const reverse = (s) => [...s].reverse().join('');
const swapPairs = (s) => { const a = [...s]; for (let i = 0; i + 1 < a.length; i += 2) [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a.join(''); };
const atbash = (s) => s.replace(/[a-z]/gi, (c) => { const b = c <= 'Z' ? 65 : 97; return String.fromCharCode(b + 25 - (c.charCodeAt(0) - b)); });

/** Every step a home-made recipe can use. Each is undone by `undo`. */
export const STEPS = [
  { id: 'rev', label: 'write it backwards', apply: reverse, undo: reverse },
  { id: 'swap', label: 'swap neighbouring letters', apply: swapPairs, undo: swapPairs },
  { id: 'mirror', label: 'mirror the alphabet (A↔Z)', apply: atbash, undo: atbash },
  ...Array.from({ length: 25 }, (_, i) => ({ id: `shift${i + 1}`, label: `shift letters +${i + 1}`, apply: (s) => caesar(s, i + 1), undo: (s) => caesar(s, -(i + 1)) })),
];
export const byId = Object.fromEntries(STEPS.map((s) => [s.id, s]));

export const encrypt = (text, recipe) => recipe.reduce((t, id) => byId[id].apply(t), text);
export const decrypt = (text, recipe) => [...recipe].reverse().reduce((t, id) => byId[id].undo(t), text);

/**
 * Eve's attack on a secret method: try every recipe of up to `maxSteps` steps
 * and keep the decryption that reads most like English.
 */
export function searchRecipes(ciphertext, maxSteps = 3) {
  let best = { score: -Infinity, recipe: [], text: ciphertext };
  let tried = 0;
  const walk = (recipe, text) => {
    if (recipe.length) {
      tried++;
      const s = englishScore(text);
      if (s > best.score) best = { score: s, recipe: [...recipe].reverse(), text };
    }
    if (recipe.length === maxSteps) return;
    for (const st of STEPS) walk([...recipe, st.id], st.undo(text));
  };
  walk([], ciphertext);
  return { ...best, tried };
}
