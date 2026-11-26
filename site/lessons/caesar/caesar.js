// Caesar cipher — the toy primitive and its attack. Pure functions, no DOM,
// so the same code drives Explore, Stage and the tests.

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const mod = (n, m) => ((n % m) + m) % m;

/** Shift one letter, preserving case. Non-letters pass through untouched. */
export function shiftChar(ch, shift) {
  const code = ch.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCharCode(65 + mod(code - 65 + shift, 26));
  if (code >= 97 && code <= 122) return String.fromCharCode(97 + mod(code - 97 + shift, 26));
  return ch;
}

export const encrypt = (text, shift) => Array.from(text, (c) => shiftChar(c, shift)).join('');
export const decrypt = (text, shift) => encrypt(text, -shift);

/** Normalise a key to 0–25. */
export const normaliseShift = (n) => mod(Math.trunc(Number(n) || 0), 26);

// --- the attack --------------------------------------------------------------

import { englishScore } from '../../assets/js/english.js';
export { englishScore };

/**
 * Eve's attack: try every key. Returns 25 candidates (shifts 1–25) with the
 * most English-looking one flagged. Shift 0 is skipped: it isn't encryption.
 */
export function bruteForce(ciphertext) {
  const candidates = [];
  for (let s = 1; s < 26; s++) {
    const text = decrypt(ciphertext, s);
    candidates.push({ shift: s, text, score: englishScore(text) });
  }
  const best = candidates.reduce((a, b) => (b.score > a.score ? b : a));
  return candidates.map((c) => ({ ...c, best: c === best }));
}
