// Arc 1 · Episode 5 — Vigenère: a repeating keyword picks a different Caesar
// shift for each letter. Broken by finding the repeat (autocorrelation), then
// solving each column as an ordinary Caesar cipher.
import { FREQ } from '../../assets/js/english.js';

const A = 65;
const isLetter = (c) => /[a-z]/i.test(c);
export const cleanKey = (k) => String(k || '').toUpperCase().replace(/[^A-Z]/g, '');

function apply(text, key, dir) {
  const k = cleanKey(key);
  if (!k) return text;
  let j = 0;
  return Array.from(text, (ch) => {
    if (!isLetter(ch)) return ch; // spaces and punctuation don't use up key letters
    const base = ch === ch.toUpperCase() ? A : 97;
    const s = (k.charCodeAt(j++ % k.length) - A) * dir;
    return String.fromCharCode(base + ((((ch.charCodeAt(0) - base + s) % 26) + 26) % 26));
  }).join('');
}
export const encrypt = (text, key) => apply(text, key, 1);
export const decrypt = (text, key) => apply(text, key, -1);

const lettersOf = (s) => s.toUpperCase().replace(/[^A-Z]/g, '');

/**
 * Autocorrelation: slide the ciphertext against itself by `shift` letters and
 * count positions where the letters match. When the shift is a multiple of
 * the key length, both copies were encrypted with the same key letter, so
 * English's uneven letter frequencies make matches much more common.
 */
export function autocorrelation(ciphertext, maxShift = 15) {
  const t = lettersOf(ciphertext);
  const out = [];
  for (let s = 1; s <= maxShift; s++) {
    let hits = 0;
    for (let i = 0; i + s < t.length; i++) if (t[i] === t[i + s]) hits++;
    out.push({ shift: s, hits, rate: t.length > s ? hits / (t.length - s) : 0 });
  }
  return out;
}

/**
 * Index of coincidence: the chance that two letters picked from a text match.
 * English is uneven (~0.066); uniformly random letters give 1/26 (~0.038).
 */
export function ioc(letters) {
  const c = new Array(26).fill(0);
  for (const ch of letters) c[ch.charCodeAt(0) - A]++;
  const n = letters.length;
  return n > 1 ? c.reduce((s, x) => s + x * (x - 1), 0) / (n * (n - 1)) : 0;
}

/**
 * Key length guess (Friedman). For each candidate length L, split the text
 * into L columns; if L is right, each column is one Caesar shift of English,
 * so its coincidence rate looks like English. Multiples of L look right too,
 * so take the shortest length that comes close to the best.
 */
export function lengthScores(ciphertext, maxLen = 12) {
  const t = lettersOf(ciphertext);
  return Array.from({ length: maxLen }, (_, i) => {
    const L = i + 1;
    const cols = Array.from({ length: L }, (_, k) => [...t].filter((_, j) => j % L === k).join(''));
    return { length: L, score: cols.reduce((s, c) => s + ioc(c), 0) / L };
  });
}

export function guessLength(ciphertext, maxLen = 12) {
  const scores = lengthScores(ciphertext, maxLen);
  const best = Math.max(...scores.map((s) => s.score));
  return scores.find((s) => s.score >= Math.max(0.055, best * 0.88))?.length
    ?? scores.reduce((a, b) => (b.score > a.score ? b : a)).length;
}

/** Best Caesar shift for one column: the one whose decryption matches English letter frequencies (chi-squared). */
export function bestShift(column) {
  let best = { shift: 0, chi: Infinity };
  for (let s = 0; s < 26; s++) {
    const c = new Array(26).fill(0);
    for (const ch of column) c[(ch.charCodeAt(0) - A - s + 26) % 26]++;
    let chi = 0;
    for (let i = 0; i < 26; i++) { const e = (FREQ[i] / 100) * column.length; chi += (c[i] - e) ** 2 / e; }
    if (chi < best.chi) best = { shift: s, chi };
  }
  return best.shift;
}

/** The whole attack: length, then one Caesar per column. */
export function crack(ciphertext, length = guessLength(ciphertext)) {
  const t = lettersOf(ciphertext);
  const columns = Array.from({ length }, (_, i) => [...t].filter((_, j) => j % length === i).join(''));
  const shifts = columns.map(bestShift);
  const key = shifts.map((s) => String.fromCharCode(A + s)).join('');
  return { length, columns, key, plaintext: decrypt(ciphertext, key) };
}
