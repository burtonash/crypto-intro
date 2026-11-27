// Trigram statistics learned from corpus.js, and a scorer for "how English is
// this run of letters". Used by attacks that search a huge keyspace by hill
// climbing rather than brute force (substitution, Vigenère).
import { CORPUS } from './corpus.js';

const lettersOnly = (s) => s.toUpperCase().replace(/[^A-Z]/g, '');
const idx = (c) => c.charCodeAt(0) - 65;

function learn() {
  const t = lettersOnly(CORPUS);
  const tri = new Float64Array(26 * 26 * 26);
  for (let i = 0; i + 2 < t.length; i++) tri[idx(t[i]) * 676 + idx(t[i + 1]) * 26 + idx(t[i + 2])]++;
  const total = t.length - 2;
  // Log probabilities with a floor for trigrams the corpus never saw.
  const floor = Math.log10(0.01 / total);
  const logp = new Float64Array(tri.length);
  for (let i = 0; i < tri.length; i++) logp[i] = tri[i] ? Math.log10(tri[i] / total) : floor;
  return logp;
}

const LOGP = learn();

/** Sum of trigram log-probabilities over the letters of `text`. Higher = more English. */
export function trigramScore(text) {
  const t = lettersOnly(text);
  let s = 0;
  for (let i = 0; i + 2 < t.length; i++) s += LOGP[idx(t[i]) * 676 + idx(t[i + 1]) * 26 + idx(t[i + 2])];
  return s;
}

/** Same, over an array of 0–25 letter codes (fast path for inner loops). */
export function trigramScoreCodes(codes) {
  let s = 0;
  for (let i = 0; i + 2 < codes.length; i++) s += LOGP[codes[i] * 676 + codes[i + 1] * 26 + codes[i + 2]];
  return s;
}

/** Small seeded PRNG (mulberry32) so attacks and keys are reproducible from a URL. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
