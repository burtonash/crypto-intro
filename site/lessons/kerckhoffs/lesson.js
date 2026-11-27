// Arc 1 · Episode 6 — Kerckhoffs's principle: only the key should need to be secret.
import { h } from '../../assets/js/dom.js';
import { cast, attackMeter, framed, keyArrow, flow, specRows } from '../../assets/js/components.js';
import { STEPS, byId, encrypt, searchRecipes } from './recipes.js';

const DEFAULT_MESSAGE = 'The shipment arrives on Tuesday at the north dock. Tell nobody.';
const DEFAULT_RECIPE = ['rev', 'shift7', 'swap'];

export const meta = {
  slug: 'kerckhoffs',
  arc: 1,
  episode: 6,
  title: 'Kerckhoffs\'s principle',
  promise: 'Keep the method itself secret, so the attacker doesn\'t even know where to start.',
  builds: ['home-made secret methods'],
  breaks: ['searching small design spaces', 'leaked methods'],
  attack_cost: 'tiny',
  patch: ['public methods, secret keys'],
  unlocks: ['open cryptographic standards', 'key management'],
  stage_scenes: ['promise', 'build', 'demo', 'break', 'leak', 'patch', 'next'],
  beats: [
    { id: 'promise', heading: 'Security through obscurity', body: [
      'Every cipher in this arc was broken by someone who knew how it worked. So here is the obvious idea: invent your own method and tell nobody. If Eve doesn\'t know the recipe, how can she possibly undo it?',
    ] },
    { id: 'build', heading: 'Invent a secret recipe', body: [
      'Pick up to three steps. The recipe is the only secret: there is no key.',
    ] },
    { id: 'trust', heading: 'Why it looks good', body: [
      'The output looks like nothing Eve has seen before, and none of the attacks from earlier episodes obviously apply. It feels like an extra layer of protection on top of everything else.',
    ] },
    { id: 'break', heading: 'What if the algorithm is secret?', body: [
      'Two problems. First, home-made methods are built from a small set of familiar ideas: reverse it, shift it, swap things round. Eve can simply try every short recipe. There are about twenty-three thousand of them, and a laptop gets through them in well under a second.',
      'Second, and worse, methods leak. Devices are captured, software is reverse-engineered, people change jobs, documents get photocopied. When a secret method leaks, every message ever sent with it is exposed, and the only fix is to invent and deploy a new method. When a key leaks, you change the key.',
    ] },
    { id: 'patch', heading: 'Only the key should need to be secret', body: [
      'In 1883 Auguste Kerckhoffs wrote that a military cipher must not require secrecy, and that it should be no problem if it falls into enemy hands. Claude Shannon later put it more bluntly: assume the enemy knows the system.',
      'Design the method to be public, studied and attacked by everyone, and put all of the secrecy into a key that is small, random and easy to replace.',
    ] },
    { id: 'reality', heading: 'What real systems do', body: [
      'Every cipher you use today, AES, ChaCha20, the algorithms behind TLS, is completely public. Years of open attack are what earned them trust. Proprietary "secret" ciphers have a long history of being reverse-engineered and broken, often within months of someone looking.',
    ] },
    { id: 'next', heading: 'From letters to bits', body: [
      'That is the end of Arc 1. We have broken small keyspaces, published keys, frequency patterns, repeated keys and secret methods. Next comes the machine age: text as numbers, bits, XOR, and a cipher that is provably unbreakable, if you can bear its rules.',
    ] },
  ],
};

export const defaults = { text: DEFAULT_MESSAGE, recipe: DEFAULT_RECIPE.join(',') };
const parseRecipe = (s) => { const r = String(s || '').split(',').filter((id) => byId[id]).slice(0, 3); return r.length ? r : DEFAULT_RECIPE; };
export const paramsFrom = (s) => ({ text: s.text ?? DEFAULT_MESSAGE, recipe: parseRecipe(s.recipe) });
export const paramsTo = (v) => ({ text: v.text !== DEFAULT_MESSAGE ? v.text : null, recipe: v.recipe.join(',') });

const stageRecipe = (c) => parseRecipe(c.recipe);
const stageMsg = () => DEFAULT_MESSAGE;
const words = (s, n) => s.split(/\s+/).slice(0, n).join(' ');

export const scenes = {
  promise: {
    surface: 'cover-red',
    duration: 3500,
    say: 'What if nobody knew how your cipher worked? Not just the key. The whole method.',
    title: () => 'What if the method were secret?',
    visual: (c) => framed(words(encrypt(stageMsg(), stageRecipe(c)), 2), { small: true }),
    line: () => 'Security through obscurity.',
  },
  build: {
    surface: 'paper',
    duration: 5500,
    say: 'Alice invents her own recipe. Write it backwards. Shift every letter by seven. Swap neighbouring letters. No key. The recipe is the secret.',
    title: () => 'Invent a secret recipe.',
    visual: (c) => specRows([...stageRecipe(c).map((id, i) => [`step ${i + 1}`, byId[id].label]), ['the secret', 'the recipe itself', { hl: true }]]),
    line: () => 'No key at all. The method is the secret.',
  },
  demo: {
    surface: 'paper',
    duration: 5000,
    say: 'Bob knows the recipe, so he runs it backwards. Eve doesn\'t know it. Surely that\'s enough.',
    title: () => 'Bob knows the recipe.',
    visual: (c) => flow([cast('alice'), h('span', { class: 'kh-snip mono' }, words(stageMsg(), 2))],
      keyArrow('↓ secret recipe'),
      [h('span', { class: 'kh-snip coded mono' }, words(encrypt(stageMsg(), stageRecipe(c)), 2)), cast('bob')]),
    line: () => 'Eve doesn\'t. Surely that\'s enough.',
  },
  break: {
    surface: 'ink',
    duration: 6000,
    say: 'Home-made recipes are built from the same few ideas. Reverse it. Shift it. Swap things round. So Eve tries every short recipe. Twenty-three thousand of them, in under a second.',
    eyebrow: () => cast('eve', 'eve tries every short recipe'),
    title: () => 'Home-made recipes are small.',
    visual: (c) => {
      const r = searchRecipes(encrypt(stageMsg(), stageRecipe(c)));
      return specRows([
        ['recipes tried', r.tried.toLocaleString('en-GB')],
        ['time', 'under a second'],
        ['reads', words(r.text, 3) + '…', { hl: true }],
      ]);
    },
    line: () => 'A secret recipe is a tiny keyspace in disguise.',
  },
  leak: {
    surface: 'ink',
    duration: 6000,
    say: 'And recipes leak. Devices get captured, software gets taken apart, people change jobs. When a method leaks, every message ever sent is exposed. When a key leaks, you just change the key.',
    eyebrow: () => cast('eve', 'eve gets hold of the recipe'),
    title: () => 'Then the recipe leaks.',
    visual: () => specRows([
      ['method leaks', 'every message ever sent is exposed'],
      ['key leaks', 'change the key and carry on', { hl: true }],
    ]),
    line: () => 'Secrets that are hard to change make bad secrets.',
  },
  patch: {
    surface: 'paper',
    duration: 5500,
    say: 'Kerckhoffs said it in eighteen eighty-three. A cipher should stay secure even if the enemy knows exactly how it works. Make the method public. Keep only the key secret.',
    title: () => 'Only the key should need to be secret.',
    visual: () => specRows([
      ['1883', 'Kerckhoffs: the method may fall into enemy hands'],
      ['1949', 'Shannon: assume the enemy knows the system'],
      ['today', 'public algorithms, secret keys', { hl: true }],
    ]),
    line: () => 'Public method. Secret key. Easy to change.',
  },
  next: {
    surface: 'cover-ink',
    duration: 4500,
    say: 'That\'s arc one. Every pen-and-paper cipher, broken. Next, the machine age. Letters become numbers, numbers become bits, and things get interesting.',
    title: () => 'From letters to bits.',
    visual: () => framed('01001000', { small: true }),
    line: () => 'Next: Arc 2, bits, XOR and perfect secrecy.',
  },
};

export const widgets = {
  build(store) {
    const area = h('input', { type: 'text', id: 'kh-text', spellcheck: 'false', autocomplete: 'off', onInput: (e) => store.set({ text: e.target.value }) });
    const pickers = [0, 1, 2].map((i) => h('select', { id: `kh-step-${i}`, 'aria-label': `step ${i + 1}`, onChange: () => {
      const r = pickers.map((p) => p.value).filter(Boolean);
      store.set({ recipe: r.length ? r : ['shift1'] });
    } }, i ? h('option', { value: '' }, '(none)') : null, STEPS.map((s) => h('option', { value: s.id }, s.label))));
    const out = h('div', { class: 'term', 'aria-live': 'polite' });
    store.subscribe(({ text, recipe }) => {
      if (area.value !== text) area.value = text;
      pickers.forEach((p, i) => { p.value = recipe[i] ?? ''; });
      out.replaceChildren(h('div', { class: 'cmt' }, `# ${recipe.map((id) => byId[id].label).join(', then ')}`), h('div', { class: 'out' }, encrypt(text, recipe) || ' '));
    });
    return h('div', { class: 'demo' },
      h('div', { class: 'field', style: { 'margin-bottom': '12px' } }, h('label', { for: 'kh-text' }, 'message'), area),
      h('div', { class: 'demo-row' }, pickers.map((p, i) => h('div', { class: 'field' }, h('label', { for: p.id }, `step ${i + 1}`), p))),
      out);
  },

  break(store) {
    const panel = h('div', { class: 'attacker on-ink', hidden: true, 'aria-live': 'polite' });
    const button = h('button', { type: 'button', class: 'btn break-it', onClick: () => { panel.hidden = false; button.textContent = 'Break it again'; render(store.get()); } }, 'Break it');
    let job = 0;
    function render({ text, recipe }) {
      if (panel.hidden) return;
      const run = ++job;
      const ct = encrypt(text, recipe);
      panel.replaceChildren(
        h('div', { class: 'attacker-head' }, cast('eve'), h('span', { class: 'sees' }, 'eve sees: ', h('b', {}, ct))),
        h('p', { class: 'muted' }, 'trying every recipe of up to three steps…'));
      setTimeout(() => {
        if (run !== job) return;
        const t0 = performance.now();
        const r = searchRecipes(ct);
        const ms = Math.round(performance.now() - t0);
        const same = r.text === text;
        panel.replaceChildren(
          h('div', { class: 'attacker-head' }, cast('eve'), h('span', { class: 'sees' }, 'eve sees: ', h('b', {}, ct))),
          h('p', { class: 'verdict' }, `${r.tried.toLocaleString('en-GB')} recipes tried in `, h('span', { class: 'hl' }, `${ms} ms`), '.'),
          h('p', { class: 'guess mono solved' }, r.text),
          h('p', { class: 'muted' }, same
            ? `Recipe found: ${r.recipe.map((id) => byId[id].label).join(', then ')}${r.recipe.join() !== recipe.join() ? ' (a different recipe that does the same thing: just as good)' : ''}.`
            : 'Not the exact text this time: short messages give the English scorer less to go on. A few more intercepted messages and the recipe is pinned down.'),
          attackMeter('tiny', 'a home-made method is a small, guessable keyspace · and if it leaks, it can\'t be changed'));
      }, 30);
    }
    store.subscribe(render);
    return h('div', {}, button, panel);
  },
};
