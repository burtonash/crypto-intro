// Arc 1 · Episode 3 — ROT13: some ciphers barely deserve the name.
import { h } from '../../assets/js/dom.js';
import { tiles, cast, attackMeter, framed, keyArrow, flow, specRows } from '../../assets/js/components.js';
import { rot13 } from './lesson-logic.js';

export const meta = {
  slug: 'rot13',
  arc: 1,
  episode: 3,
  title: 'ROT13',
  promise: 'Hide punchlines and spoilers with a shift everyone already knows.',
  builds: ['half-alphabet rotation', 'self-inverse ciphers'],
  breaks: ['public key', 'apply it twice'],
  attack_cost: 'tiny',
  patch: ['a key that is actually secret'],
  unlocks: ['secret keys', 'substitution ciphers'],
  stage_scenes: ['promise', 'build', 'demo', 'break', 'patch', 'next'],
  beats: [
    { id: 'promise', heading: 'A cipher that undoes itself', body: [
      'ROT13 is the Caesar cipher with the shift fixed at 13. Early internet forums used it to hide joke punchlines and film spoilers: you had to choose to decode them.',
    ] },
    { id: 'build', heading: 'Half the alphabet', body: [
      'Thirteen is exactly half of twenty-six, so the alphabet splits into two halves that swap places: A becomes N, N becomes A. Type something and press the button again and again.',
    ] },
    { id: 'trust', heading: 'Why it looks good', body: [
      'It\'s convenient: one operation both scrambles and unscrambles, so there is nothing to remember and no way to pick the wrong direction. For keeping your eyes off a spoiler, that is exactly right.',
    ] },
    { id: 'break', heading: 'Apply it twice', body: [
      'There is no key to discover. The shift is 13, it is always 13, and everyone knows it. Eve doesn\'t brute-force anything; she just applies ROT13 to what she intercepted.',
      'ROT13 is a cipher in the mechanical sense only. Its security is zero by design, and that is fine as long as nobody mistakes it for protection.',
    ] },
    { id: 'patch', heading: 'A key has to be secret', body: [
      'A cipher whose key everyone knows is just an encoding with extra steps. The fix isn\'t a cleverer rotation: it is a key that only the sender and receiver have.',
    ] },
    { id: 'reality', heading: 'What real systems do', body: [
      'ROT13 survives as an in-joke and as a way to hide spoilers. There are real-world stories of "ROT13 encryption" in commercial software, and every one of them is a cautionary tale.',
    ] },
    { id: 'next', heading: 'More keys than you can count', body: [
      'Caesar has 25 keys and ROT13 has one. A substitution cipher shuffles the whole alphabet and has about 4 × 10²⁶ keys. Surely that is enough.',
    ] },
  ],
};

export const defaults = { text: 'HELLO' };
export const paramsFrom = (s) => ({ text: s.text ?? defaults.text });
export const paramsTo = (v) => ({ text: v.text });

const stageText = (c) => (String(c.text || '').toUpperCase().replace(/[^A-Z ]/g, '').replace(/\s+/g, ' ').trim().slice(0, 8).trim() || 'HELLO');

export const scenes = {
  promise: {
    surface: 'cover-red',
    duration: 3500,
    say: 'Meet the cipher that undoes itself. U, R, Y, Y, B.',
    title: () => 'The cipher that undoes itself.',
    visual: (c) => framed(rot13(stageText(c))),
    line: () => 'Built to hide spoilers.',
  },
  build: {
    surface: 'paper',
    duration: 5000,
    say: 'Rotate every letter by thirteen. That\'s exactly half the alphabet, so the two halves just swap. A becomes N. N becomes A.',
    title: () => 'Shift by 13. Half the alphabet.',
    visual: () => h('div', { class: 'r13-halves' },
      tiles('ABCDEFGHIJKLM', 'plain', { label: 'A to M' }),
      keyArrow('↕ swap'),
      tiles('NOPQRSTUVWXYZ', 'public', { label: 'N to Z', stagger: true })),
    line: () => 'A becomes N. N becomes A.',
  },
  demo: {
    surface: 'paper',
    duration: 5500,
    say: 'Alice rotates hello by thirteen and sends it. Bob doesn\'t need a separate decoder. He rotates by thirteen again, and reads hello.',
    title: (c) => `Alice sends ${rot13(stageText(c))}.`,
    visual: (c) => flow([cast('alice'), tiles(stageText(c), 'plain')], keyArrow('↓ rot13'), [tiles(rot13(stageText(c)), 'public', { stagger: true }), cast('bob')]),
    line: (c) => `Bob applies ROT13 again and reads ${stageText(c)}.`,
  },
  break: {
    surface: 'ink',
    duration: 5500,
    say: 'Eve doesn\'t need to guess a key. The key is thirteen. It\'s always thirteen. Everyone knows it. She applies it once, and reads the message.',
    eyebrow: (c) => cast('eve', `eve sees ${rot13(stageText(c))}`),
    title: () => 'The key is always 13.',
    visual: (c) => specRows([
      ['intercepted', rot13(stageText(c))],
      ['rot13 once', stageText(c), { hl: true }],
      ['guesses', '0'],
    ]),
    line: () => 'No search. Everyone already knows the key.',
  },
  patch: {
    surface: 'paper',
    duration: 5000,
    say: 'A key everyone knows is no key at all. ROT13 hides spoilers from your own eyes. It hides nothing from anyone who wants to read it.',
    title: () => 'A public key is no key.',
    visual: () => specRows([
      ['keys', '1, and it is public'],
      ['good for', 'hiding spoilers'],
      ['not for', 'hiding secrets', { hl: true }],
    ]),
    line: () => 'Security needs a key only the right people have.',
  },
  next: {
    surface: 'cover-ink',
    duration: 4000,
    say: 'So what if we shuffled the whole alphabet, and kept the shuffle secret? Next, the substitution cipher.',
    title: () => 'What if we shuffled the whole alphabet?',
    visual: () => framed(['4 × 10', h('sup', {}, '26'), ' keys'], { small: true }),
    line: () => 'Next: the substitution cipher.',
  },
};

export const widgets = {
  build(store) {
    const input = h('input', { type: 'text', id: 'r13-text', spellcheck: 'false', autocomplete: 'off', onInput: (e) => { store.set({ text: e.target.value }); chain = []; draw(); } });
    const out = h('div', { class: 'term', 'aria-live': 'polite' });
    let chain = [];
    const draw = () => {
      const { text } = store.get();
      const rows = [text, ...chain];
      out.replaceChildren(...rows.map((r, i) => h('div', {}, i ? [h('span', { class: 'ph' }, 'ash:~$'), ' rot13'] : h('span', { class: 'cmt' }, '# your message'),
        h('div', { class: i % 2 ? 'out' : 'arg' }, r || ' '))));
    };
    const again = h('button', { type: 'button', class: 'btn', onClick: () => { const last = chain.at(-1) ?? store.get().text; chain = [...chain, rot13(last)].slice(-4); draw(); } }, 'Apply ROT13');
    store.subscribe(({ text }) => { if (input.value !== text) input.value = text; draw(); });
    return h('div', { class: 'demo' },
      h('div', { class: 'demo-row' }, h('div', { class: 'field' }, h('label', { for: 'r13-text' }, 'message'), input), again),
      h('div', { class: 'strip' },
        h('div', { class: 'strip-row' }, h('span', { class: 'label' }, 'a–m'), tiles('ABCDEFGHIJKLM', 'plain')),
        h('div', { class: 'strip-key' }, '↕ each letter swaps with the one 13 away'),
        h('div', { class: 'strip-row' }, h('span', { class: 'label' }, 'n–z'), tiles('NOPQRSTUVWXYZ', 'public'))),
      out);
  },

  break(store) {
    const panel = h('div', { class: 'attacker on-ink', hidden: true, 'aria-live': 'polite' });
    const button = h('button', { type: 'button', class: 'btn break-it', onClick: () => { panel.hidden = false; button.textContent = 'Break it again'; render(store.get()); } }, 'Break it');
    function render({ text }) {
      if (panel.hidden) return;
      const ct = rot13(text);
      panel.replaceChildren(
        h('div', { class: 'attacker-head' }, cast('eve'), h('span', { class: 'sees' }, 'eve sees: ', h('b', {}, ct))),
        h('p', { class: 'verdict' }, 'She applies ROT13 once: ', h('span', { class: 'hl' }, text || '…'), '. Guesses needed: none.'),
        attackMeter('tiny', 'one key, published · no search at all'));
    }
    store.subscribe(render);
    return h('div', {}, button, panel);
  },
};
