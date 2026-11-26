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

// English letter frequencies (%), A–Z.
const FREQ = [8.2, 1.5, 2.8, 4.3, 12.7, 2.2, 2.0, 6.1, 7.0, 0.15, 0.77, 4.0, 2.4,
  6.7, 7.5, 1.9, 0.095, 6.0, 6.3, 9.1, 2.8, 0.98, 2.4, 0.15, 2.0, 0.074];

// Short, common words. A hit on one of these outweighs letter statistics,
// which are unreliable on messages as short as HELLO.
const WORDS = new Set(`a i an as at be by do go he if in is it me my no of on or so to up us we
the and for are but not you all any can had her was one our out day get has him his how
man new now old see two way who boy did its let put say she too use hello attack dawn
meet noon secret key send help yes from this that with have they will your what when
there their about would could make like time just know take into year some them than
then only come over also back after first well even want because these give most`.split(/\s+/));

/** Higher = more English-looking. */
export function englishScore(text) {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  if (!letters.length) return -Infinity;
  const counts = new Array(26).fill(0);
  for (const c of letters) counts[c.charCodeAt(0) - 65]++;
  let chi = 0;
  for (let i = 0; i < 26; i++) {
    const expected = (FREQ[i] / 100) * letters.length;
    chi += (counts[i] - expected) ** 2 / expected;
  }
  const words = text.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  const hits = words.filter((w) => WORDS.has(w)).length;
  // Normalise chi-squared by length so long and short messages compare fairly.
  return hits * 1000 - chi / letters.length;
}

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
