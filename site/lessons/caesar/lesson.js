// Arc 1 · Episode 2 — Caesar cipher.
// One source for both render targets: `meta` is the PRD §7.7 schema (plus the
// copy for each beat), `scenes` renders Stage frames, `widgets` plugs the
// interactive demo into the Explore page.
import { h } from '../../assets/js/dom.js';
import { tiles, cast, attackMeter } from '../../assets/js/components.js';
import { ALPHABET, encrypt, decrypt, bruteForce, normaliseShift } from './caesar.js';

export const meta = {
  slug: 'caesar',
  arc: 1,
  episode: 2,
  title: 'Caesar cipher',
  promise: 'Hide a message by shifting letters.',
  builds: ['alphabet shifting', 'modular wraparound'],
  breaks: ['brute force', 'known plaintext'],
  attack_cost: 'tiny',
  patch: ['larger keyspace', 'better key model'],
  unlocks: ['substitution ciphers', 'keyspaces'],
  stage_scenes: ['promise', 'build', 'demo', 'break', 'patch', 'next'],
  beats: [
    { id: 'promise', heading: 'Hide a message by shifting letters', body: [
      'Pick a number. Move every letter that many places along the alphabet. Anyone who knows the number can move them back.',
      'Suetonius records Julius Caesar using a shift of three for private letters. It is the oldest cipher with a name attached, and the easiest one to break.',
    ] },
    { id: 'build', heading: 'One number, twenty-six letters', body: [
      'Type a message and choose a shift. Each letter moves along the alphabet and wraps round from Z back to A. Spaces and punctuation pass through untouched, which is already a small leak: word lengths survive encryption.',
    ] },
    { id: 'trust', heading: 'Why it looks good', body: [
      'The output is unreadable at a glance: KHOOR does not look like HELLO. The key is a single number, easy to remember and easy to share.',
      'For a long time that was enough, because most people who intercepted a message could not read at all. The cipher was only ever as strong as its readers were weak.',
    ] },
    { id: 'break', heading: 'Try every key', body: [
      'Eve doesn\'t know the shift. She doesn\'t need to. There are only 25 useful keys, so she tries them all and keeps the one that reads as English. That is a brute-force attack, and here it finishes before you can blink.',
      'There is a second break. If Eve knows a single letter of plaintext, say every message starts with DEAR, she can read the key straight off the ciphertext. That is a known-plaintext attack, and it needs only one guess.',
    ] },
    { id: 'patch', heading: 'Make the keyspace too big to search', body: [
      'The fix for brute force is more keys. A cipher\'s keyspace has to be so large that trying every key costs more than the secret is worth.',
    ] },
    { id: 'reality', heading: 'What real systems do', body: [
      'Modern ciphers such as AES use 128- or 256-bit keys. Trying all 2¹²⁸ keys at a billion billion guesses per second would still take around ten trillion years.',
      'Size alone isn\'t enough, though. The next episodes show ciphers with enormous keyspaces that still fall to cleverer attacks than brute force.',
    ] },
    { id: 'next', heading: 'Give every letter its own mapping', body: [
      'A substitution cipher scrambles the whole alphabet instead of sliding it: 26! ≈ 4 × 10²⁶ possible keys, far too many to try one by one. It still breaks, because English letter frequencies survive encryption.',
    ] },
  ],
};

// ---- state <-> URL -------------------------------------------------------------

export const defaults = { text: 'HELLO', shift: '3' };
export const paramsFrom = (s) => ({ text: s.text ?? defaults.text, shift: normaliseShift(s.shift ?? defaults.shift) });
export const paramsTo = (v) => ({ text: v.text, shift: String(v.shift) });

/** Stage needs short, letters-only messages to stay legible at arm's length. */
function stageText(c) {
  const t = String(c.text || '').toUpperCase().replace(/[^A-Z ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 8).trim();
  return t || 'HELLO';
}
function stageShift(c) { return normaliseShift(c.shift) || 3; }

// ---- Stage scenes (FR-S1: big title, one visual, one sentence) ------------------
// `say` is the tour narration, rendered to static audio by tools/voiceover.mjs.
// It is written for the default message (HELLO, shift 3), which the tour always uses.

const WINDOW = { vertical: 7, square: 7, wide: 10 };

export const scenes = {
  promise: {
    say: "This looks scrambled. K, H, O, O, R. Let's break it.",
    surface: 'cover-red',
    duration: 3500,
    title: () => 'This looks scrambled.',
    visual: (c) => h('div', { class: 'framed cz-pop' }, encrypt(stageText(c), stageShift(c))),
    // The silent clip reaches the break in ~13s; the narrated tour takes longer, so it doesn't promise a time.
    line: (c) => (c.tour ? 'Let\'s break it.' : 'Let\'s break it in 20 seconds.'),
  },

  build: {
    say: "The Caesar cipher moves every letter three places along the alphabet. A becomes D. Run off the end, and Z wraps round to C.",
    surface: 'paper',
    duration: 5000,
    title: (c) => `Move every letter ${stageShift(c)} places.`,
    visual: (c) => {
      const s = stageShift(c);
      const n = WINDOW[c.ratio];
      const plain = ALPHABET.slice(0, n);
      // The cipher row starts aligned with the plain row, then slides left by the shift.
      const run = Array.from({ length: n + s }, (_, i) => ALPHABET[i % 26]).join('');
      return h('div', { class: 'cz-strip' },
        tiles(plain, 'plain', { label: `plain letters ${plain}` }),
        h('div', { class: 'cz-key mono' }, `↓ shift +${s}`),
        h('div', { class: 'cz-window', style: { '--n': n } },
          h('div', { class: 'cz-slide', style: { '--shift': s } },
            tiles(run, 'public', { label: `become ${encrypt(plain, s)}` }))));
    },
    line: (c) => {
      const s = stageShift(c);
      return `A becomes ${encrypt('A', s)}. Z wraps round to ${encrypt('Z', s)}.`;
    },
  },

  demo: {
    say: "Alice writes hello, shifts it by three, and sends K, H, O, O, R. Bob knows the key, so he shifts back three and reads hello.",
    surface: 'paper',
    duration: 5000,
    title: (c) => `Alice sends ${encrypt(stageText(c), stageShift(c))}.`,
    visual: (c) => {
      const t = stageText(c);
      const s = stageShift(c);
      return h('div', { class: 'cz-flow' },
        h('div', { class: 'cz-party' }, cast('alice'), tiles(t, 'plain')),
        h('div', { class: 'cz-key mono' }, `↓ shift +${s}`),
        h('div', { class: 'cz-party' }, tiles(encrypt(t, s), 'public', { stagger: true }), cast('bob')));
    },
    line: (c) => `Bob knows the key. He shifts back ${stageShift(c)} and reads ${stageText(c)}.`,
  },

  break: {
    say: "Now Eve. She sees the message, but not the key. She doesn't need it. There are only twenty-five keys, so she tries every one. Shift three reads hello. Broken.",
    surface: 'ink',
    duration: 7000,
    eyebrow: (c) => cast('eve', `eve sees ${encrypt(stageText(c), stageShift(c))}`),
    title: () => 'Try all 25 shifts.',
    visual: (c) => {
      const tries = bruteForce(encrypt(stageText(c), stageShift(c)));
      return h('ol', { class: 'cz-tries mono', 'aria-label': 'all 25 decryptions' },
        tries.map((t, i) => h('li', { class: t.best ? 'best' : '', style: { '--i': i } },
          h('span', { class: 'k' }, String(t.shift).padStart(2, '0')), t.text)));
    },
    line: (c) => {
      const best = bruteForce(encrypt(stageText(c), stageShift(c))).find((t) => t.best);
      return `Shift ${best.shift} reads ${best.text}. Broken in 25 guesses.`;
    },
  },

  patch: {
    say: "That's the lesson. A tiny keyspace is not security. Caesar has twenty-five keys. A modern cipher like AES has two to the power of a hundred and twenty-eight. Nobody is trying those one by one.",
    surface: 'paper',
    duration: 5000,
    title: () => 'A tiny keyspace is not security.',
    visual: () => h('div', { class: 'cz-meters' },
      h('div', {}, h('p', { class: 'cz-meter-name mono' }, 'caesar · 25 keys'), attackMeter('tiny')),
      h('div', {}, h('p', { class: 'cz-meter-name mono' }, 'aes-128 · 2', h('sup', {}, '128'), ' keys'), attackMeter('astronomical'))),
    line: () => 'Real ciphers have too many keys to try one by one.',
  },

  next: {
    say: "So what if every letter had its own mapping? That's the substitution cipher. Far more keys. Still broken. See you there.",
    surface: 'cover-ink',
    duration: 4000,
    title: () => 'What if every letter had its own mapping?',
    visual: () => h('div', { class: 'framed cz-pop cz-small' }, '4 × 10', h('sup', {}, '26'), ' keys'),
    line: () => 'Next: the substitution cipher. Bigger. Still broken.',
  },
};

// ---- Explore widgets (FR-E2, FR-E3) ----------------------------------------------

export const widgets = {
  build(store) {
    const text = h('input', { type: 'text', id: 'cz-text', spellcheck: 'false', autocomplete: 'off',
      onInput: (e) => store.set({ text: e.target.value }) });
    const range = h('input', { type: 'range', id: 'cz-shift', min: 1, max: 25, step: 1,
      onInput: (e) => store.set({ shift: Number(e.target.value) }) });
    const readout = h('output', { class: 'shift-readout', for: 'cz-shift' });
    const strip = h('div', { class: 'strip' });
    const cmd = h('span', { class: 'arg' });
    const out = h('div', { class: 'out' });

    store.subscribe(({ text: t, shift: s }) => {
      if (text.value !== t) text.value = t;
      range.value = s;
      readout.value = `+${s}`;
      strip.replaceChildren(
        h('div', { class: 'strip-row' }, h('span', { class: 'label' }, 'plain'), tiles(ALPHABET, 'plain', { label: 'plain alphabet' })),
        h('div', { class: 'strip-key' }, `↓ every letter moves ${s} place${s === 1 ? '' : 's'}`),
        h('div', { class: 'strip-row' }, h('span', { class: 'label' }, 'cipher'), tiles(encrypt(ALPHABET, s), 'public', { label: `cipher alphabet ${encrypt(ALPHABET, s)}` })));
      cmd.textContent = `caesar --shift=${s} '${t}'`;
      out.textContent = encrypt(t, s) || ' ';
    });

    return h('div', { class: 'demo' },
      h('div', { class: 'demo-row' },
        h('div', { class: 'field' }, h('label', { for: 'cz-text' }, 'message'), text),
        h('div', { class: 'field' }, h('label', { for: 'cz-shift' }, 'shift (the key)'),
          h('div', { style: { display: 'flex', gap: '14px', 'align-items': 'center' } }, range, readout))),
      strip,
      h('div', { class: 'term', 'aria-live': 'polite' },
        h('div', {}, h('span', { class: 'ph' }, 'ash:~$'), ' ', cmd),
        out));
  },

  break(store) {
    const panel = h('div', { class: 'attacker on-ink', hidden: true, 'aria-live': 'polite' });
    const button = h('button', { type: 'button', class: 'btn break-it', 'aria-expanded': 'false',
      onClick: () => { panel.hidden = false; button.setAttribute('aria-expanded', 'true'); button.textContent = 'Break it again'; render(store.get()); } },
    'Break it');

    function render({ text: t, shift: s }) {
      if (panel.hidden) return;
      const ct = encrypt(t, s);
      if (!/[a-z]/i.test(ct)) {
        panel.replaceChildren(h('p', {}, 'Type a message with some letters in it first.'));
        return;
      }
      const tries = bruteForce(ct);
      const best = tries.find((x) => x.best);
      panel.replaceChildren(
        h('div', { class: 'attacker-head' }, cast('eve'),
          h('span', { class: 'sees' }, 'eve sees only the ciphertext: ', h('b', {}, ct))),
        h('ol', { class: 'tries', 'aria-label': 'every possible decryption' },
          tries.map((x, i) => h('li', { class: x.best ? 'best' : '', style: { '--i': i } },
            h('span', { class: 'k' }, String(x.shift).padStart(2, '0')), x.text))),
        h('p', { class: 'verdict' }, 'Eve\'s best guess: shift ', h('span', { class: 'hl' }, String(best.shift)),
          best.shift === s ? '. That\'s the key.' : `. Wrong this time: the key was ${s}. Short or unusual messages can fool her scoring, but she can still read all 25 by eye.`),
        attackMeter('tiny', '25 keys · a laptop tries them all in microseconds · this break is real, not a toy'));
    }
    store.subscribe(render);

    return h('div', {}, button, panel);
  },

  patch() {
    return h('div', { class: 'demo' },
      h('p', { class: 'label', style: { margin: '0 0 6px' } }, 'caesar · 25 keys'),
      attackMeter('tiny'),
      h('p', { class: 'label', style: { margin: '18px 0 6px' } }, 'substitution · 26! ≈ 4 × 10', h('sup', {}, '26'), ' keys'),
      attackMeter('astronomical', 'too many to try, but frequency analysis skips the search entirely (episode 4)'),
      h('p', { class: 'label', style: { margin: '18px 0 6px' } }, 'aes-128 · 2', h('sup', {}, '128'), ' ≈ 3.4 × 10', h('sup', {}, '38'), ' keys'),
      attackMeter('astronomical', 'no known shortcut'));
  },

  next() {
    return h('div', { style: { display: 'flex', gap: '14px', 'flex-wrap': 'wrap' } },
      h('div', { class: 'next-card' }, h('span', { class: 'tag' }, 'ep 03'), h('strong', {}, 'ROT13'), h('span', { class: 'soon' }, 'Apply it twice. Not yet shipped.')),
      h('div', { class: 'next-card' }, h('span', { class: 'tag' }, 'ep 04'), h('strong', {}, 'Substitution cipher'), h('span', { class: 'soon' }, 'Frequency analysis. Not yet shipped.')));
  },
};
