// Arc 2 · Episode 7 — Text as numbers: computers need representations.
import { h } from '../../assets/js/dom.js';
import { cast, attackMeter, framed, specRows } from '../../assets/js/components.js';
import { chars, utf8, hex, bin, uplus, spoof, nonAscii, naiveBlocked, mojibake } from './textnum.js';

export const meta = {
  slug: 'text-as-numbers',
  arc: 2,
  episode: 7,
  title: 'Text as numbers',
  promise: 'Turn every letter into a number, so a machine can store it, send it and, later, encrypt it.',
  builds: ['code points', 'UTF-8 bytes'],
  breaks: ['look-alike characters', 'encoding mix-ups'],
  attack_cost: 'tiny',
  patch: ['agree on one encoding', 'compare bytes, not looks'],
  unlocks: ['bits and bytes', 'byte-level crypto'],
  stage_scenes: ['promise', 'build', 'demo', 'break', 'mixup', 'patch', 'next'],
  beats: [
    { id: 'promise', heading: 'Letters are a human idea', body: [
      'A computer can\'t store the letter H. It stores numbers. So everyone agrees on a table: H is 72, e is 101, and so on. Every cipher from here on works on those numbers, not on letters.',
    ] },
    { id: 'build', heading: 'Every character has a number', body: [
      'Type anything. Plain English letters fit in one byte each; accents, other alphabets and symbols take two, three or four bytes in UTF-8, the encoding nearly the whole web uses.',
    ] },
    { id: 'trust', heading: 'Why it looks good', body: [
      'This feels like plumbing, not security. The text on screen is the text, surely: if two names look the same, they are the same name.',
    ] },
    { id: 'break', heading: 'Encoding confusion', body: [
      'They are not the same. Cyrillic has its own а, е, о and р that look identical to the Latin ones but are different numbers. Eve registers "pаypal" with a Cyrillic а. A blocklist that compares text by eye, or even by naive string matching against "paypal", waves her straight through. These are called homograph attacks, and they have been used to fake web addresses.',
      'The other failure is two systems disagreeing about the encoding. Write "café" as UTF-8 and read it back as Windows-1252 and you get "cafÃ©". Annoying in an email; dangerous when one side checks a value and the other side acts on a different one.',
    ] },
    { id: 'patch', heading: 'Agree on bytes, not looks', body: [
      'Pick one encoding (UTF-8) and say so everywhere. Normalise text before comparing it, and flag mixed alphabets in places where look-alikes matter, like usernames and web addresses. Above all, remember what the machine actually sees: bytes.',
    ] },
    { id: 'reality', heading: 'What real systems do', body: [
      'Browsers show suspicious mixed-script web addresses in their raw "xn--" form instead of the pretty version. Unicode publishes confusable-character tables for exactly this. And every cryptographic function you will meet works on bytes: hash "café" in one encoding and in another, and you get two unrelated answers.',
    ] },
    { id: 'next', heading: 'Look inside a byte', body: [
      'Each of those numbers is a byte: eight bits, eight tiny switches. Next, what happens when you flip just one of them.',
    ] },
  ],
};

export const defaults = { text: 'Hello, café' };
export const paramsFrom = (s) => ({ text: s.text ?? defaults.text });
export const paramsTo = (v) => ({ text: v.text });

export const scenes = {
  promise: {
    surface: 'cover-red',
    duration: 3500,
    say: 'Computers can\'t store letters. Only numbers. So what is H?',
    title: () => 'Computers can\'t store letters.',
    visual: () => framed('H = 72'),
    line: () => 'Only numbers.',
  },
  build: {
    surface: 'paper',
    duration: 5500,
    say: 'Everyone agrees on a table. H is seventy-two. E is sixty-nine. L is seventy-six. Each number fits in one byte: eight bits.',
    title: () => 'Every letter is a number.',
    visual: (c) => specRows(chars('HELLO').map((x) => [x.ch, `${x.cp} · 0x${hex(x.bytes)}${c.ratio === 'vertical' ? '' : ` · ${bin(x.cp)}`}`])),
    line: () => 'One letter, one number, one byte.',
  },
  demo: {
    surface: 'paper',
    duration: 5500,
    say: 'Plain letters take one byte. An accented e takes two. A euro sign takes three. That\'s UTF-8, and almost the whole web uses it.',
    title: () => 'Beyond A to Z: UTF-8.',
    visual: () => specRows([
      ['A', '1 byte · 41'],
      ['é', '2 bytes · C3 A9'],
      ['€', '3 bytes · E2 82 AC', { hl: true }],
    ]),
    line: () => 'The same idea, with more bytes when needed.',
  },
  break: {
    surface: 'ink',
    duration: 6500,
    say: 'Now Eve signs up as paypal. Except that a is a Cyrillic a. It looks identical. The bytes aren\'t. A filter that checks by eye lets her straight in.',
    eyebrow: () => cast('eve', 'eve registers a name'),
    title: () => 'Same look. Different bytes.',
    visual: (c) => specRows([
      ['paypal', hex(utf8('paypal'))],
      [spoof('paypal'), hex(utf8(spoof('paypal'))), { hl: true }],
      ['blocked?', naiveBlocked(spoof('paypal'), ['paypal']) ? 'yes' : 'no: it isn\'t "paypal"'],
    ]),
    line: () => 'One Cyrillic а, and the blocklist never fires.',
  },
  mixup: {
    surface: 'ink',
    duration: 5500,
    say: 'Or two systems disagree. One writes café in UTF-8. The other reads it as Windows twelve fifty-two. Same bytes, different text.',
    eyebrow: () => cast('eve', 'two systems, two decoders'),
    title: () => 'Wrong decoder, different text.',
    visual: () => specRows([
      ['written', 'café'],
      ['bytes', hex(utf8('café'))],
      ['read back', mojibake('café'), { hl: true }],
    ]),
    line: () => 'If one side checks and the other acts, that gap is a hole.',
  },
  patch: {
    surface: 'paper',
    duration: 5000,
    say: 'Computers need representations. Agree on one encoding, compare bytes, not looks, and remember that crypto only ever sees the bytes.',
    title: () => 'Agree on bytes, not looks.',
    visual: () => specRows([
      ['encoding', 'one, everywhere: UTF-8'],
      ['comparing', 'normalise first, flag look-alikes'],
      ['crypto sees', 'bytes, never letters', { hl: true }],
    ]),
    line: () => 'What the machine sees is what counts.',
  },
  next: {
    surface: 'cover-ink',
    duration: 4000,
    say: 'Every one of those bytes is eight bits. Eight tiny switches. Next, what happens when you flip just one.',
    title: () => 'Eight switches in every byte.',
    visual: () => framed(['0100100', h('span', { class: 'tn-flip' }, '0')], { small: true }),
    line: () => 'Next: bits and bytes.',
  },
};

export const widgets = {
  build(store) {
    const input = h('input', { type: 'text', id: 'tn-text', spellcheck: 'false', autocomplete: 'off', onInput: (e) => store.set({ text: e.target.value }) });
    const table = h('table', { class: 'tn-table' });
    const total = h('p', { class: 'label', 'aria-live': 'polite' });
    store.subscribe(({ text }) => {
      if (input.value !== text) input.value = text;
      const rows = chars(text).slice(0, 40);
      table.replaceChildren(
        h('thead', {}, h('tr', {}, ['char', 'code point', 'utf-8 bytes', 'bits'].map((t) => h('th', { scope: 'col' }, t)))),
        h('tbody', {}, rows.map((x) => h('tr', { class: x.cp > 0x7f ? 'wide' : '' },
          h('td', { class: 'ch' }, x.ch === ' ' ? '␠' : x.ch), h('td', {}, uplus(x.cp)), h('td', {}, hex(x.bytes)), h('td', {}, x.bytes.map(bin).join(' '))))));
      total.textContent = `${[...text].length} characters → ${utf8(text).length} bytes${text.length > 40 ? ' (table shows the first 40)' : ''}`;
    });
    return h('div', { class: 'demo' },
      h('div', { class: 'demo-row' }, h('div', { class: 'field' }, h('label', { for: 'tn-text' }, 'text'), input)),
      total, h('div', { class: 'table-wrap' }, table));
  },

  break() {
    const blocklist = ['paypal', 'admin', 'support'];
    const name = h('input', { type: 'text', id: 'tn-name', value: spoof('paypal'), spellcheck: 'false', autocomplete: 'off' });
    const panel = h('div', { class: 'attacker on-ink', hidden: true, 'aria-live': 'polite' });
    const run = () => {
      panel.hidden = false;
      const v = name.value;
      const odd = nonAscii(v);
      panel.replaceChildren(
        h('div', { class: 'attacker-head' }, cast('eve'), h('span', { class: 'sees' }, 'eve signs up as: ', h('b', {}, v))),
        h('p', { class: 'verdict' }, 'Naive check against [', blocklist.join(', '), ']: ',
          h('span', { class: 'hl' }, naiveBlocked(v, blocklist) ? 'blocked' : 'allowed')),
        h('p', { class: 'muted mono' }, 'bytes: ', hex(utf8(v))),
        odd.length ? h('p', { class: 'muted' }, `Look-alike characters: ${odd.map((x) => `${x.ch} (${uplus(x.cp)})`).join(', ')}. A careful check flags any non-Latin letter in a Latin name.`)
          : h('p', { class: 'muted' }, 'Nothing unusual in this one. Try the spoof buttons.'),
        h('p', { class: 'muted' }, 'And the other mix-up: ', h('b', {}, 'café'), ' written as UTF-8, read as Windows-1252, comes back as ', h('b', {}, mojibake('café')), '.'),
        attackMeter('tiny', 'no key, no maths · just two readings of the same bytes'));
    };
    const spoofBtn = (w) => h('button', { type: 'button', class: 'enc-pick', onClick: () => { name.value = spoof(w); run(); } }, `spoof "${w}"`);
    return h('div', {},
      h('div', { class: 'demo-row' }, h('div', { class: 'field' }, h('label', { for: 'tn-name' }, 'username to register'), name),
        h('div', { style: { display: 'flex', gap: '6px', 'flex-wrap': 'wrap' } }, blocklist.map(spoofBtn))),
      h('button', { type: 'button', class: 'btn break-it', onClick: run }, 'Break it'),
      panel);
  },
};
