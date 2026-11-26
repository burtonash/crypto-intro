#!/usr/bin/env node
// Scaffold a lesson's page shell: node tools/new-lesson.mjs <slug> "<Title>"
// The lesson itself lives in lesson.js (meta, scenes, widgets) next to it.
import { writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [slug, title] = process.argv.slice(2);
if (!slug || !title) { console.error('usage: node tools/new-lesson.mjs <slug> "<Title>"'); process.exit(1); }
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'site', 'lessons', slug);
await mkdir(dir, { recursive: true });
const file = path.join(dir, 'index.html');
try { await access(file); console.error(`${file} exists; not overwriting`); process.exit(1); } catch {}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
await writeFile(file, `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — build → break · burtonash</title>
<link rel="preload" href="../../assets/fonts/IBMPlexSans-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="../../assets/fonts/IBMPlexMono-Medium.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="../../assets/css/maynard.css">
<link rel="stylesheet" href="../../assets/css/explore.css">
<link rel="stylesheet" href="../../assets/css/stage.css">
<link rel="stylesheet" href="lesson.css">
</head>
<body class="explore-body">
<noscript><div class="wrap"><h1>${esc(title)}</h1><p>The interactive lesson needs JavaScript.</p></div></noscript>
<script type="module">
  import { boot } from '../../assets/js/boot.js';
  import * as lesson from './lesson.js';
  // Load fonts before first render so Stage frames are identical on every take.
  await Promise.all(['400 16px "IBM Plex Sans"', '500 16px "IBM Plex Sans"', '450 16px "IBM Plex Mono"', '500 16px "IBM Plex Mono"', '700 16px "IBM Plex Mono"']
    .map((f) => document.fonts.load(f))).catch(() => {});
  boot(lesson);
</script>
</body>
</html>
`);
await writeFile(path.join(dir, 'lesson.css'), `/* ${title}: lesson-specific Stage layouts (shared kit is in assets/css/stage.css). */\n`, { flag: 'a' });
console.log(`created site/lessons/${slug}/index.html and lesson.css`);
