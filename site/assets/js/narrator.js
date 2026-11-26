// Tour narration. For each scene, in order of preference:
//   1. recorded  — static audio from lessons/<slug>/voice/ (see tools/voiceover.mjs),
//                  used only if it was rendered from the current text
//   2. speech    — the browser's own text-to-speech, if the viewer turns read-aloud on
//   3. captions  — text only
// Captions show in every case. Nothing here calls a remote speech service.

const LEAD_IN = 400;        // let the scene land before the voice starts
const TAIL = 900;           // breathing room after the line
const CHARS_PER_SEC = 14;   // speaking-rate estimate for speech and captions-only scenes
const PREF_KEY = 'buildbreak.readAloud';

export function sentences(text) {
  return (text.match(/[^.?!]+[.?!]+["')]*|[^.?!]+$/g) || [text]).map((s) => s.trim()).filter(Boolean);
}

export async function createNarrator(lesson, { onCaption = () => {} } = {}) {
  const ids = lesson.meta.stage_scenes;
  const lines = Object.fromEntries(ids.map((id) => [id, lesson.scenes[id].say || '']));
  const recorded = await loadRecordings(lesson, lines);
  const speechOK = await hasVoices();

  let readAloud = speechOK && localStorage.getItem(PREF_KEY) === '1';
  let muted = false;
  let current = null; // { id, mode, audio?, sentence, done(), finished: Promise }

  const modeOf = (id) => (recorded.audios[id] ? 'recorded' : readAloud ? 'speech' : 'captions');
  const estimate = (id) => (lines[id].length / CHARS_PER_SEC) * 1000;

  function caption(id, active) { onCaption({ id, sentences: sentences(lines[id]), active, mode: modeOf(id) }); }

  function stop() {
    if (!current) return;
    current.cancelled = true;
    clearTimeout(current.lead);
    if (current.audio) { current.audio.pause(); current.audio.currentTime = 0; current.audio.ontimeupdate = null; }
    if (current.mode === 'speech') speechSynthesis.cancel();
    current.done();
    current = null;
  }

  function start(id, fromSentence = 0) {
    stop();
    let done;
    const finished = new Promise((r) => { done = r; });
    const c = current = { id, mode: modeOf(id), sentence: fromSentence, done, finished, cancelled: false };
    caption(id, c.mode === 'captions' ? -1 : fromSentence);
    if (!lines[id] || c.mode === 'captions') { done(); return; }

    c.lead = setTimeout(() => {
      if (c.cancelled) return;
      if (c.mode === 'recorded') playRecorded(c); else speakFrom(c, c.sentence);
    }, fromSentence ? 0 : LEAD_IN);
  }

  function playRecorded(c) {
    const a = c.audio = recorded.audios[c.id];
    const timing = recorded.sentences[c.id];
    a.muted = muted;
    a.ontimeupdate = () => {
      const i = timing.findIndex((s) => a.currentTime < s.end);
      const idx = i === -1 ? timing.length - 1 : i;
      if (idx !== c.sentence) { c.sentence = idx; caption(c.id, idx); }
    };
    a.onended = () => c.done();
    a.play().catch(() => c.done());
  }

  // One utterance per sentence: more reliable than pausing a long utterance,
  // and it tells us which sentence to highlight.
  function speakFrom(c, i) {
    const parts = sentences(lines[c.id]);
    if (c.cancelled) return;
    if (i >= parts.length) { c.done(); return; }
    c.sentence = i;
    caption(c.id, i);
    const u = new SpeechSynthesisUtterance(parts[i]);
    const v = pickVoice();
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-GB';
    u.rate = 1;
    // Some browsers never fire 'end' (no voices installed, tab backgrounded):
    // never let one sentence hold the tour for longer than twice its estimate.
    let moved = false;
    const next = () => { if (moved) return; moved = true; clearTimeout(guard); if (!c.cancelled && current === c) speakFrom(c, i + 1); };
    const guard = setTimeout(next, (parts[i].length / CHARS_PER_SEC) * 2000 + 3000);
    u.onend = next;
    u.onerror = next;
    speechSynthesis.speak(u);
  }

  return {
    status: { recorded: Object.keys(recorded.audios).length, total: ids.length, stale: recorded.stale, speechOK },
    get readAloud() { return readAloud; },
    setReadAloud(on) {
      readAloud = speechOK && on;
      localStorage.setItem(PREF_KEY, readAloud ? '1' : '0');
      if (current && current.mode !== 'recorded') { const { id, sentence } = current; start(id, Math.max(0, sentence)); }
    },
    get muted() { return muted; },
    setMuted(m) { muted = m; if (current?.audio) current.audio.muted = m; },
    modeOf,
    /** How long a scene needs for its narration, lead-in and tail included. */
    durationOf(id) {
      if (!lines[id]) return 0;
      const body = recorded.durations[id] ?? estimate(id);
      return LEAD_IN + body + TAIL;
    },
    /** Autoplay waits on this if browser speech runs longer than estimated. */
    gate(id) { return current?.id === id && current.mode === 'speech' ? current.finished : null; },
    start,
    pause() {
      if (!current) return;
      clearTimeout(current.lead);
      if (current.mode === 'recorded') current.audio?.pause();
      if (current.mode === 'speech') { current.cancelled = true; speechSynthesis.cancel(); }
    },
    resume(id) {
      if (!current || current.id !== id) return start(id);
      if (current.mode === 'recorded' && current.audio && current.audio.currentTime > 0 && !current.audio.ended) {
        current.audio.play().catch(() => {});
      } else if (current.mode === 'speech') {
        const { sentence } = current;
        const prev = current; current = null; prev.done();
        start(id, Math.max(0, sentence)); // resume from the start of the interrupted sentence
      } else start(id);
    },
    stop,
    show(id) { caption(id, -1); },
  };
}

// Only offer read-aloud if the browser actually has a voice to read with.
// Voice lists load asynchronously, so give them a moment.
async function hasVoices() {
  if (typeof speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') return false;
  if (speechSynthesis.getVoices().length) return true;
  await new Promise((r) => {
    const t = setTimeout(r, 1200);
    speechSynthesis.addEventListener?.('voiceschanged', () => { clearTimeout(t); r(); }, { once: true });
  });
  return speechSynthesis.getVoices().length > 0;
}

let chosenVoice;
function pickVoice() {
  if (chosenVoice !== undefined) return chosenVoice;
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null; // not loaded yet; try again next sentence
  chosenVoice = voices.find((v) => v.lang === 'en-GB' && v.localService)
    || voices.find((v) => v.lang === 'en-GB')
    || voices.find((v) => v.lang?.startsWith('en')) || null;
  return chosenVoice;
}

async function loadRecordings(lesson, lines) {
  const empty = { audios: {}, durations: {}, sentences: {}, stale: [] };
  let manifest;
  try {
    const res = await fetch(new URL('voice/manifest.json', location.href), { cache: 'no-cache' });
    if (!res.ok) return empty;
    manifest = await res.json();
  } catch { return empty; }

  const out = { ...empty, stale: [] };
  await Promise.all(Object.keys(lines).map((id) => new Promise((resolve) => {
    const entry = manifest.scenes?.[id];
    if (!entry?.file) return resolve();
    // Audio rendered from older text is not used: browser speech reads the current line instead.
    if (entry.text !== lines[id]) { out.stale.push(id); return resolve(); }
    const a = new Audio(new URL(`voice/${entry.file}`, location.href));
    a.preload = 'auto';
    a.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(a.duration)) {
        out.audios[id] = a;
        out.durations[id] = a.duration * 1000;
        out.sentences[id] = entry.sentences || proportional(lines[id], a.duration);
      }
      resolve();
    }, { once: true });
    a.addEventListener('error', () => resolve(), { once: true });
    setTimeout(resolve, 8000);
  })));
  return out;
}

function proportional(text, duration) {
  const parts = sentences(text);
  const total = parts.reduce((n, p) => n + p.length, 0);
  let t = 0;
  return parts.map((p) => { const d = (p.length / total) * duration; const s = { text: p, start: t, end: t + d }; t += d; return s; });
}
