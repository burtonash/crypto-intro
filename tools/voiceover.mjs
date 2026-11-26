#!/usr/bin/env node
// Tour voiceover pipeline. Narration lives in each lesson's scenes (`say`);
// this tool turns it into static audio that is committed and deployed with
// the site. The browser only ever plays files: it never calls a speech API.
//
//   node tools/voiceover.mjs caesar script     write voice/script.md (lines to record)
//   node tools/voiceover.mjs caesar render     render with the ElevenLabs API
//   node tools/voiceover.mjs caesar manifest   index MP3s you made elsewhere
//
// render needs ELEVENLABS_API_KEY in the environment. It only re-renders lines
// whose text, voice or model changed. Settings: tools/voiceover.config.json.
//
// manifest is for audio made outside this script (ElevenLabs website, an MCP
// tool, or recorded by hand): save each line as voice/<scene>.mp3, then run it.

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [slug, command = 'script'] = process.argv.slice(2);
if (!slug) fail('usage: node tools/voiceover.mjs <lesson> [script|render|manifest]');

const lessonDir = path.join(ROOT, 'site', 'lessons', slug);
const voiceDir = path.join(lessonDir, 'voice');
const lesson = await import(pathToFileURL(path.join(lessonDir, 'lesson.js')));
const config = JSON.parse(await readFile(path.join(ROOT, 'tools', 'voiceover.config.json'), 'utf8'));
const ids = lesson.meta.stage_scenes;
const lines = ids.map((id) => ({ id, file: `${id}.mp3`, text: lesson.scenes[id].say, minMs: lesson.scenes[id].duration ?? 4000 }));
const missing = lines.filter((l) => !l.text).map((l) => l.id);
if (missing.length) fail(`no narration (say) for: ${missing.join(', ')}`);

// Keep these in step with site/assets/js/voice.js
const LEAD_IN = 0.4;
const TAIL = 0.9;

await mkdir(voiceDir, { recursive: true });
if (command === 'script') await writeScript();
else if (command === 'render') await render();
else if (command === 'manifest') await indexFiles();
else fail(`unknown command: ${command}`);

// ---------------------------------------------------------------------------------

async function writeScript() {
  const md = [`# ${lesson.meta.title}: tour narration`, '',
    'Generated from `lesson.js`. Save each line as the file named, in this folder, then run',
    `\`node tools/voiceover.mjs ${slug} manifest\`.`, '',
    ...lines.flatMap((l) => [`## ${l.id} → \`${l.file}\``, '', l.text, ''])].join('\n');
  await writeFile(path.join(voiceDir, 'script.md'), md);
  console.log(md);
}

async function render() {
  const key = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || config.voiceId;
  if (!voiceId || voiceId.startsWith('TODO')) fail('set voiceId in tools/voiceover.config.json (or ELEVENLABS_VOICE_ID)');
  if (!key) fail('set ELEVENLABS_API_KEY. It is only used here, never shipped with the site.');

  const previous = await readManifest();
  const scenes = {};
  for (const [i, l] of lines.entries()) {
    const hash = digest({ text: l.text, voiceId, model: config.modelId, settings: config.voiceSettings });
    const old = previous?.scenes?.[l.id];
    if (old?.hash === hash && await exists(path.join(voiceDir, l.file))) {
      console.log(`  ${l.id}: unchanged`);
      scenes[l.id] = old;
      continue;
    }
    console.log(`  ${l.id}: rendering…`);
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=${config.outputFormat}`, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({
        text: l.text,
        model_id: config.modelId,
        voice_settings: config.voiceSettings,
        // Neighbouring lines keep intonation continuous across separately rendered scenes.
        previous_text: lines[i - 1]?.text,
        next_text: lines[i + 1]?.text,
      }),
    });
    if (!res.ok) fail(`ElevenLabs ${res.status} for ${l.id}: ${(await res.text()).slice(0, 300)}`);
    const body = await res.json();
    await writeFile(path.join(voiceDir, l.file), Buffer.from(body.audio_base64, 'base64'));
    const a = body.alignment;
    scenes[l.id] = {
      file: l.file, text: l.text, hash,
      duration: round(a.character_end_times_seconds.at(-1)),
      sentences: sentenceTimes(a),
    };
  }
  await writeManifest(scenes, { source: 'elevenlabs-api', voiceId, modelId: config.modelId });
}

async function indexFiles() {
  const scenes = {};
  for (const l of lines) {
    const file = path.join(voiceDir, l.file);
    if (!await exists(file)) { console.log(`  ${l.id}: missing ${l.file}`); continue; }
    const duration = await probeDuration(file);
    scenes[l.id] = { file: l.file, text: l.text, duration, sentences: duration ? proportional(l.text, duration) : null };
    console.log(`  ${l.id}: ${duration ? `${duration}s` : 'found (install ffprobe for captions)'}`);
  }
  await writeManifest(scenes, { source: 'imported' });
}

async function writeManifest(scenes, extra) {
  const manifest = { lesson: slug, ...extra, generated: new Date().toISOString(), leadIn: LEAD_IN, tail: TAIL, scenes };
  await writeFile(path.join(voiceDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  const vtt = captions(scenes);
  if (vtt) await writeFile(path.join(voiceDir, 'captions.vtt'), vtt);
  console.log(`\nwrote voice/manifest.json${vtt ? ' and voice/captions.vtt' : ''} for ${Object.keys(scenes).length}/${lines.length} scenes`);
}

// --- captions ----------------------------------------------------------------------
// One cue per sentence, timed to the tour: each scene lasts max(minimum, lead-in +
// line + tail), exactly as the Stage tour schedules it.

function captions(scenes) {
  if (!lines.every((l) => scenes[l.id]?.sentences)) return null;
  const cues = [];
  let t = 0;
  for (const l of lines) {
    const s = scenes[l.id];
    for (const c of s.sentences) cues.push([t + LEAD_IN + c.start, t + LEAD_IN + c.end, c.text]);
    t += Math.max(l.minMs / 1000, LEAD_IN + s.duration + TAIL);
  }
  return ['WEBVTT', '', ...cues.map(([a, b, text], i) => `${i + 1}\n${stamp(a)} --> ${stamp(b)}\n${text}\n`)].join('\n');
}

function sentenceTimes(a) {
  const chars = a.characters;
  const out = [];
  let start = 0;
  for (let i = 0; i < chars.length; i++) {
    const endOfSentence = /[.?!]/.test(chars[i]) && (i === chars.length - 1 || chars[i + 1] === ' ');
    if (endOfSentence || i === chars.length - 1) {
      const text = chars.slice(start, i + 1).join('').trim();
      if (text) out.push({ text, start: round(a.character_start_times_seconds[start]), end: round(a.character_end_times_seconds[i]) });
      start = i + 1;
    }
  }
  return out;
}

function proportional(text, duration) {
  const parts = text.match(/[^.?!]+[.?!]+/g) || [text];
  const total = parts.reduce((n, p) => n + p.trim().length, 0);
  let t = 0;
  return parts.map((p) => {
    const d = (p.trim().length / total) * duration;
    const cue = { text: p.trim(), start: round(t), end: round(t + d) };
    t += d;
    return cue;
  });
}

// --- helpers ------------------------------------------------------------------------

async function probeDuration(file) {
  try {
    const { stdout } = await promisify(execFile)('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
    return round(Number(stdout));
  } catch { return null; }
}
async function readManifest() {
  try { return JSON.parse(await readFile(path.join(voiceDir, 'manifest.json'), 'utf8')); } catch { return null; }
}
async function exists(p) { try { await access(p); return true; } catch { return false; } }
function digest(o) { return createHash('sha256').update(JSON.stringify(o)).digest('hex').slice(0, 16); }
function round(n) { return Math.round(n * 1000) / 1000; }
function stamp(s) {
  const ms = Math.round(s * 1000);
  const hh = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const mm = String(Math.floor(ms / 60000) % 60).padStart(2, '0');
  const ss = String(Math.floor(ms / 1000) % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}.${String(ms % 1000).padStart(3, '0')}`;
}
function fail(msg) { console.error(msg); process.exit(1); }
