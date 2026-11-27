// Arc 1 · Episode 4 — Substitution cipher: patterns survive encryption.
import { h } from '../../assets/js/dom.js';
import { tiles, cast, attackMeter, framed, keyArrow, flow, specRows, freqBars } from '../../assets/js/components.js';
import { ALPHABET, makeKey, encrypt, decrypt, counts, frequencyGuess, solve, accuracy, ENGLISH_ORDER } from './substitution.js';
import { DEFAULT_MESSAGE } from './lesson-data.js';

export const meta = {
  slug: 'substitution',
  arc: 1,
  episode: 4,
  title: 'Substitution cipher',
  promise: 'Shuffle the whole alphabet and keep the shuffle secret: 4 × 10²⁶ possible keys.',
  builds: ['alphabet permutations', 'huge keyspaces'],
  breaks: ['frequency analysis', 'hill climbing'],
  attack_cost: 'tiny',
  patch: ['hide letter frequencies', 'use more than one alphabet'],
  unlocks: ['polyalphabetic ciphers', 'statistical attacks'],
  stage_scenes: ['promise', 'build', 'demo', 'break', 'patch', 'next'],
  beats: [
    { id: 'promise', heading: 'Shuffle the alphabet', body: [
      'Instead of sliding the alphabet along, scramble it: A might become Q, B might become W, and so on, with every letter getting its own replacement. The scrambled alphabet is the key.',
      'There are 26 × 25 × 24 × … × 1 ways to shuffle 26 letters. That is 26!, about 4 × 10²⁶ keys. Trying them all, a billion a second, would take more than ten billion years.',
    ] },
    { id: 'build', heading: 'Every letter gets a disguise', body: [
      'Edit the message, or shuffle a new key. Each plaintext letter always turns into the same ciphertext letter, wherever it appears.',
    ] },
    { id: 'trust', heading: 'Why it looks good', body: [
      'Brute force, the attack that destroyed Caesar, is hopeless here. For centuries this was serious diplomatic and military cryptography, and plenty of people believed it could not be broken.',
    ] },
    { id: 'break', heading: 'Count the letters', body: [
      'Every E in the message becomes the same ciphertext letter, so the commonest ciphertext letter is probably E, the next probably T, then A, O, I, N. Al-Kindi described this in the ninth century. That first guess gets some letters right and many wrong.',
      'Then Eve improves it: swap two letters of her guessed key, keep the swap if the result looks more like English, and repeat. A few thousand swaps later she has the whole key. She never searched the keyspace at all.',
      'This needs enough text. On a sentence or two there is too little to count, and Eve struggles. That is not security, just a shortage of evidence: the next message with the same key gives her more.',
    ] },
    { id: 'patch', heading: 'Hide the pattern, not just the letters', body: [
      'A big keyspace stops brute force, and that\'s all it does. The weakness here is structural: one plaintext letter always gives one ciphertext letter, so the statistics of English shine straight through. The fix has to break that one-to-one link.',
    ] },
    { id: 'reality', heading: 'What real systems do', body: [
      'Modern ciphers are designed so the ciphertext looks statistically like random noise: every output byte is equally likely, whatever the input. Frequency analysis has nothing to count.',
      'The keyspace lesson still holds, though. A large keyspace is necessary, but it is never sufficient on its own.',
    ] },
    { id: 'next', heading: 'Use more than one alphabet', body: [
      'What if each letter could be disguised in several different ways, depending on where it falls in the message? That is the Vigenère cipher, and it held out for three hundred years.',
    ] },
  ],
};

export const defaults = { text: DEFAULT_MESSAGE, key: '1976' };
export const paramsFrom = (s) => ({ text: s.text ?? DEFAULT_MESSAGE, seed: Number.parseInt(s.key, 10) || 1976 });
// Keep URLs short: only include the message if it was edited.
export const paramsTo = (v) => ({ ...(v.text !== DEFAULT_MESSAGE ? { text: v.text } : { text: null }), key: String(v.seed) });

const stageSeed = (c) => Number.parseInt(c.key, 10) || 1976;
const stageKey = (c) => makeKey(stageSeed(c));
const stageMsg = (c) => (c.text && c.text.replace(/[^a-z]/gi, '').length >= 200 ? c.text : DEFAULT_MESSAGE);
const cipher = (c) => encrypt(stageMsg(c), stageKey(c));
const words = (s, n) => s.toUpperCase().replace(/[^A-Z ]/g, '').split(/\s+/).filter(Boolean).slice(0, n).join(' ');
const WINDOW = { vertical: 7, square: 7, wide: 10 };

function topLetters(text, n) {
  const c = counts(text);
  return [...ALPHABET].map((l, i) => ({ l, v: c[i] })).sort((a, b) => b.v - a.v || a.l.localeCompare(b.l)).slice(0, n);
}

export const scenes = {
  promise: {
    surface: 'cover-red',
    duration: 3500,
    say: 'Four times ten to the twenty-six possible keys. Far too many to try. So is it safe?',
    title: () => ['4 × 10', h('sup', {}, '26'), ' keys.'],
    visual: (c) => framed(words(cipher(c), 3), { small: true }),
    line: () => 'Far too many to try. So is it safe?',
  },
  build: {
    surface: 'paper',
    duration: 5000,
    say: 'Shuffle the whole alphabet. A becomes one letter, B another, and so on. The shuffle is the key.',
    title: () => 'Shuffle the whole alphabet.',
    visual: (c) => {
      const n = WINDOW[c.ratio];
      const k = stageKey(c);
      return h('div', { class: 'sub-map' },
        tiles(ALPHABET.slice(0, n), 'plain', { label: `plain ${ALPHABET.slice(0, n)}` }),
        keyArrow('↓ the key'),
        tiles(k.slice(0, n), 'secret', { stagger: true, label: `become ${k.slice(0, n)}` }));
    },
    line: (c) => `A becomes ${stageKey(c)[0]}. B becomes ${stageKey(c)[1]}. The shuffle is the key.`,
  },
  demo: {
    surface: 'paper',
    duration: 5000,
    say: 'Alice writes a long letter and swaps every letter using the key. Bob has the same key, so he swaps them back.',
    title: () => 'Alice sends a letter.',
    visual: (c) => flow([cast('alice'), h('span', { class: 'sub-snip mono' }, words(stageMsg(c), 3))],
      keyArrow('↓ shuffled alphabet'),
      [h('span', { class: 'sub-snip coded mono' }, words(cipher(c), 3)), cast('bob')]),
    line: () => 'Bob has the same shuffle and swaps every letter back.',
  },
  break: {
    surface: 'ink',
    duration: 7000,
    say: 'Eve can\'t try every key. She doesn\'t need to. Every E became the same letter, so she counts. The commonest letter is probably E. Then T, then A. Then she keeps swapping letters until it reads like English.',
    eyebrow: (c) => cast('eve', `eve sees ${cipher(c).replace(/[^a-z]/gi, '').length} letters`),
    title: () => 'Count the letters.',
    visual: (c) => freqBars(topLetters(cipher(c), c.ratio === 'vertical' ? 8 : 6).map((t, i) => ({ label: t.l, value: t.v, note: `→ ${ENGLISH_ORDER[i]}`, hl: i === 0 })), { label: 'commonest ciphertext letters' }),
    line: () => 'The commonest one is probably E.',
  },
  patch: {
    surface: 'paper',
    duration: 5500,
    say: 'Patterns survive encryption. The huge keyspace stopped brute force, and nothing else. One letter always became one letter, and that pattern gave the whole key away.',
    title: () => 'Patterns survive encryption.',
    visual: () => specRows([
      ['try every key', 'hopeless'],
      ['count letters', 'a rough first guess'],
      ['swap and score', 'the whole key, in under a second', { hl: true }],
    ]),
    line: () => 'A big keyspace stopped one attack. Not this one.',
  },
  next: {
    surface: 'cover-ink',
    duration: 4000,
    say: 'So what if every letter had several disguises, and the disguise kept changing? Next, the Vigenère cipher.',
    title: () => 'What if the disguise kept changing?',
    visual: () => framed('KEYKEYKEY', { small: true }),
    line: () => 'Next: the Vigenère cipher.',
  },
};

export const widgets = {
  build(store) {
    const area = h('textarea', { id: 'sub-text', rows: 5, spellcheck: 'false', onInput: (e) => store.set({ text: e.target.value }) });
    const keyRow = h('div', { class: 'strip' });
    const out = h('div', { class: 'term', 'aria-live': 'polite' });
    const shuffle = h('button', { type: 'button', class: 'btn', onClick: () => store.set({ seed: (store.get().seed % 99991) + 1 }) }, 'Shuffle a new key');
    store.subscribe(({ text, seed }) => {
      if (area.value !== text) area.value = text;
      const k = makeKey(seed);
      keyRow.replaceChildren(
        h('div', { class: 'strip-row' }, h('span', { class: 'label' }, 'plain'), tiles(ALPHABET, 'plain', { label: 'plain alphabet' })),
        h('div', { class: 'strip-key' }, `↓ key #${seed}, kept secret`),
        h('div', { class: 'strip-row' }, h('span', { class: 'label' }, 'cipher'), tiles(k, 'secret', { label: `cipher alphabet ${k}` })));
      out.replaceChildren(h('div', { class: 'cmt' }, '# ciphertext'), h('div', { class: 'out' }, encrypt(text, k) || ' '));
    });
    return h('div', { class: 'demo' },
      h('div', { class: 'field', style: { 'margin-bottom': '12px' } }, h('label', { for: 'sub-text' }, 'message'), area),
      h('div', { class: 'demo-row' }, shuffle),
      keyRow, out);
  },

  break(store) {
    const panel = h('div', { class: 'attacker on-ink', hidden: true, 'aria-live': 'polite' });
    const button = h('button', { type: 'button', class: 'btn break-it', onClick: () => { panel.hidden = false; button.textContent = 'Break it again'; render(store.get()); } }, 'Break it');
    let job = 0;

    function render({ text, seed }) {
      if (panel.hidden) return;
      const run = ++job;
      const ct = encrypt(text, makeKey(seed));
      const n = ct.replace(/[^a-z]/gi, '').length;
      const guess = frequencyGuess(ct);
      const step2 = h('div', {}, h('p', { class: 'step-label mono' }, 'step 2 · swap letters, keep swaps that read more like English'), h('p', { class: 'muted' }, 'working…'));
      panel.replaceChildren(
        h('div', { class: 'attacker-head' }, cast('eve'), h('span', { class: 'sees' }, `eve sees ${n} letters of ciphertext and has no key`)),
        h('div', { class: 'two-col' },
          h('div', {}, h('p', { class: 'step-label mono' }, 'ciphertext letters, commonest first'),
            freqBars(topLetters(ct, 8).map((t, i) => ({ label: t.l, value: t.v, note: `→ ${ENGLISH_ORDER[i]}` })))),
          h('div', {}, h('p', { class: 'step-label mono' }, 'step 1 · pair them with E T A O I N S H…'),
            h('p', { class: 'guess mono' }, decrypt(ct, guess).slice(0, 220), '…'),
            h('p', { class: 'muted' }, `${Math.round(accuracy(text, ct, guess) * 100)}% of letters right. Readable in places, wrong in most.`))),
        step2);
      // Let the panel paint before the (sub-second) search.
      setTimeout(() => {
        if (run !== job) return;
        const t0 = performance.now();
        const key = solve(ct, { seed });
        const ms = Math.round(performance.now() - t0);
        const acc = accuracy(text, ct, key);
        step2.replaceChildren(
          h('p', { class: 'step-label mono' }, 'step 2 · swap letters, keep swaps that read more like English'),
          h('p', { class: 'guess mono solved' }, decrypt(ct, key)),
          h('p', { class: 'verdict' }, acc === 1 ? ['Every letter recovered, in ', h('span', { class: 'hl' }, `${ms} ms`), '. The keyspace was never searched.']
            : n < 200 ? `${Math.round(acc * 100)}% recovered. Only ${n} letters is too little to count reliably. That is a shortage of evidence, not security: the next message with this key helps Eve.`
              : `${Math.round(acc * 100)}% recovered. Most of the message is readable, and the rest falls with a little hand-editing.`),
          attackMeter('tiny', '4 × 10²⁶ keys, none of them tried · letter statistics do the work'));
      }, 30);
    }
    store.subscribe(render);
    return h('div', {}, button, panel);
  },
};
