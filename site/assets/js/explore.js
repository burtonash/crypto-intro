// Explore Mode (PRD §7.1): the seven-beat lesson page, generated from the
// lesson's metadata. Interactive widgets plug into beats by id and share one
// small store, so the Break beat attacks whatever the Build beat produced.
import { h } from './dom.js';
import { writeState, stageUrl } from './state.js';

export function createStore(initial) {
  let value = { ...initial };
  const subs = new Set();
  return {
    get: () => value,
    set(patch) { value = { ...value, ...patch }; subs.forEach((f) => f(value)); },
    subscribe(f) { subs.add(f); f(value); return () => subs.delete(f); },
  };
}

const ROOT = '../../';

function siteNav() {
  const plate = h('a', { class: 'plate', href: `${ROOT}about.html`, 'aria-label': 'about ash — unit spec sheet' },
    [...'burton'].map((c) => h('span', {}, c)), [...'ash'].map((c) => h('span', { class: 'a' }, c)));
  return h('nav', {}, h('div', { class: 'wrap' },
    h('a', { class: 'brand', href: `${ROOT}index.html` }, 'ash:~$', h('span', { class: 'cursor' })),
    h('span', { class: 'links' },
      h('a', { href: `${ROOT}index.html` }, 'logbook'),
      h('a', { href: `${ROOT}index.html#labs`, 'aria-current': 'page' }, 'labs'),
      h('a', { href: `${ROOT}index.html#radio` }, 'radio'),
      h('a', { href: `${ROOT}about.html` }, 'about'),
      plate)));
}

function siteFooter() {
  return h('footer', {}, h('div', { class: 'wrap' },
    h('span', {}, h('span', { class: 'ph' }, 'ash:~$'), ' ', h('span', { class: 'mut' }, 'logout')),
    h('span', { class: 'mut' }, 'set in ibm plex · maynard, in spirit')));
}

export function runExplore(lesson, state) {
  const { meta, widgets = {} } = lesson;
  document.title = `${meta.title} — build → break · burtonash`;
  document.body.className = 'explore-body';

  const store = createStore(lesson.paramsFrom(state));
  // Keep the URL in step with the demo so any state can be shared or opened on Stage.
  store.subscribe((v) => writeState(lesson.paramsTo(v)));

  // The tour picks the frame that suits the screen it's watched on.
  const tourLink = h('a', { class: 'btn', href: '?tour=1',
    onClick: (e) => { e.preventDefault(); location.href = `?tour=1&ratio=${innerWidth > innerHeight ? 'wide' : 'vertical'}`; } },
  '▶ Take the tour');
  const stageLink = h('a', { class: 'btn-ghost', href: '#' }, 'Open Stage Mode');
  store.subscribe((v) => { stageLink.href = stageUrl(lesson.paramsTo(v)); });

  const ep = String(meta.episode).padStart(2, '0');
  const beats = meta.beats.map((b, i) => h('section', { class: `beat beat-${b.id}`, id: b.id, 'aria-labelledby': `${b.id}-h` },
    h('p', { class: 'eyebrow' }, `${String(i + 1).padStart(2, '0')} · ${b.id}`),
    h('h2', { id: `${b.id}-h` }, b.heading),
    b.body.map((p) => h('p', { class: 'beat-copy' }, p)),
    widgets[b.id] ? widgets[b.id](store) : null));

  document.body.replaceChildren(
    h('a', { class: 'skip', href: '#main' }, 'Skip to lesson'),
    siteNav(),
    h('main', { id: 'main' },
      h('div', { class: 'wrap hero' },
        h('p', { class: 'eyebrow' }, `// labs · arc ${meta.arc} · episode ${ep}`),
        h('h1', {}, meta.title),
        h('p', { class: 'lede' }, meta.promise),
        h('div', { class: 'hero-actions' }, tourLink, stageLink,
          h('a', { class: 'btn-ghost', href: '#break' }, 'Skip to the break'))),
      h('div', { class: 'wrap beats' }, beats)),
    siteFooter(),
  );
}
