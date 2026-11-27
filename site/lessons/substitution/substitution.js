// Arc 1 · Episode 4 — monoalphabetic substitution and frequency analysis.
import { trigramScoreCodes, rng } from '../../assets/js/ngrams.js';
import { FREQ } from '../../assets/js/english.js';

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** A key is a 26-letter permutation: key[i] is what plaintext letter i becomes. Seeded so URLs reproduce it. */
export function makeKey(seed) {
  const r = rng(seed);
  const k = [...ALPHABET];
  for (let i = k.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [k[i], k[j]] = [k[j], k[i]]; }
  return k.join('');
}

export const isKey = (k) => typeof k === 'string' && k.length === 26 && new Set(k.toUpperCase()).size === 26 && /^[A-Z]+$/i.test(k);

function mapWith(text, from, to) {
  const m = {};
  for (let i = 0; i < 26; i++) { m[from[i]] = to[i]; m[from[i].toLowerCase()] = to[i].toLowerCase(); }
  return Array.from(text, (c) => m[c] ?? c).join('');
}
export const encrypt = (text, key) => mapWith(text, ALPHABET, key.toUpperCase());
export const decrypt = (text, key) => mapWith(text, key.toUpperCase(), ALPHABET);

/** Letter counts A–Z. */
export function counts(text) {
  const c = new Array(26).fill(0);
  for (const ch of text.toUpperCase()) { const i = ch.charCodeAt(0) - 65; if (i >= 0 && i < 26) c[i]++; }
  return c;
}

const ENGLISH_ORDER = [...ALPHABET].map((l, i) => [l, FREQ[i]]).sort((a, b) => b[1] - a[1]).map(([l]) => l).join('');
export { ENGLISH_ORDER };

/**
 * Step 1 of the attack: pair the commonest ciphertext letter with E, the next
 * with T, and so on. Returns a decryption key guess (same shape as a key).
 */
export function frequencyGuess(ciphertext) {
  const c = counts(ciphertext);
  const cipherOrder = [...ALPHABET].map((l, i) => [l, c[i]]).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([l]) => l);
  const key = new Array(26);
  // key[plainIndex] = cipher letter
  cipherOrder.forEach((cl, rank) => { key[ENGLISH_ORDER.charCodeAt(rank) - 65] = cl; });
  return key.join('');
}

/**
 * Step 2: hill climb. Swap two letters of the key; keep the swap if the
 * decryption looks more like English (trigram statistics). Restart a few
 * times from shuffled starts and keep the best. Deterministic for a seed.
 */
export function solve(ciphertext, { seed = 1, restarts = 24, rounds = 3000, onProgress } = {}) {
  const codes = [...ciphertext.toUpperCase()].map((ch) => ch.charCodeAt(0) - 65).filter((i) => i >= 0 && i < 26);
  const r = rng(seed);
  const plainCodes = new Array(codes.length);
  // inverse[cipherIndex] = plainIndex
  const scoreInv = (inv) => { for (let i = 0; i < codes.length; i++) plainCodes[i] = inv[codes[i]]; return trigramScoreCodes(plainCodes); };
  const keyToInv = (key) => { const inv = new Array(26); for (let p = 0; p < 26; p++) inv[key.charCodeAt(p) - 65] = p; return inv; };
  const invToKey = (inv) => { const k = new Array(26); for (let c = 0; c < 26; c++) k[inv[c]] = ALPHABET[c]; return k.join(''); };

  let bestInv = keyToInv(frequencyGuess(ciphertext));
  let bestScore = scoreInv(bestInv);
  for (let restart = 0; restart < restarts; restart++) {
    let inv = bestInv.slice();
    if (restart > 0) for (let n = 0; n < 6; n++) { const a = Math.floor(r() * 26), b = Math.floor(r() * 26); [inv[a], inv[b]] = [inv[b], inv[a]]; }
    let score = scoreInv(inv);
    let stale = 0;
    while (stale < rounds) {
      const a = Math.floor(r() * 26); const b = Math.floor(r() * 26);
      if (a === b) continue;
      [inv[a], inv[b]] = [inv[b], inv[a]];
      const s = scoreInv(inv);
      if (s > score) { score = s; stale = 0; } else { [inv[a], inv[b]] = [inv[b], inv[a]]; stale++; }
    }
    if (score > bestScore) { bestScore = score; bestInv = inv; }
    onProgress?.(restart + 1, restarts, invToKey(bestInv));
  }
  return invToKey(bestInv);
}

/** Share of letters a guessed key decrypts correctly (for the demo's honesty line). */
export function accuracy(plaintext, ciphertext, guessKey) {
  const got = decrypt(ciphertext, guessKey).toUpperCase();
  const want = plaintext.toUpperCase();
  let n = 0, ok = 0;
  for (let i = 0; i < want.length; i++) if (/[A-Z]/.test(want[i])) { n++; if (got[i] === want[i]) ok++; }
  return n ? ok / n : 0;
}
