// Labs index: the whole ladder, generated from lessons/ladder.js, plus the
// "things we have broken so far" tracker (FR-E5) from live lessons' metadata.
import { h } from './dom.js';
import { siteNav, siteFooter } from './explore.js';
import { arcs, episodes } from '../../lessons/ladder.js';

export async function runLabs() {
  document.body.className = 'explore-body labs-body';
  const live = episodes.filter((e) => e.live);
  const metas = await Promise.all(live.map((e) => import(`../../lessons/${e.slug}/lesson.js`).then((m) => m.meta).catch(() => null)));
  const broken = [...new Set(metas.filter(Boolean).flatMap((m) => m.breaks))];

  const row = (e) => h('tr', { class: e.live ? 'live' : '' },
    h('td', { class: 'n' }, String(e.n).padStart(2, '0')),
    h('td', {}, e.live ? h('a', { href: `${e.slug}/` }, e.build) : e.build, e.live ? h('span', { class: 'tag tag-live' }, 'live') : null),
    h('td', {}, e.break),
    h('td', {}, e.lesson));

  document.body.replaceChildren(
    h('a', { class: 'skip', href: '#main' }, 'Skip to the ladder'),
    siteNav('../'),
    h('main', { id: 'main' },
      h('div', { class: 'wrap hero' },
        h('p', { class: 'eyebrow' }, '// labs · build → break'),
        h('h1', {}, 'Build tiny crypto. Break tiny crypto.'),
        h('p', { class: 'lede' }, `Learn why real crypto looks the way it does. ${episodes.length} episodes in ${arcs.length} arcs: each one builds a toy, attacks it, and shows what the real thing does instead.`),
        h('p', { class: 'progress mono' }, `${live.length} of ${episodes.length} episodes live`)),
      h('div', { class: 'wrap' },
        h('section', { class: 'broken', 'aria-labelledby': 'broken-h' },
          h('h2', { id: 'broken-h' }, 'Things we have broken so far'),
          broken.length ? h('ul', { class: 'broken-list' }, broken.map((b) => h('li', { class: 'tag tag-crypto' }, b))) : h('p', {}, 'Nothing yet.'))),
      h('div', { class: 'wrap arcs' }, arcs.map((a) => h('section', { class: 'arc', id: `arc-${a.n}`, 'aria-labelledby': `arc-${a.n}-h` },
        h('p', { class: 'eyebrow' }, `arc ${a.n}`),
        h('h2', { id: `arc-${a.n}-h` }, a.title),
        h('p', { class: 'thesis' }, a.thesis),
        h('div', { class: 'table-wrap' }, h('table', { class: 'ladder' },
          h('thead', {}, h('tr', {}, ['ep', 'build', 'break', 'lesson'].map((c) => h('th', { scope: 'col' }, c)))),
          h('tbody', {}, a.episodes.map(row)))))))),
    siteFooter());
}
