# crypto-intro

Build tiny crypto. Break tiny crypto. Learn why real crypto looks the way it does.

Home of **Build → Break** (working title), an interactive cryptography learning platform with a built-in Stage Mode for recording short-form video, and the burtonash site it lives on.

## Layout

| Path | What it is |
|---|---|
| `docs/product/build-break-prd.md` | Product requirements: the 7-arc / 53-episode ladder, Explore and Stage modes, scene system, metadata schema, release plan |
| `BRAND.md` | Machine-readable brand spec: tokens and hard rules. Give this to any tool that builds UI |
| `docs/brand/burtonash-brand-guidelines.html` | burtonash "maynard" design system v1.1: palette, type, marks, voice, tokens |
| `site/index.html` | burtonash homepage (logbook) |
| `site/about.html` | Spec-sheet about page |
| `site/lessons/caesar/` | Arc 1 · ep 02, the first Build → Break lesson (Explore and Stage) |
| `site/assets/` | Shared lesson engine, maynard CSS, self-hosted IBM Plex |
| `tests/` | Unit tests for the cipher and the attack |

## Running it

Static, with no build step and no dependencies. Lessons use ES modules, so they need a local server rather than `file://`:

```sh
npm run serve      # http://localhost:8000/lessons/caesar/
npm test           # node's built-in test runner
```

## Stage Mode (recording)

Add `?stage=1` to any lesson URL. Every frame renders at its real pixel size and scales to fit the window, so a re-recording gives the same frames.

```
/lessons/caesar/?stage=1&ratio=vertical&scene=break&text=HELLO&shift=3
```

| Param | Values |
|---|---|
| `ratio` | `vertical` (1080×1920), `square` (1080×1080), `wide` (1920×1080) |
| `scene` | `promise` `build` `demo` `break` `patch` `next` |
| `text`, `shift` | the message and key (Stage keeps up to 8 letters) |
| `hud=0` | hide the control bar |
| `guides=1` | show the safe areas |
| `still=1` | skip animations and show each scene's end state (for thumbnails) |

Keys: `←` `→` scene · `space` autoplay or pause · `r` reset · `c` copy the frame title · `g` guides · `h` hide the HUD · `1` `2` `3` ratio.

To record a clip: hide the HUD, press `r` then `space`, and screen-capture the frame. A full autoplay run is about 29 seconds.

## Narrated tour

`?tour=1` plays the Stage scenes with a voiceover. Each scene lasts as long as its line. The Explore page's **Take the tour** button opens it in vertical or wide, depending on the screen. The tour always uses the lesson's default message, because the narration is written for it. Browsers won't play sound without a click, so the tour starts from a button. `m` mutes.

The voiceover is static audio in `site/lessons/<slug>/voice/`, committed and deployed with the site. The page never calls a speech service. The narration is the `say` field on each scene in `lesson.js`. To produce the audio:

```sh
node tools/voiceover.mjs caesar script    # writes voice/script.md: the lines and their filenames
```

Then either:

- **Make the MP3s anywhere** (the ElevenLabs website, an MCP tool, or a recording). Save each line as `voice/<scene>.mp3`, then run `node tools/voiceover.mjs caesar manifest`.
- **Render through the API:** set `voiceId` in `tools/voiceover.config.json`, then run `ELEVENLABS_API_KEY=… node tools/voiceover.mjs caesar render`. It only re-renders lines that changed, and it writes word-timed captions.

Both write `voice/manifest.json` and `voice/captions.vtt`, a caption file timed to the tour that you can upload alongside a video. If a line in `lesson.js` changes after its audio was made, the tour still plays and the HUD lists the scenes that need re-rendering. Without a manifest, the tour plays silently.

## Adding a lesson

Make `site/lessons/<slug>/` with a copy of the Caesar `index.html` and a `lesson.js` that exports:

- `meta`: the PRD §7.7 schema plus the copy for each of the seven beats
- `scenes`: one entry per id in `meta.stage_scenes`, each with a `surface`, `title`, `visual`, `line`, `duration` and `say` (the tour narration)
- `widgets`: interactive parts keyed by beat id
- `defaults`, `paramsFrom`, `paramsTo`: how the demo state maps to the URL
