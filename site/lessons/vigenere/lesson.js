// Arc 1 · Episode 5 — Vigenère: reusing structure leaks structure.
import { h } from '../../assets/js/dom.js';
import { tiles, cast, attackMeter, framed, keyArrow, flow, specRows, freqBars } from '../../assets/js/components.js';
import { encrypt, decrypt, cleanKey, lengthScores, guessLength, crack } from './vigenere.js';
import { DEFAULT_MESSAGE, DEFAULT_KEY } from './lesson-data.js';

export const meta = {
  slug: 'vigenere',
  arc: 1,
  episode: 5,
  title: 'Vigenère cipher',
  promise: 'Use a keyword to pick a different shift for every letter, so the same letter gets many disguises.',
  builds: ['polyalphabetic shifts', 'repeating keywords'],
  breaks: ['repeated-key analysis', 'index of coincidence'],
  attack_cost: 'tiny',
  patch: ['a key as long as the message', 'never reuse key material'],
  unlocks: ['one-time pads', 'keystreams'],
  stage_scenes: ['promise', 'build', 'demo', 'break', 'solve', 'patch', 'next'],
  beats: [
    { id: 'promise', heading: 'Many alphabets, one keyword', body: [
      'Pick a keyword, say LEMON. Shift the first letter of your message by L, the second by E, the third by M, and so on, starting the keyword again when it runs out. Every letter is a Caesar cipher, but a different one each time.',
      'Now E doesn\'t always become the same letter, so simple frequency counting stops working. For three hundred years it had a reputation as le chiffre indéchiffrable: the indecipherable cipher.',
    ] },
    { id: 'build', heading: 'Shift by the keyword', body: [
      'Change the message or the keyword. The middle row shows which keyword letter shifts each message letter.',
    ] },
    { id: 'trust', heading: 'Why it looks good', body: [
      'The letter counts of the ciphertext come out flat-ish, because each common plaintext letter is spread across several ciphertext letters. The attack that destroyed the substitution cipher has nothing obvious to grab.',
    ] },
    { id: 'break', heading: 'Find the repeat, then it\'s just Caesar', body: [
      'The keyword repeats, and that is the leak. Eve guesses a key length L and splits the ciphertext into L columns: every Lth letter. If L is right, each column was encrypted with one single shift, so it still has the lumpy letter statistics of English. If L is wrong, the columns look random. She measures how often letters in a column match (the index of coincidence) and the right length stands out.',
      'Once she knows the length, each column is an ordinary Caesar cipher. She solves each one by matching its letter frequencies to English, and the keyword falls out one letter at a time. Charles Babbage and Friedrich Kasiski independently worked out the repeat in the nineteenth century.',
    ] },
    { id: 'patch', heading: 'Don\'t let the key repeat', body: [
      'The weakness is the repetition. If the key were as long as the message, random, and never used again, there would be no columns to line up. That idea is the one-time pad, and it is coming in Arc 2.',
    ] },
    { id: 'reality', heading: 'What real systems do', body: [
      'Modern stream ciphers do generate a key as long as the message, from a short secret key and a fresh nonce, precisely so that nothing repeats. Reusing that keystream is one of the classic real-world mistakes, and it breaks things in exactly the same way.',
    ] },
    { id: 'next', heading: 'What if the method were secret?', body: [
      'Every cipher so far was broken by someone who knew how it worked. So why not keep the method secret too? Auguste Kerckhoffs had a firm answer to that in 1883.',
    ] },
  ],
};

export const defaults = { text: DEFAULT_MESSAGE, key: DEFAULT_KEY };
export const paramsFrom = (s) => ({ text: s.text ?? DEFAULT_MESSAGE, key: cleanKey(s.key) || DEFAULT_KEY });
export const paramsTo = (v) => ({ text: v.text !== DEFAULT_MESSAGE ? v.text : null, key: v.key });

const stageKey = (c) => (cleanKey(c.key) || DEFAULT_KEY).slice(0, 10);
const stageMsg = (c) => (c.text && c.text.replace(/[^a-z]/gi, '').length >= 250 ? c.text : DEFAULT_MESSAGE);
const cipher = (c) => encrypt(stageMsg(c), stageKey(c));
const letters = (s, n) => s.toUpperCase().replace(/[^A-Z]/g, '').slice(0, n);
const words = (s, n) => s.toUpperCase().replace(/[^A-Z ]/g, '').split(/\s+/).filter(Boolean).slice(0, n).join(' ');
const WINDOW = { vertical: 7, square: 7, wide: 10 };
const repeatKey = (k, n) => Array.from({ length: n }, (_, i) => k[i % k.length]).join('');

export const scenes = {
  promise: {
    surface: 'cover-red',
    duration: 3500,
    say: 'For three hundred years, people called this one the indecipherable cipher.',
    title: () => 'The indecipherable cipher.',
    visual: (c) => framed(words(cipher(c), 2), { small: true }),
    line: () => 'Unbroken for three hundred years. Supposedly.',
  },
  build: {
    surface: 'paper',
    duration: 6000,
    say: 'Pick a keyword, like lemon. Shift the first letter by L, the next by E, then M, O, N, and round again. Every letter gets a different Caesar shift.',
    title: () => 'A different shift for every letter.',
    visual: (c) => {
      const n = WINDOW[c.ratio];
      const p = letters(stageMsg(c), n);
      return h('div', { class: 'vg-rows' },
        tiles(p, 'plain', { label: `message ${p}` }),
        tiles(repeatKey(stageKey(c), n), 'secret', { label: `keyword ${stageKey(c)} repeating` }),
        tiles(encrypt(p, stageKey(c)), 'public', { stagger: true, label: `ciphertext ${encrypt(p, stageKey(c))}` }));
    },
    line: (c) => `The keyword ${stageKey(c)} repeats all the way along.`,
  },
  demo: {
    surface: 'paper',
    duration: 5000,
    say: 'Alice and Bob share the keyword. Alice shifts each letter forward, Bob shifts each one back. Even the same letter comes out differently each time.',
    title: () => 'Same letter, different disguise.',
    visual: (c) => flow([cast('alice'), h('span', { class: 'vg-snip mono' }, words(stageMsg(c), 2))],
      keyArrow(`↓ keyword ${stageKey(c)}`),
      [h('span', { class: 'vg-snip coded mono' }, words(cipher(c), 2)), cast('bob')]),
    line: () => 'The two Ts in ATTACK come out as different letters.',
  },
  break: {
    surface: 'ink',
    duration: 7000,
    say: 'Eve doesn\'t know the keyword, but she knows it repeats. She tries splitting the message into columns, one length at a time. At the right length, each column looks like English again. Five stands out.',
    eyebrow: () => cast('eve', 'eve guesses the key length'),
    title: () => 'Find the repeat.',
    visual: (c) => {
      const scores = lengthScores(cipher(c), c.ratio === 'vertical' ? 8 : 6);
      const L = guessLength(cipher(c));
      return freqBars(scores.map((s) => ({ label: String(s.length), value: s.score, note: s.score.toFixed(3), hl: s.length === L })), { label: 'how English each column split looks, by key length', floor: 0.036 });
    },
    line: (c) => `Length ${guessLength(cipher(c))} looks like English. So the keyword is ${guessLength(cipher(c))} letters long.`,
  },
  solve: {
    surface: 'ink',
    duration: 6000,
    say: 'Now every column is just a Caesar cipher. Count the letters in each one, find its shift, and the keyword falls out, one letter at a time.',
    eyebrow: () => cast('eve', 'eve solves each column'),
    title: () => 'Then it\'s just Caesar.',
    visual: (c) => {
      const r = crack(cipher(c));
      return h('div', { class: 'vg-solve' },
        keyArrow(`${r.length} columns · ${r.length} Caesar ciphers`),
        tiles(r.key, 'secret', { stagger: true, label: `keyword ${r.key}` }),
        h('p', { class: 'vg-shifts mono' }, [...r.key].map((k) => k.charCodeAt(0) - 65).join(' · ')));
    },
    line: (c) => `The keyword was ${crack(cipher(c)).key}. The whole letter is readable.`,
  },
  patch: {
    surface: 'paper',
    duration: 5500,
    say: 'Reusing structure leaks structure. The keyword repeated, and the repeat gave away its length. After that, it was five Caesar ciphers, and Caesar falls in seconds.',
    title: () => 'Reusing structure leaks structure.',
    visual: () => specRows([
      ['repeating key', 'leaks its own length'],
      ['each column', 'a plain Caesar cipher'],
      ['the fix', 'a key that never repeats', { hl: true }],
    ]),
    line: () => 'The key repeated, and the repeat gave it away.',
  },
  next: {
    surface: 'cover-ink',
    duration: 4000,
    say: 'Every cipher so far was broken by someone who knew how it worked. So why not keep the method secret too? Next, Kerckhoffs\'s principle.',
    title: () => 'Why not keep the method secret?',
    visual: () => framed('???'),
    line: () => 'Next: Kerckhoffs\'s principle.',
  },
};

export const widgets = {
  build(store) {
    const area = h('textarea', { id: 'vg-text', rows: 4, spellcheck: 'false', onInput: (e) => store.set({ text: e.target.value }) });
    const key = h('input', { type: 'text', id: 'vg-key', spellcheck: 'false', autocomplete: 'off', maxlength: 20, onInput: (e) => { const k = cleanKey(e.target.value); if (k) store.set({ key: k }); } });
    const rows = h('div', { class: 'strip' });
    const out = h('div', { class: 'term', 'aria-live': 'polite' });
    store.subscribe(({ text, key: k }) => {
      if (area.value !== text) area.value = text;
      if (cleanKey(key.value) !== k) key.value = k;
      const p = letters(text, 24);
      rows.replaceChildren(
        h('div', { class: 'strip-row' }, h('span', { class: 'label' }, 'message'), tiles(p, 'plain')),
        h('div', { class: 'strip-row' }, h('span', { class: 'label' }, 'keyword'), tiles(repeatKey(k, p.length), 'secret')),
        h('div', { class: 'strip-row' }, h('span', { class: 'label' }, 'cipher'), tiles(encrypt(p, k), 'public')));
      out.replaceChildren(h('div', { class: 'cmt' }, `# ciphertext, keyword ${k}`), h('div', { class: 'out' }, encrypt(text, k) || ' '));
    });
    return h('div', { class: 'demo' },
      h('div', { class: 'field', style: { 'margin-bottom': '12px' } }, h('label', { for: 'vg-text' }, 'message'), area),
      h('div', { class: 'demo-row' }, h('div', { class: 'field' }, h('label', { for: 'vg-key' }, 'keyword (letters only)'), key)),
      rows, out);
  },

  break(store) {
    const panel = h('div', { class: 'attacker on-ink', hidden: true, 'aria-live': 'polite' });
    const button = h('button', { type: 'button', class: 'btn break-it', onClick: () => { panel.hidden = false; button.textContent = 'Break it again'; render(store.get()); } }, 'Break it');
    function render({ text, key }) {
      if (panel.hidden) return;
      const ct = encrypt(text, key);
      const n = ct.replace(/[^a-z]/gi, '').length;
      const scores = lengthScores(ct, 12);
      const r = crack(ct);
      const right = r.key === key || (r.key.length < key.length && repeatKey(r.key, key.length) === key);
      panel.replaceChildren(
        h('div', { class: 'attacker-head' }, cast('eve'), h('span', { class: 'sees' }, `eve sees ${n} letters and knows the keyword repeats`)),
        h('div', { class: 'two-col' },
          h('div', {}, h('p', { class: 'step-label mono' }, 'step 1 · split into L columns: how English do they look?'),
            freqBars(scores.map((s) => ({ label: String(s.length), value: s.score, note: s.score.toFixed(3), hl: s.length === r.length })), { floor: 0.036 }),
            h('p', { class: 'muted' }, 'Bars start at 0.036, just under random text (0.038).')),
          h('div', {}, h('p', { class: 'step-label mono' }, `step 2 · solve each of the ${r.length} columns as a Caesar cipher`),
            h('ol', { class: 'tries tries-wide' }, [...r.key].map((k, i) => h('li', { style: { '--i': i } }, h('span', { class: 'k' }, `col ${String(i + 1).padStart(2, ' ')}`), `shift ${k.charCodeAt(0) - 65} → ${k}`))),
            h('p', { class: 'verdict' }, 'Keyword: ', h('span', { class: 'hl' }, r.key)))),
        h('p', { class: 'step-label mono' }, 'decrypted'),
        h('p', { class: 'guess mono solved' }, r.plaintext),
        h('p', { class: 'muted' }, right ? 'Exactly right. 0.066 is what English looks like; random letters score about 0.038.'
          : n < 150 ? `Not quite: ${n} letters is too little for the columns to show their statistics. Longer messages, or more of them with the same keyword, give Eve what she needs.`
            : 'Close but not exact: some columns were too short to solve reliably. A few more lines of ciphertext would settle it.'),
        attackMeter('tiny', 'no key search · 12 length guesses, then 26 shifts per column'));
    }
    store.subscribe(render);
    return h('div', {}, button, panel);
  },
};
