// Stage Mode (PRD §7.2–7.4). Each frame renders at its true pixel size
// (1080×1920, 1080×1080 or 1920×1080) and is scaled to fit the window, so a
// recording is identical whatever size the browser happens to be.
import { h } from './dom.js';
import { SceneStepper } from './scenes.js';
import { RATIOS, writeState } from './state.js';
import { registerProgress, tileMark } from './components.js';
import { createNarrator } from './narrator.js';

export async function runStage(lesson, state) {
  const { meta, scenes } = lesson;
  const tour = state.tour;
  // The tour always uses the lesson's default message: the narration is written for it.
  if (tour) state = { ...state, ...lesson.defaults };
  const ids = meta.stage_scenes;
  document.title = `${meta.title} — ${tour ? 'tour' : 'stage'}`;
  document.body.className = 'stage-body';
  if (state.still || matchMedia('(prefers-reduced-motion: reduce)').matches) document.body.classList.add('still');

  const frame = h('div', { class: 'stage-frame', role: 'region', 'aria-live': 'polite' });
  const scaler = h('div', { class: 'stage-scaler' }, frame);
  const hud = h('div', { class: 'stage-hud mono' });
  // Captions sit under the frame, outside it, so a cropped recording stays clean.
  const captionEl = h('div', { class: 'stage-caption', 'aria-live': 'polite', hidden: !tour });
  document.body.replaceChildren(h('main', { class: 'stage-viewport' }, scaler), captionEl, hud);
  const voice = tour ? await createNarrator(lesson, { onCaption: renderCaption }) : null;

  function renderCaption({ sentences, active, mode }) {
    captionEl.dataset.mode = mode;
    captionEl.replaceChildren(h('p', {}, sentences.map((s, i) =>
      h('span', { class: active === -1 || i === active ? 'on' : i < active ? 'said' : '' }, s, ' '))));
  }

  let ratio = state.ratio;
  let showHud = state.hud;
  let guides = state.guides;
  let toast = '';
  let toastTimer;

  const ctx = () => ({ ...state, ratio });

  const stepper = new SceneStepper(ids, {
    start: Math.max(0, ids.indexOf(state.scene)),
    durationOf: (id) => Math.max(scenes[id].duration ?? 4000, voice?.durationOf(id) ?? 0),
    gate: (id) => voice?.gate(id),
    onChange: (id) => {
      renderScene(); writeState({ scene: id });
      if (!voice) return;
      if (stepper.playing) voice.start(id); else { voice.stop(); voice.show(id); }
    },
    onState: () => renderHud(),
  });

  function renderScene() {
    const id = stepper.id;
    const s = scenes[id];
    const c = ctx();
    const cover = s.surface.startsWith('cover');
    const onInk = s.surface === 'ink' || s.surface === 'cover-ink';
    const title = s.title(c);

    frame.className = `stage-frame surface-${s.surface}${onInk ? ' on-ink' : ''}${guides ? ' show-guides' : ''}`;
    frame.dataset.ratio = ratio;
    frame.dataset.scene = id;
    frame.style.width = `${RATIOS[ratio].w}px`;
    frame.style.height = `${RATIOS[ratio].h}px`;
    frame.setAttribute('aria-label', `${meta.title}, scene ${stepper.index + 1} of ${ids.length}: ${title}`);

    frame.replaceChildren(
      h('div', { class: 'band band-top' },
        h('span', { class: 'band-label' }, `arc ${meta.arc} · ep ${String(meta.episode).padStart(2, '0')} · ${meta.title.toLowerCase()}`),
        cover ? null : registerProgress(ids.length, stepper.index)),
      h('div', { class: 'safe' },
        s.eyebrow ? h('p', { class: 'st-eyebrow' }, s.eyebrow(c)) : null,
        h('h1', { class: 'st-title' }, title),
        h('div', { class: 'st-visual' }, s.visual(c)),
        s.line ? h('p', { class: 'st-line' }, s.line(c)) : null),
      h('div', { class: 'band band-bottom' }, cover ? tileMark(s.surface === 'cover-red' ? 'ink' : 'red') : null),
      h('div', { class: 'guides', 'aria-hidden': 'true' }, h('span'), h('span')),
    );
    fit();
    renderHud();
  }

  function renderHud() {
    hud.hidden = !showHud;
    if (!showHud) return;
    const btn = (label, on, pressed) => h('button', { type: 'button', onClick: on, 'aria-pressed': pressed == null ? null : String(pressed) }, label);
    hud.replaceChildren(
      h('span', { class: 'hud-status' },
        `${stepper.index + 1}/${ids.length} ${stepper.id}`,
        h('span', { class: 'hud-play' }, stepper.playing ? ' ▶ playing' : ' ❚❚')),
      h('span', { class: 'hud-group' },
        btn('←', () => stepper.prev()),
        btn(stepper.playing ? 'pause' : 'play', togglePlay),
        btn('→', () => stepper.next())),
      h('span', { class: 'hud-group' },
        Object.entries(RATIOS).map(([k, r]) => btn(`${k} ${r.label}`, () => setRatio(k), k === ratio))),
      h('span', { class: 'hud-group' },
        btn('guides', () => { guides = !guides; writeState({ guides }); renderScene(); }, guides),
        tour && voice.status.speechOK ? btn('read aloud', toggleReadAloud, voice.readAloud) : null,
        tour && voice.status.recorded ? btn(voice.muted ? 'unmute' : 'mute', toggleMute, voice.muted) : null,
        h('a', { href: exploreHref() }, tour ? 'exit tour' : 'exit stage')),
      h('span', { class: 'hud-keys' }, toast || voiceStatus() || `← → scene · space play · r reset · c copy title · g guides · h hide hud · 1 2 3 ratio${tour ? ' · v read aloud · m mute' : ''}`),
    );
    fit();
  }

  function exploreHref() {
    const q = new URLSearchParams(location.search);
    for (const k of ['stage', 'tour', 'ratio', 'scene', 'still', 'hud', 'guides']) q.delete(k);
    const s = q.toString();
    return location.pathname + (s ? `?${s}` : '');
  }

  // Pausing autoplay also freezes the current scene's animations mid-move.
  function togglePlay() {
    stepper.toggle();
    frame.classList.toggle('paused', !stepper.playing);
    if (stepper.playing) voice?.resume(stepper.id); else voice?.pause();
    renderHud();
  }

  function toggleMute() { voice.setMuted(!voice.muted); renderHud(); }
  function toggleReadAloud() { voice.setReadAloud(!voice.readAloud); renderHud(); }

  function voiceStatus() {
    if (!tour) return '';
    const { recorded, total, stale, speechOK } = voice.status;
    const rest = total - recorded;
    const parts = [`tour · recorded voice ${recorded}/${total}`];
    if (rest) parts.push(voice.readAloud ? `browser speech for the other ${rest}` : speechOK ? 'captions only for the rest (v to read aloud)' : 'captions only for the rest');
    if (stale.length) parts.push(`out of date: ${stale.join(', ')}`);
    return parts.join(' · ');
  }

  // Browsers only play sound after a click or key press, so the tour waits for one.
  function showStart() {
    const { recorded, total, speechOK } = voice.status;
    const go = (aloud) => {
      if (aloud != null) voice.setReadAloud(aloud);
      cover.remove(); removeEventListener('keydown', key, true);
      stepper.go(0); togglePlay(); renderHud();
    };
    const key = (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopImmediatePropagation(); go(null); } };
    const needsSpeech = recorded < total && speechOK;
    const cover = h('div', { class: 'tour-start' },
      h('div', { class: 'tour-buttons' },
        needsSpeech ? h('button', { type: 'button', class: 'tour-go', onClick: () => go(true) }, '▶ start, read aloud') : null,
        h('button', { type: 'button', class: needsSpeech ? 'tour-go ghost' : 'tour-go', onClick: () => go(needsSpeech ? false : null) },
          needsSpeech ? '▶ start, captions only' : '▶ start the tour')),
      h('p', {}, recorded === total ? 'sound on · recorded narration' : recorded ? `recorded narration for ${recorded} of ${total} scenes` : 'captions on screen · read-aloud uses your browser\'s voice'));
    document.querySelector('.stage-viewport').append(cover);
    addEventListener('keydown', key, true);
    cover.querySelector('button').focus();
  }

  function setRatio(k) { ratio = k; writeState({ ratio: k }); renderScene(); }

  function fit() {
    const { w, h: fh } = RATIOS[ratio];
    const hudH = (showHud ? hud.offsetHeight : 0) + (captionEl.hidden ? 0 : captionEl.offsetHeight);
    const pad = 16;
    const scale = Math.min((innerWidth - pad * 2) / w, (innerHeight - hudH - pad * 2) / fh);
    frame.style.transform = `scale(${scale})`;
    scaler.style.width = `${w * scale}px`;
    scaler.style.height = `${fh * scale}px`;
  }

  function say(msg) {
    toast = msg; renderHud();
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast = ''; renderHud(); }, 1800);
  }

  addEventListener('resize', fit);
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if ((k === ' ' || k === 'enter') && e.target.closest?.('button, a')) return; // let the focused control handle it
    if (k === 'arrowright') stepper.next();
    else if (k === 'arrowleft') stepper.prev();
    else if (k === ' ') togglePlay();
    else if (k === 'r') { stepper.reset(); voice?.stop(); renderScene(); }
    else if (k === 'm' && tour) toggleMute();
    else if (k === 'v' && tour && voice.status.speechOK) toggleReadAloud();
    else if (k === 'c') {
      const t = scenes[stepper.id].title(ctx());
      navigator.clipboard?.writeText(t).then(() => say(`copied: ${t}`), () => say('copy failed: clipboard needs localhost or https'));
    }
    else if (k === 'g') { guides = !guides; writeState({ guides }); renderScene(); }
    else if (k === 'h') { showHud = !showHud; writeState({ hud: showHud ? null : '0' }); renderHud(); fit(); }
    else if (['1', '2', '3'].includes(k)) setRatio(Object.keys(RATIOS)[Number(k) - 1]);
    else return;
    e.preventDefault();
  });

  renderScene();
  if (tour) { voice.show(stepper.id); showStart(); }
  return stepper;
}
