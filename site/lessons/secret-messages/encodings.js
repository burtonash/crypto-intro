// Arc 1 · Episode 1 — encodings. Each is a public recipe with no key, which is
// the whole point: anyone who knows the recipe can undo it.
import { englishScore } from '../../assets/js/english.js';

const enc = new TextEncoder();
const dec = new TextDecoder('utf-8', { fatal: true });
const bytesOf = (s) => [...enc.encode(s)];
const textOf = (bytes) => { try { return dec.decode(new Uint8Array(bytes)); } catch { return null; } };

const MORSE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--',
  N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', "'": '.----.',
};
const FROM_MORSE = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

export const ENCODINGS = [
  {
    id: 'reverse', label: 'reverse', blurb: 'Write it backwards.',
    encode: (s) => [...s].reverse().join(''),
    decode: (s) => [...s].reverse().join(''),
  },
  {
    id: 'hex', label: 'hex', blurb: 'Each byte as two hexadecimal digits.',
    encode: (s) => bytesOf(s).map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' '),
    decode: (s) => {
      const t = s.replace(/\s+/g, '');
      if (!t || t.length % 2 || /[^0-9a-f]/i.test(t)) return null;
      return textOf(t.match(/../g).map((x) => parseInt(x, 16)));
    },
  },
  {
    id: 'binary', label: 'binary', blurb: 'Each byte as eight bits.',
    encode: (s) => bytesOf(s).map((b) => b.toString(2).padStart(8, '0')).join(' '),
    decode: (s) => {
      const t = s.replace(/\s+/g, '');
      if (!t || t.length % 8 || /[^01]/.test(t)) return null;
      return textOf(t.match(/.{8}/g).map((x) => parseInt(x, 2)));
    },
  },
  {
    id: 'base64', label: 'base64', blurb: 'Bytes regrouped into 64 printable characters.',
    encode: (s) => btoa(String.fromCharCode(...bytesOf(s))),
    decode: (s) => {
      const t = s.replace(/\s+/g, '');
      if (!t || t.length % 4 === 1 || /[^A-Za-z0-9+/=]/.test(t)) return null;
      try { return textOf([...atob(t)].map((c) => c.charCodeAt(0))); } catch { return null; }
    },
  },
  {
    id: 'morse', label: 'morse', blurb: 'Dots and dashes; slash between words.',
    encode: (s) => s.toUpperCase().split(/\s+/).filter(Boolean)
      .map((w) => [...w].map((c) => MORSE[c]).filter(Boolean).join(' ')).join(' / '),
    decode: (s) => {
      if (!/^[.\-\s/]+$/.test(s) || !/[.-]/.test(s)) return null;
      const words = s.trim().split(/\s*\/\s*/).map((w) => w.split(/\s+/).map((c) => FROM_MORSE[c]));
      return words.some((w) => w.includes(undefined)) ? null : words.map((w) => w.join('')).join(' ');
    },
  },
];

export const byId = Object.fromEntries(ENCODINGS.map((e) => [e.id, e]));

/**
 * Eve's attack: run every known decoder. Returns one row per encoding with the
 * decoded text (or null if it doesn't parse) and the most English one flagged.
 */
export function decodeAll(text) {
  const rows = ENCODINGS.map((e) => {
    const out = e.decode(text);
    return { id: e.id, label: e.label, text: out, score: out == null ? -Infinity : englishScore(out) };
  });
  const best = rows.reduce((a, b) => (b.score > a.score ? b : a));
  return rows.map((r) => ({ ...r, best: r === best && r.score > -Infinity }));
}
