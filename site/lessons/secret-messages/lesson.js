// Arc 1 · Episode 1 — Secret messages: encoding is not encryption.
import { h } from '../../assets/js/dom.js';
import { cast, attackMeter, framed, keyArrow, flow, triesGrid, specRows } from '../../assets/js/components.js';
import { ENCODINGS, byId, decodeAll } from './encodings.js';

export const meta = {
  slug: 'secret-messages',
  arc: 1,
  episode: 1,
  title: 'Secret messages',
  promise: 'Make a message unreadable to anyone who doesn\'t know the trick.',
  builds: ['reversing', 'hex and binary', 'base64', 'morse code'],
  breaks: ['knowing the encoding'],
  attack_cost: 'tiny',
  patch: ['add a secret key'],
  unlocks: ['ciphers', 'keys'],
  stage_scenes: ['promise', 'build', 'demo', 'break', 'patch', 'next'],
  beats: [
    { id: 'promise', heading: 'Hide a message in plain sight', body: [
      'Turn a message into something that doesn\'t look like a message: backwards text, a string of hex, a wall of ones and zeros, a line of base64. If you don\'t know the trick, it looks like nonsense.',
    ] },
    { id: 'build', heading: 'Five tricks, no keys', body: [
      'Type a message and watch five encodings at once. Every one of them is a recipe: follow it forwards to encode, backwards to decode. None of them asks you for a secret.',
    ] },
    { id: 'trust', heading: 'Why it looks good', body: [
      'Base64 and hex look properly scrambled, and they are everywhere: email attachments, web addresses, configuration files, API tokens. It is easy to assume something that looks this technical must be protecting something.',
    ] },
    { id: 'break', heading: 'Read it if you know the trick', body: [
      'Eve doesn\'t need to be clever. There are only a handful of common encodings, so she runs every decoder and keeps whichever output reads as English. Paste anything below and she\'ll try.',
      'This is the most common "crypto" mistake in real software: a password or token stored in base64 and treated as hidden. It isn\'t. Anyone who sees it can read it.',
    ] },
    { id: 'patch', heading: 'Add something the attacker doesn\'t have', body: [
      'Encoding changes how a message looks. Encryption makes it unreadable without a secret, the key. The recipe can be public; the key cannot.',
    ] },
    { id: 'reality', heading: 'What real systems do', body: [
      'Real systems use encodings all the time, and that\'s fine: base64 is how binary data travels through systems built for text. The mistake is only ever in treating an encoding as protection. Anything secret is encrypted first, then encoded for transport.',
    ] },
    { id: 'next', heading: 'Add a key', body: [
      'The oldest cipher with a key is a single number: move every letter that many places along the alphabet. It\'s a real step up from encoding, and it falls just as fast.',
    ] },
  ],
};

// ---- state <-> URL -------------------------------------------------------------

export const defaults = { text: 'MEET AT NOON', enc: 'base64' };
export const paramsFrom = (s) => ({ text: s.text ?? defaults.text, enc: byId[s.enc] ? s.enc : defaults.enc });
export const paramsTo = (v) => ({ text: v.text, enc: v.enc });

const stageText = (c) => (String(c.text || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 14) || 'MEET AT NOON');
const stageEnc = (c) => (byId[c.enc] ? c.enc : 'base64');
const encoded = (c) => byId[stageEnc(c)].encode(stageText(c));
// Long encodings (binary, morse) get trimmed on Stage with an ellipsis.
const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// ---- Stage scenes ----------------------------------------------------------------

export const scenes = {
  promise: {
    surface: 'cover-red',
    duration: 3500,
    say: 'Is this a secret message? It certainly looks like one.',
    title: () => 'Is this a secret?',
    visual: (c) => framed(clip(encoded(c), 18), { small: true }),
    line: () => 'It certainly looks like one.',
  },
  build: {
    surface: 'paper',
    duration: 6000,
    say: 'Here\'s the same message five ways. Backwards. Hex. Binary. Base sixty-four. Morse. Each one is a recipe, and none of them needs a key.',
    title: () => 'Same message, five recipes.',
    visual: (c) => specRows(ENCODINGS.map((e) => [e.label, clip(e.encode(stageText(c)), c.ratio === 'wide' ? 44 : 24), { hl: e.id === stageEnc(c) }])),
    line: () => 'None of them needs a key.',
  },
  demo: {
    surface: 'paper',
    duration: 5000,
    say: 'Alice encodes her message and sends it. Bob runs the recipe backwards and reads it. So can anyone else.',
    title: () => 'Alice sends it. Bob decodes it.',
    visual: (c) => flow([cast('alice'), h('span', { class: 'sm-plain mono' }, stageText(c))],
      keyArrow(`↓ ${stageEnc(c)}`),
      [h('span', { class: 'sm-coded mono' }, clip(encoded(c), 18)), cast('bob')]),
    line: () => 'Bob runs the recipe backwards. So can anyone.',
  },
  break: {
    surface: 'ink',
    duration: 6500,
    say: 'Eve has never seen this message. She doesn\'t need to. She runs every decoder she knows. One of them reads as English. That\'s it. No key, no secret, nothing to break.',
    eyebrow: (c) => cast('eve', `eve sees ${clip(encoded(c), 14)}`),
    title: () => 'Try every decoder.',
    visual: (c) => triesGrid(decodeAll(encoded(c)).map((r) => ({ key: r.label.padEnd(7), text: r.text == null ? '—' : clip(r.text, 16), best: r.best })), 'every decoder', { cols: 1 }),
    line: () => 'One reads as English. There was no secret.',
  },
  patch: {
    surface: 'paper',
    duration: 5000,
    say: 'Encoding is not encryption. Encoding changes how a message looks. Encryption needs a secret, a key, that the attacker doesn\'t have.',
    title: () => 'Encoding is not encryption.',
    visual: () => specRows([
      ['encoding', 'recipe public · no key'],
      ['encryption', 'recipe public · key secret', { hl: true }],
    ]),
    line: () => 'Encryption needs a secret the attacker doesn\'t have.',
  },
  next: {
    surface: 'cover-ink',
    duration: 4000,
    say: 'So let\'s add a key. The simplest one there is: a single number. Next, the Caesar cipher.',
    title: () => 'So add a key.',
    visual: () => framed('+3'),
    line: () => 'Next: the Caesar cipher. One number to share.',
  },
};

// ---- Explore widgets -------------------------------------------------------------

export const widgets = {
  build(store) {
    const input = h('input', { type: 'text', id: 'sm-text', spellcheck: 'false', autocomplete: 'off', onInput: (e) => store.set({ text: e.target.value }) });
    const table = h('table', { class: 'enc-table' });
    store.subscribe(({ text, enc }) => {
      if (input.value !== text) input.value = text;
      table.replaceChildren(h('tbody', {}, ENCODINGS.map((e) => h('tr', { class: e.id === enc ? 'on' : '' },
        h('th', { scope: 'row' }, h('button', { type: 'button', class: 'enc-pick', 'aria-pressed': String(e.id === enc), onClick: () => store.set({ enc: e.id }) }, e.label)),
        h('td', {}, h('code', {}, e.encode(text) || ' '), h('span', { class: 'enc-blurb' }, e.blurb))))));
    });
    return h('div', { class: 'demo' },
      h('div', { class: 'demo-row' }, h('div', { class: 'field' }, h('label', { for: 'sm-text' }, 'message'), input)),
      h('p', { class: 'label', style: { margin: '0 0 6px' } }, 'pick the one you\'d send'),
      table);
  },

  break(store) {
    const area = h('textarea', { id: 'sm-intercept', rows: 3, spellcheck: 'false' });
    let edited = false;
    area.addEventListener('input', () => { edited = true; });
    const panel = h('div', { class: 'attacker on-ink', hidden: true, 'aria-live': 'polite' });
    const button = h('button', { type: 'button', class: 'btn break-it', onClick: () => { panel.hidden = false; button.textContent = 'Break it again'; render(); } }, 'Break it');
    store.subscribe(({ text, enc }) => { if (!edited) area.value = byId[enc].encode(text); render(); });

    function render() {
      if (panel.hidden) return;
      const rows = decodeAll(area.value);
      const best = rows.find((r) => r.best);
      panel.replaceChildren(
        h('div', { class: 'attacker-head' }, cast('eve'), h('span', { class: 'sees' }, 'eve runs every decoder she knows')),
        h('ol', { class: 'tries tries-wide', 'aria-label': 'every decoder' },
          rows.map((r, i) => h('li', { class: r.best ? 'best' : '', style: { '--i': i } }, h('span', { class: 'k' }, r.label.padEnd(8)), r.text ?? '— not this one'))),
        h('p', { class: 'verdict' }, best ? ['It was ', h('span', { class: 'hl' }, best.label), '. No key, no secret.'] : 'None of these decoders fits. It might be genuinely encrypted, or an encoding Eve doesn\'t know yet.'),
        attackMeter('tiny', 'zero keys · one attempt per known encoding'));
    }

    return h('div', {},
      h('div', { class: 'field', style: { 'margin-bottom': '12px' } }, h('label', { for: 'sm-intercept' }, 'intercepted message (edit or paste your own)'), area),
      button, panel);
  },
};
