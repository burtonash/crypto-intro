// Tour voiceover: static audio files that ship with the lesson. Nothing here
// talks to a speech service. tools/voiceover.mjs renders the files ahead of
// time into lessons/<slug>/voice/ alongside a manifest.json.

const LEAD_IN = 400;   // let the scene land before the voice starts
const TAIL = 900;      // breathing room after the line ends

export async function loadVoice(lesson) {
  const silent = { available: false, stale: [], durationOf: () => 0, start() {}, pause() {}, resume() {}, stop() {}, muted: false, setMuted() {} };
  let manifest;
  try {
    const res = await fetch(new URL('voice/manifest.json', location.href), { cache: 'no-cache' });
    if (!res.ok) return silent;
    manifest = await res.json();
  } catch { return silent; }

  const ids = lesson.meta.stage_scenes;
  const audios = {};
  const durations = {};
  await Promise.all(ids.filter((id) => manifest.scenes?.[id]?.file).map((id) => new Promise((resolve) => {
    const a = new Audio(new URL(`voice/${manifest.scenes[id].file}`, location.href));
    a.preload = 'auto';
    const done = () => { if (Number.isFinite(a.duration)) { audios[id] = a; durations[id] = a.duration * 1000; } resolve(); };
    a.addEventListener('loadedmetadata', done, { once: true });
    a.addEventListener('error', () => resolve(), { once: true });
    setTimeout(resolve, 8000);
  })));
  if (!Object.keys(audios).length) return silent;

  // A line is stale if the narration in lesson.js changed after the audio was rendered.
  const stale = ids.filter((id) => !audios[id] || manifest.scenes[id].text !== lesson.scenes[id].say);

  let current = null;
  let currentId = null;
  let leadTimer = null;
  let muted = false;

  const voice = {
    available: true,
    stale,
    manifest,
    durationOf: (id) => (durations[id] ? LEAD_IN + durations[id] + TAIL : 0),
    start(id) {
      voice.stop();
      current = audios[id] || null;
      currentId = id;
      if (!current) return;
      current.currentTime = 0;
      current.muted = muted;
      leadTimer = setTimeout(() => { leadTimer = null; current?.play().catch(() => {}); }, LEAD_IN);
    },
    pause() {
      if (leadTimer) { clearTimeout(leadTimer); leadTimer = null; current = null; currentId = null; return; }
      current?.pause();
    },
    resume(id) {
      if (current && currentId === id && current.currentTime > 0 && !current.ended) current.play().catch(() => {});
      else voice.start(id);
    },
    stop() {
      clearTimeout(leadTimer); leadTimer = null;
      if (current) { current.pause(); current.currentTime = 0; }
      current = null; currentId = null;
    },
    get muted() { return muted; },
    setMuted(m) { muted = m; if (current) current.muted = m; },
  };
  return voice;
}
