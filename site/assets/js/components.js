// Shared demo components (PRD §7.5), rendered identically in Explore and Stage.
// Size and surface come from CSS custom properties on the container.
import { h } from './dom.js';

/** A row of letter tiles. kind: plain | public | secret | ink | red. Spaces become gaps. */
export function tiles(text, kind = 'plain', { stagger = false, label } = {}) {
  return h('span', { class: 'tiles', role: 'img', 'aria-label': label || text },
    Array.from(text, (ch, i) => h('span', {
      class: `tile ${ch === ' ' ? 't-gap' : 't-' + kind}`,
      'aria-hidden': 'true',
      style: stagger ? { '--i': i } : null,
    }, ch === ' ' ? '' : ch)));
}

const SHAPES = {
  alice: () => h('circle', { cx: 22, cy: 22, r: 22, fill: 'var(--cast-alice)' }),
  bob: () => h('rect', { x: 1, y: 1, width: 42, height: 42, fill: 'var(--cast-bob)' }),
  eve: () => h('polygon', { points: '22,0 44,42 0,42', fill: 'var(--cast-eve)' }),
};
const INITIAL = { alice: ['a', 29, 'var(--on-alice)'], bob: ['b', 29, 'var(--on-bob)'], eve: ['e', 37, 'var(--on-eve)'] };

/** A cast member: shape + initial + optional name beside it, in ink (never in the cast colour). */
export function cast(role, label = role) {
  const [ch, y, fill] = INITIAL[role];
  return h('span', { class: `cast cast-${role}` },
    h('svg', { viewBox: '-1 -1 46 46', 'aria-hidden': 'true' },
      SHAPES[role](),
      h('text', { x: 22, y, 'text-anchor': 'middle', 'font-size': 20, fill }, ch)),
    label ? h('span', { class: 'cast-label' }, label) : null);
}

export const COST_LEVELS = ['tiny', 'small', 'big', 'astronomical'];

/** AttackMeter: Tiny / Small / Big / Astronomical with one segment lit. */
export function attackMeter(level, caption) {
  return h('div', { class: 'meter-wrap' },
    h('div', { class: 'meter', role: 'img', 'aria-label': `attack cost: ${level}` },
      COST_LEVELS.map((l) => h('span', { class: `meter-seg${l === level ? ' on' : ''}` }, l))),
    caption ? h('p', { class: 'meter-caption mono' }, caption) : null);
}

/** Register bar used as a progress indicator: one segment per scene. */
export function registerProgress(count, current) {
  return h('div', { class: 'register', role: 'progressbar', 'aria-valuemin': 1, 'aria-valuemax': count, 'aria-valuenow': current + 1 },
    Array.from({ length: count }, (_, i) => h('span', { class: i < current ? 'done' : i === current ? 'now' : '' })));
}

/** The ash tile mark (3 tiles). colourway: ink | red */
export function tileMark(colourway = 'ink') {
  return h('span', { class: `mark mark-${colourway}`, 'aria-label': 'ash' },
    ['a', 's', 'h'].map((c) => h('span', { 'aria-hidden': 'true' }, c)));
}

// ---- Stage scene kit: the recurring visuals, so lessons only write what's new ----

/** Paper-bordered ink panel: the cover recipe's "one framed image". */
export const framed = (content, { small = false } = {}) => h('div', { class: `framed st-pop${small ? ' st-small' : ''}` }, content);

/** A muted arrow label between rows, e.g. "↓ shift +3". */
export const keyArrow = (text) => h('div', { class: 'st-key mono' }, text);

/** Sender → message → receiver. rows: [node, node, ...] stacked (vertical) or wrapped in rows (square/wide). */
export const flow = (...rows) => h('div', { class: 'st-flow' }, rows.map((r) => (Array.isArray(r) ? h('div', { class: 'st-party' }, r) : r)));

/** Brute-force grid: every candidate fades in, then the hit lights up. items: [{ key, text, best }] */
export const triesGrid = (items, label = 'every candidate', { cols } = {}) => h('ol', { class: `st-tries mono${cols ? ` cols-${cols}` : ''}`, 'aria-label': label },
  items.map((t, i) => h('li', { class: t.best ? 'best' : '', style: { '--i': i } }, h('span', { class: 'k' }, t.key), t.text)));

/** Toy vs real: two labelled attack meters. */
export const meterPair = ([nameA, levelA], [nameB, levelB]) => h('div', { class: 'st-meters' },
  h('div', {}, h('p', { class: 'st-meter-name mono' }, nameA), attackMeter(levelA)),
  h('div', {}, h('p', { class: 'st-meter-name mono' }, nameB), attackMeter(levelB)));

/** Labelled rows at Stage scale: [[label, value, { hl }], ...]. Rows rise in one by one. */
export const specRows = (rows) => h('dl', { class: 'st-rows' },
  rows.map(([k, v, o = {}], i) => h('div', { class: `st-row${o.hl ? ' hl' : ''}`, style: { '--i': i } }, h('dt', { class: 'mono' }, k), h('dd', { class: 'mono' }, v))));

/** Frequency bars: [{ label, value, note }]. Bars grow in one by one; note is shown at the end (e.g. "→ E"). */
export const freqBars = (items, { label = 'letter frequencies' } = {}) => {
  const max = Math.max(1, ...items.map((i) => i.value));
  return h('ol', { class: 'freq', 'aria-label': label },
    items.map((it, i) => h('li', { style: { '--i': i, '--v': it.value / max }, class: it.hl ? 'hl' : '' },
      h('span', { class: 'freq-k mono' }, it.label),
      h('span', { class: 'freq-bar' }, h('span', {})),
      h('span', { class: 'freq-n mono' }, it.note ?? String(it.value)))));
};
