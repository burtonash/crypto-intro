# burtonash — brand & design system (maynard) v1.2

Personal brand for Ash (handle: burtonash). Not a business; nothing for sale.
Personality: bright, casual, professional; confident and playful, never salesy.
Heritage: DEC 70s/80s print + panel design (PDP-8/e faceplate, PDP-11 brochures),
terminal phosphor colours, IBM XT nostalgia. Homage to the devices, never copies
of the marks. Full human-readable spec: docs/brand/burtonash-brand-guidelines.html.

## Colour tokens

```css
:root {
  /* core (maynard) */
  --paper:      #F3EEE2;  /* page background, light surfaces */
  --ink:        #1A1512;  /* body text, dark surfaces, panels */
  --red:        #AF1E2D;  /* signature: actions, links, accents, cursor on paper */
  --brown:      #8C4527;  /* secondary fills, tags */
  --amber:      #FFB000;  /* warm bright: fills, tags, terminal text on dark, cursor on dark */
  --green:      #339900;  /* hercules phosphor: TEXT ON DARK SURFACES ONLY */
  --green-deep: #256600;  /* green fills, and green text on paper */

  /* on-colour text (always same family as fill) */
  --on-ink: #F3EEE2; --on-red: #FDEFE7; --on-brown: #F5E4D8;
  --on-amber: #442C00; --on-green: #E4F6D8;

  /* support */
  --ink-soft: #5C5245;   /* muted text on paper */
  --muted-dark: #B5A38F; /* muted text on ink */
  --hairline: #DDD2BE;   /* borders on paper */

  /* cga reserve — occasional retro vibe ONLY; never site chrome, never faceplate */
  --cga-cyan: #06C7D9; --cga-magenta: #ED3FA6; --cga-teal: #0A5F68;
}
```

## Colour rules (hard)

- Amber is NEVER text on paper (1.58:1). Fills and dark-surface text only.
- #339900 only as text on dark surfaces (4.91:1 on ink). Use #256600 for fills
  and for green text on paper (both ≥ 6:1).
- Cursor: red on paper, amber on dark. Red-on-ink is 2.63:1 — decorative only,
  and any red element on ink must carry a 1-unit paper keyline.
- Dark fills take light text, bright fills take dark text — same family.
- Max two brights per composition beyond ink + paper.
- CGA reserve colours: special retro contexts only (end cards, CGA-themed posts,
  phosphor-switcher easter egg). Never website chrome, never faceplate tiles.
- All approved text pairings pass WCAG AA; body pairings pass AAA.

## Typography

- IBM Plex Sans: body 400, headings/emphasis 500. Nothing heavier.
- IBM Plex Mono: wordmark, prompts, labels, tags, code, spec tables.
  Working weight = Text (450, self-hosted from IBM's release) or Medium (500).
  400 only for long code blocks. 700 reserved for tile-mark letters.
- Never hollow/outline/stroked display type. Headings always solid.
- Marks lowercase always; headings and body sentence case.
- Pixel faces (Departure Mono, VT323): CGA-reserve garnish only.

## Marks

1. Terminal prompt (primary): `ash:~$` + solid block cursor, Plex Mono
   working weight. Red cursor on paper, amber on dark. Long form `burtonash:~$`
   where needed. Used for nav (top left), footers, sign-offs.
2. Tile mark (secondary — not site chrome): lowercase Plex Mono Bold letters,
   one per tile. Tile 34×58 units (≈1:1.7), gap 4 (2 at favicon scale),
   radius 3, letter ≈45% of tile height, optically centred. Forms: ash (3),
   burtonash (9). Scale uniformly; never distort ratio.
   Colourways: digital red (primary; red tiles, #FDEFE7 letters) ·
   warm black (quiet default) · faceplate trio brown/amber/red (playful) ·
   splits: burton in neutral/earth, ash tiles ALWAYS carry the signature
   colour (warm black + red = banner; brown + amber = 8/e homage;
   red + amber = loud, end cards only). Cut-out rule (optional): on paper
   surfaces, tile letters may be set in paper #F3EEE2 itself — after the
   original digital logo, whose letters were cut-outs showing the substrate.
3. Faceplate rendering (dark-surface banner): tiles on an ink panel with
   1-unit paper keylines, tile radius 2, panel padding 8, panel radius 6.
   Canonical colouring: red burton + amber ash. RESERVED for flagship
   surfaces only.
4. CGA colourways of the marks exist in reserve; never replace maynard marks.

## Motifs (one per composition)

- Register bars: segmented colour blocks, 2-unit paper/white hairlines,
  ≤5 segments. Dividers, carousel progress, loading bars.
- Terminal chrome: prompts, title bars, inverse-video status bars.
  Terminal text on dark = amber or #339900, never red.
- Keylined panels: colour blocks on ink always get a 1-unit paper keyline.
- Duotone photography: red/ink duotone on paper; one photo per composition.
- Cover recipe: one solid field (red or ink), paper type, one framed image,
  small tile mark bottom. Used for carousel/video title cards.
- CGA dither texture: reserve contexts only.

## Photography & editorial (1964–78 corporate optimism)

- Machine is the hero; people make it believable: work-in-progress scenes,
  posed-candid, real rooms, never stock-photo energy.
- Frontal / three-quarter compositions, tripod-steady, panels square to lens,
  symmetric where possible, generous headroom.
- Warm film palette (Kodachrome era): creams, ambers, deep reds, browns.
  Grade toward maynard; desaturate hues the palette does not own.
- Quiet backgrounds: seamless paper, plain walls, tidy benches.
- On solid colour fields, photos sit inside a paper border (pdp-11 cover
  construction).
- Treatments: red/ink duotone for covers and graphic contexts; warm full
  colour for editorial interiors.
- Own-kit shots: warm directional light, hands doing something real,
  nameplates legible, one subject per frame.
- Documents: one grid, generous margins, large calm Plex Sans 500 headlines,
  numbered figures with mono captions; spec tables treated as design elements.
- Slides: one idea per slide; title slide = cover recipe; content = one
  figure + mono caption or one table; register bar as progress indicator.
- Tone: confident declaratives; optimism as precision, no exclamation marks.

## Website rules

- Maynard theme throughout; paper pages, ink text, red links/actions.
- Nav: terminal prompt wordmark top left, red cursor. Tile mark is NOT chrome.
- Terminal surfaces (footer, code, labs console): ink bg, amber/green/paper text.
- Faceplate band: full-width ink band with the red+amber keylined bar.
  Flagship pages only (spec-sheet about page, series landings, launches).
  Everyday pages omit it. Standing exception: a bar-height faceplate may sit
  top right in the nav, opposite the prompt — tiles ~14x24, keylines intact,
  letters Plex Mono Bold >= 11px; below that use the 3-tile ash form or drop
  letters. The nav bar must not grow to fit it.
- Category tags (mono, working weight): crypto = amber, radio = brown,
  retro = green-deep.
- Phosphor switcher easter egg (amber/green/cga-cyan) allowed on terminal
  surfaces only.

## Voice

Best-1976-datasheet register: plain, specific, quietly funny. Explain, never
sell. Datasheet humour welcome (model numbers, errata, supported protocols).
No hustle-culture vocabulary, no exclamation-mark enthusiasm, no emoji in
system copy.

## Extensions for complex implementations (v1.2)

Some products need more than the core system allows (cast colours, poster-scale
type, diagrams with many roles). Exceptions are allowed when they follow these rules:

1. **Scoped.** An extension lives inside its own content surface (a demo
   canvas, a Stage frame, a diagram). It never leaks into site chrome, nav,
   footers or marks.
2. **Heritage-justified.** Every added colour or device has a hardware story,
   like everything in the core. If you can't tell the story, don't add it.
3. **Same grammar.** Paper and ink still carry the composition. Plex Sans and
   Plex Mono only. Lowercase marks, solid type, keylines on ink.
4. **Never colour alone.** Every coded role also has a shape and a text label.
5. **Audited.** New pairings pass WCAG AA (4.5:1 text, 3:1 shapes/UI) and are
   listed here before use.
6. **Registered.** Each extension gets a named subsection below. If it's not
   written here, it isn't approved.

### Extension: Stage (Build → Break)

Stage Mode is the poster-scale recording surface for the Build → Break
crypto demos (see docs/product/build-break-prd.md). It is maynard at arm's length:
bigger and chunkier, but the same paper, ink and keylines.

**The cast.** Heritage: the IBM System/360 shipped with customer-chosen
coloured panels (red, blue, yellow, green…) and DEC colour-coded the PDP-8
in burnt orange and goldenrod. The cast are panels on the machine. Eve is the
one exception that proves the rule: she is the only character drawn from the
CGA reserve, because she is the intruder who doesn't belong in the palette.

| Role | Shape | Fill | Text on fill | Notes |
|---|---|---|---|---|
| Alice | circle | `--cast-alice` #2B5B8A (360 blue) | #E3EDF7 (5.98) | 6.12 on paper |
| Bob | square | `--cast-bob` #D06A24 (8 orange) | #2A1003 (4.91) | 3.14 on paper (shape only) |
| Eve | triangle | `--cga-magenta` #ED3FA6 | #2A0418 (5.19) | the only reserve colour on Stage |
| Secret | face-down tile | `--ink` | `--on-ink`, amber keyline | hidden = dark |
| Public info | open tile | `--amber` | `--on-amber` | in plain sight |
| Verified | stamp | `--green-deep` | `--on-green` | |
| Broken | crack | `--red` | `--on-red` | |

```css
:root {
  /* cast (Stage extension only) */
  --cast-alice: #2B5B8A; --on-alice: #E3EDF7;
  --cast-bob:   #D06A24; --on-bob:   #2A1003;
  --cast-eve:   var(--cga-magenta); --on-eve: #2A0418;

  /* stage surface — maynard, not a separate palette */
  --stage-bg:     var(--paper);
  --stage-ink:    var(--ink);
  --stage-title:  clamp(3rem, 10vw, 8rem);    /* Plex Sans 500 */
  --stage-label:  clamp(1.5rem, 5vw, 3rem);   /* Plex Mono working weight */
  --stage-code:   clamp(1.25rem, 4vw, 2.5rem);
  --stage-border: 6px solid var(--ink);
  --stage-radius: 12px;
  --stage-safe-x: 7%;
  --stage-safe-y: 12%;   /* vertical frame: keep the top/bottom 15% free of critical text */
}
```

**Stage rules**

- Cast colours are identity, not decoration, so they don't count toward the
  two-brights budget. Everything else on a Stage frame still does: at most
  two brights beyond the cast.
- Bob's orange is a fill only, never text (3.14:1 on paper). Names and labels
  for every cast member sit beside the shape in ink.
- No more than three cast members on screen at once.
- Cast shapes on ink take a 1-unit paper keyline (Alice 2.56, as for red).
- Cards are flat, keylined panels: thick ink border, 12px radius, no drop
  shadow. Restraint is still the style; the PRD's 36px radius and hard
  offset shadow are not used.
- Dark Stage frames (attacker view, terminals) follow the terminal rules:
  ink ground, amber/#339900/paper text, never red text.
- Title cards and end cards use the cover recipe; the register bar is the
  scene-progress indicator.
- Stage copy follows Voice: "Break it" not "SMASH IT 💥". The honesty notes
  (toy vs real attack cost) are datasheet errata, and should read like them.
- Cast colours never appear outside Stage and Explore-mode demos.
