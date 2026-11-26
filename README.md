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

## Adding a lesson

Make `site/lessons/<slug>/` with a copy of the Caesar `index.html` and a `lesson.js` that exports:

- `meta`: the PRD §7.7 schema plus the copy for each of the seven beats
- `scenes`: one entry per id in `meta.stage_scenes`, each with a `surface`, `title`, `visual`, `line` and `duration`
- `widgets`: interactive parts keyed by beat id
- `defaults`, `paramsFrom`, `paramsTo`: how the demo state maps to the URL
