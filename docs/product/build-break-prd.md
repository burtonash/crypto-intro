# Product Requirements Document

## Build → Break (working title)
**An interactive cryptography learning platform with a built-in video production mode**

| | |
|---|---|
| **Version** | 0.1 (Draft) |
| **Date** | 23 July 2026 |
| **Owner** | Ash Burton |
| **Status** | For review |

---

## 1. Summary

Build → Break is a two-surface product built from a single source of interactive cryptography demos:

1. **An interactive learning website** where visitors build toy versions of cryptographic primitives (ciphers, hashes, key exchange, signatures, zero-knowledge proofs and beyond), then attack them, then learn the fix.
2. **A short-form video series** (TikTok, YouTube Shorts, Instagram Reels, LinkedIn) recorded directly from the same demos via a dedicated "Stage Mode" — a stripped-down, poster-like presentation layer optimised for phone-screen capture.

The pedagogical thesis is that people internalise security concepts by breaking things, not by reading about them. Every lesson follows the same narrative arc — build the thing, trust the thing, break the thing, patch the idea, unlock the next thing — which doubles as a natural story structure for short-form video.

**Core proposition:** *Build tiny crypto. Break tiny crypto. Learn why real crypto looks the way it does.*

---

## 2. Problem and opportunity

Cryptography education today splits into two unsatisfying camps. Academic material is rigorous but inaccessible — dense notation, no interactivity, no motivation for why each construction exists. Popular content is accessible but shallow — "AES encrypts your data" explanations that never show *why* simpler approaches fail, leaving learners unable to reason about security.

The gap: nobody teaches cryptography as a sequence of **broken promises**. Each primitive in the modern stack exists because a simpler one failed in a specific, demonstrable way. That failure is visual, satisfying, and short — which makes it ideal both for genuine understanding and for the hook-driven grammar of short-form video.

A single content pipeline that produces both an evergreen interactive site and a continuous stream of social clips gives the project compounding reach: video drives traffic to the site; the site converts casual viewers into series followers.

---

## 3. Goals and non-goals

### Goals

1. Teach a complete conceptual ladder of cryptography — from Caesar ciphers to FHE — through interactive build-and-break demos.
2. Make every lesson produce at least one recordable short-form video clip with zero additional production tooling beyond screen capture.
3. Establish a recognisable visual brand (persistent characters, consistent design tokens) that is legible without narration.
4. Teach the honest meta-lesson: most real-world crypto failures are misuse and composition errors, not broken mathematics.

### Non-goals

- Teaching production-grade cryptographic implementation ("don't roll your own crypto" is a theme, not a contradiction — all implementations are explicitly toys).
- Serving as a reference or API documentation for real libraries.
- Long-form video production (the site is the long-form surface; video is short-form only).
- User accounts, progress tracking, or community features in v1.

---

## 4. Audience

**Primary:** developers and technically curious professionals encountering the content on short-form platforms — people who know what a hash is but couldn't explain why salts exist or what a MITM attack actually looks like.

**Secondary:** self-directed learners who arrive at the website and work through arcs sequentially — students, career-switchers into security, engineers preparing for security-adjacent roles.

**Tertiary:** educators and content creators who use Stage Mode demos as teaching aids.

The design bar for all surfaces: **readable on a phone at arm's length**. If it fails that test, it is too small.

---

## 5. Product structure

### 5.1 Content model

```
Series
 └── Arc (7 arcs, thematic seasons)
      └── Episode (~53 lessons, one primitive + one attack each)
           └── Scene (ordered steps: promise, build, demo, break, patch, next)
```

Every episode introduces a primitive and then attacks it until the attack becomes unrealistic, too expensive, or dependent on stronger assumptions. As the ladder advances, "break" evolves in kind: from *doable attack* (Arc 1) → *toy-size attack with an explicit honesty note* (Arc 4) → *show the limitation* (Arc 7). That honesty is part of the brand: "We broke the toy. The real thing survives because the numbers stop being toy-sized."

### 5.2 Lesson page template (site)

Every lesson page uses the same seven-beat structure:

| Beat | Content |
|---|---|
| **Promise** | What does this thing claim to give us? |
| **Build** | Tiny interactive implementation |
| **Trust** | What seems good about it? |
| **Break** | Attack: brute force, misuse, collision, replay, MITM, leakage |
| **Patch** | What idea fixes or reduces the weakness |
| **Reality** | What real systems do instead |
| **Next** | What this unlocks |

Some lessons carry **two breaks** (e.g. Diffie-Hellman: brute-force tiny groups, *then* man-in-the-middle) — the template supports repeated Break → Patch cycles.

### 5.3 Video template (short-form)

A compressed five-beat version of the same story: **Hook → Build → Break → Lesson → Next.**

Example (Caesar cipher):
> **Hook:** This cipher looks scrambled. Let's break it in 20 seconds.
> **Build:** Move every letter by 3. **Demo:** HELLO → KHOOR.
> **Break:** Try all 25 shifts. One of them says HELLO.
> **Lesson:** A tiny keyspace is not security.
> **Next:** What if every letter had its own mapping?

---

## 6. Content requirements: the learning ladder

Seven arcs, ~53 episodes. Each row is Build / Break / Lesson unlocked.

### Arc 1 — Secret writing is fragile (Episodes 1–6)
Hiding the method is weak. A cipher is not good because it looks scrambled; it is good because it survives an attacker who knows how it works.

| Ep | Build | Break | Lesson |
|---|---|---|---|
| 1 | Secret messages | Read it if you know the trick | Encoding is not encryption |
| 2 | Caesar cipher | Try all 25 shifts | Small keyspaces are dead |
| 3 | ROT13 | Apply it twice | Some ciphers barely deserve the name |
| 4 | Substitution cipher | Frequency analysis | Patterns survive encryption |
| 5 | Vigenère cipher | Repeated-key analysis | Reusing structure leaks structure |
| 6 | Kerckhoffs's principle | "What if the algorithm is secret?" | Only the key should need to be secret |

### Arc 2 — Bits, XOR and perfect secrecy (Episodes 7–12)
From letters to machine crypto. Delivers the first "magic moment" (XOR reversibility) and the gut-punch (`ct1 ⊕ ct2 = pt1 ⊕ pt2`).

| Ep | Build | Break | Lesson |
|---|---|---|---|
| 7 | Text as numbers | Encoding confusion | Computers need representations |
| 8 | Bits and bytes | Flip one bit | Tiny changes matter |
| 9 | XOR machine | XOR twice to recover | Reversibility can be useful |
| 10 | Stream-style encryption | Reuse the keystream | Reused masks leak secrets |
| 11 | One-time pad | Reuse the pad | Perfect secrecy has brutal requirements |
| 12 | Randomness | Predictable "random" | Bad randomness ruins good crypto |

### Arc 3 — Fingerprints, tampering and authentication (Episodes 13–21)
Recurring line: *Encryption hides a message. Authentication protects meaning.*

| Ep | Build | Break | Lesson |
|---|---|---|---|
| 13 | Tiny checksum | Change message, fix checksum | Checksums catch accidents, not attackers |
| 14 | Toy hash | Find a collision | Hashes need huge output spaces |
| 15 | Better hash intuition | Brute force tiny hash | Size matters |
| 16 | Avalanche effect | Tiny change, huge digest change | Good hashes scramble relationships |
| 17 | Password hashing | Rainbow tables / common passwords | Hashing alone is not enough |
| 18 | Salted passwords | Same password, different hash | Salts kill precomputed attacks |
| 19 | Slow password hashing | Fast brute force | Attack cost matters |
| 20 | MAC | Edit message without key | Authentication needs a secret |
| 21 | HMAC | Naive hash constructions | Composition matters |

### Arc 4 — Key exchange and public-key weirdness (Episodes 22–29)
The break shifts from "doable" to "toy-size" — make that shift explicit on screen.

| Ep | Build | Break | Lesson |
|---|---|---|---|
| 22 | Shared secret encryption | "How did we share the key?" | Key distribution is the real problem |
| 23 | Modular arithmetic toy | Reverse small examples | One-way-ish functions |
| 24 | DH with tiny numbers | Brute-force Alice's secret | Real security needs huge groups |
| 25 | DH with colours | Eve watches everything | Public exchange can create private secrets |
| 26 | Man-in-the-middle DH | Eve swaps keys | Key exchange needs authentication |
| 27 | Public/private key pair | Guess the private key (toy) | Trapdoors are asymmetric |
| 28 | RSA toy model | Factor tiny modulus | Real RSA relies on hard factoring |
| 29 | Elliptic curve intuition | Tiny curve brute force | Smaller keys, different hard problem |

### Arc 5 — Signatures, identity and trust (Episodes 30–36)
The story becomes social. Signature demos are highly video-legible: change "Pay Bob £10" to "Pay Bob £10,000" → stamp tears → INVALID.

| Ep | Build | Break | Lesson |
|---|---|---|---|
| 30 | Digital signature | Modify message after signing | Signatures bind identity to exact data |
| 31 | Verify with public key | Use the wrong public key | Verification needs a trusted key |
| 32 | Certificates | Fake certificate | Identity needs a trust model |
| 33 | Certificate chains | Break the chain | Trust is delegated |
| 34 | TLS toy handshake | MITM without cert check | Public-key crypto needs protocol discipline |
| 35 | Replay attack | Reuse an old valid message | Freshness matters |
| 36 | Nonces and timestamps | Replay becomes harder | Protocols need context |

### Arc 6 — Commitments and proving things (Episodes 37–44)
The bridge into ZK. The break becomes "can the prover cheat?" — visualise cheating probability collapsing: 1 round 50% → 2 rounds 25% → 10 rounds 0.097%.

| Ep | Build | Break | Lesson |
|---|---|---|---|
| 37 | Commitment scheme | Change your mind after committing | Binding matters |
| 38 | Hidden commitment | Reveal secret too early | Hiding matters |
| 39 | Commit-reveal game | Last-mover advantage | Timing attacks protocol fairness |
| 40 | ZK cave proof | Cheat once | Soundness is probabilistic |
| 41 | Repeat the proof | Cheat probability shrinks | Repetition increases confidence |
| 42 | Graph colouring proof | Fake witness fails challenge | Prove knowledge without revealing it |
| 43 | Fiat-Shamir idea | Replace verifier challenge | Interaction can sometimes be removed |
| 44 | zk-SNARK intuition | (No full break) | Some systems rely on deep assumptions |

### Arc 7 — Sharing secrets and computing privately (Episodes 45–53)
Advanced but still visual. The format evolves: build it → attack it → misuse it → hit the limit → improve it. For MPC/FHE, "breaking" becomes "here's the promise, here's the cost, here's where the toy model lies."

| Ep | Build | Break | Lesson |
|---|---|---|---|
| 45 | Split a secret badly | One share reveals too much | Not all splitting is secret sharing |
| 46 | Shamir secret sharing | Use too few shares | Thresholds matter |
| 47 | Reconstruct secret | Lose enough shares | Availability vs secrecy |
| 48 | Threshold signing | One signer tries alone | Groups can control keys |
| 49 | MPC toy voting | One party reveals input | Privacy needs protocol rules |
| 50 | Garbled circuit intuition | Try to read hidden wires | Computation can hide inputs |
| 51 | Private set intersection | Compare lists naively | Useful result without full reveal |
| 52 | Homomorphic addition | Try unsupported operation | Encrypted computation is limited |
| 53 | FHE intuition | Everything gets expensive | Power has a cost |

### Optional Arc 8 — Real crypto engineering
A closing arc on composition, misuse, side channels, metadata and implementation bugs. Lands the series' grown-up thesis: *good cryptography is good composition, good randomness, good implementation and good threat modelling — not just good primitives.* Recommended for the roadmap but out of scope for the initial release plan.

---

## 7. Functional requirements

### 7.1 Explore Mode (the website)

- **FR-E1:** Every episode is a page implementing the seven-beat lesson template (§5.2) with an interactive demo of the primitive.
- **FR-E2:** Demos are directly manipulable — user-editable plaintext, keys, shifts, shares — with immediate visual output.
- **FR-E3:** Every demo exposes an attacker path (see BreakButton, §7.5) — the break is something the user *does*, not something they read.
- **FR-E4:** Site navigation reflects the arc → episode ladder; each lesson links forward to what it unlocks.
- **FR-E5:** An "attacks unlocked" tracker aggregates breaks completed across the series (see §7.7), rendered as a running list: *Things we have broken so far — small keyspaces, repeated patterns, reused keys, tiny hashes, unauthenticated exchange, replayable messages…*

### 7.2 Stage Mode (the recording canvas)

Every demo has two display modes:

| Mode | Purpose |
|---|---|
| Explore | Normal website use |
| Stage | Clean, big, video-friendly capture |

- **FR-S1:** Stage Mode strips the UI to: big title, one active visual, huge input/output, one sentence of explanation, optional step counter. No nav, sidebar, small controls or external links.
- **FR-S2:** Each lesson has an "Open Stage Mode" affordance, routed as `/lessons/{slug}/stage` or `?stage=1`.
- **FR-S3:** Stage state is addressable by URL, e.g. `/lessons/rot13/stage?ratio=vertical&scene=break`, so specific frames are reproducible and shareable with the production workflow.
- **FR-S4:** Stage Mode is capture-ready as-is — recording a video requires nothing beyond screen capture of the browser.

### 7.3 Scene system

- **FR-SC1:** Each lesson defines an ordered scene list, e.g. `["promise", "build", "demo", "attacker-view", "break", "patch", "next"]`.
- **FR-SC2:** Stage Mode steps through scenes with keyboard controls: `←` previous, `→` next, `space` play/pause, `R` reset, `C` copy current frame title.
- **FR-SC3:** One idea per frame. Scenes replace all-at-once diagrams; the Stepper becomes a sequence of discrete scenes (Plaintext → Key → Operation → Ciphertext → Attack → Lesson).

### 7.4 Aspect ratios and safe areas

- **FR-R1:** Stage Mode supports three frames, selectable per session:

| Frame | Ratio | Target |
|---|---|---|
| FrameVertical | 9:16 (1080×1920) | TikTok / Shorts / Reels |
| FrameSquare | 1:1 (1080×1080) | LinkedIn feed (also 4:5) |
| FrameWide | 16:9 (1920×1080) | YouTube standard |

- **FR-R2:** All frames enforce a safe area. Vertical: top 15% and bottom 15% carry no critical text or controls; the middle 70% is the teaching area (platform overlays eat the edges).
- **FR-R3:** Text sizing follows the arm's-length rule — Stage typography uses fluid clamps (see §7.6) so titles are massive, labels large, code minimal and zoomed, body text nearly absent.

### 7.5 Component library additions

| Component | Behaviour |
|---|---|
| **BreakButton** | Big dramatic "Break it" control. On press: UI switches to attacker view, Eve appears, the weakness becomes visible. |
| **AttackerView** | The same demo rendered as what Eve can see and do (e.g. DH: Eve sees `p, g, A, B`; toy attack tries secrets 1–20). |
| **AttackMeter** | Visual cost scale — Tiny / Small / Big / Astronomical — so toy breaks can be honestly contrasted with real-parameter cost (factor 3233: easy; factor a 2048-bit modulus: not happening). |
| **LeakViewer** | Shows what survives an encryption/protocol: ciphertext hides contents but leaks length, timing, reuse patterns, metadata. |
| **MisusePanel** | Catalogues non-mathematical failures: reused key, bad randomness, no authentication, wrong public key, missing/reused nonce, replay allowed, side channels. Teaches: most crypto disasters are misuse, not broken theorems. |
| **SceneStepper** | Drives the scene system (§7.3) in both modes. |
| **Animated transforms** | Signature moments per primitive: Caesar tiles sliding A→D; XOR bit gates; signature stamp tearing on edit; hash digest exploding into different colours on a one-character change. |

### 7.6 Design system

**Persistent visual roles** — the same entities appear across all 53 episodes and must be recognisable without narration:

| Entity | Visual |
|---|---|
| Alice | Blue circle |
| Bob | Orange square |
| Eve | Pink triangle |
| Secret | Purple hidden tile |
| Public info | Yellow open tile |
| Verified | Green stamp |
| Broken | Red crack |

**Stage tokens** — a second token layer for recorded demos, chunkier than site styling (the site can be elegant; Stage Mode should be almost poster-like):

```css
:root {
  --stage-bg: #FFF8EA;
  --stage-ink: #18202F;
  --stage-title: clamp(3rem, 10vw, 8rem);
  --stage-label: clamp(1.5rem, 5vw, 3rem);
  --stage-code: clamp(1.25rem, 4vw, 2.5rem);
  --stage-border: 6px solid var(--stage-ink);
  --stage-shadow: 10px 10px 0 var(--stage-ink);
  --stage-safe-x: 7%;
  --stage-safe-y: 12%;
}

.stage-card {
  border: var(--stage-border);
  box-shadow: var(--stage-shadow);
  border-radius: 36px;
  padding: 48px;
}

.stage-frame[data-ratio="vertical"] { aspect-ratio: 9 / 16; }
.stage-frame[data-ratio="square"]   { aspect-ratio: 1 / 1; }
.stage-frame[data-ratio="wide"]     { aspect-ratio: 16 / 9; }
```

### 7.7 Content metadata schema

Every lesson is defined by a metadata file describing both the primitive and its attack — this is what powers navigation, the attacks-unlocked tracker, and scene routing:

```yaml
title: Caesar Cipher
promise: Hide a message by shifting letters.
builds:
  - alphabet shifting
  - modular wraparound
breaks:
  - brute force
  - known plaintext
attack_cost: tiny
patch:
  - larger keyspace
  - better key model
unlocks:
  - substitution ciphers
  - keyspaces
stage_scenes:
  - promise
  - build
  - demo
  - break
  - patch
  - next
```

- **FR-M1:** All lesson pages, stage routes, scene lists and cross-lesson aggregations are generated from this schema — content is data, not hand-built pages.
- **FR-M2:** `attack_cost` feeds the AttackMeter; `breaks` feeds the attacks-unlocked tracker; `unlocks` feeds forward navigation.

---

## 8. Non-functional requirements

- **NFR-1 Phone-first legibility:** every Stage frame passes the arm's-length readability test on a phone.
- **NFR-2 Performance:** demos are lightweight client-side interactions; animations run at capture-quality frame rates (60fps target) since they will be screen-recorded.
- **NFR-3 Determinism:** demo state is reproducible from URL parameters so re-recording a clip yields identical frames.
- **NFR-4 Honesty:** every toy break that would not scale to real parameters carries an explicit AttackMeter or equivalent disclosure. No demo implies real crypto was broken.
- **NFR-5 Accessibility:** Explore Mode meets standard accessibility expectations (keyboard operability, contrast, reduced-motion support); colour-coded roles carry a secondary cue (shape) — already inherent in the Alice/Bob/Eve system.
- **NFR-6 Zero-backend baseline:** v1 requires no server state, accounts or database; the site is statically hostable.

---

## 9. Release plan

| Phase | Scope | Exit criteria |
|---|---|---|
| **0 — Design system + Stage prototype** | Stage tokens, frames, safe areas, SceneStepper, one end-to-end lesson (Caesar or ROT13) working in both modes | One social clip recorded straight from the browser with no external tooling |
| **1 — Arc 1** | Episodes 1–6, BreakButton + AttackerView, metadata pipeline | Arc 1 live; first video batch published; the breaks are visual and satisfying |
| **2 — Arcs 2–3** | Episodes 7–21, AttackMeter, LeakViewer, attacks-unlocked tracker | XOR keystream-reuse and avalanche demos shipped (the two most video-magnetic moments) |
| **3 — Arcs 4–5** | Episodes 22–36, MisusePanel, two-break lesson support | DH MITM and signature-stamp demos shipped |
| **4 — Arcs 6–7** | Episodes 37–53, probability visualisations for ZK | Full ladder complete |
| **5 — Optional** | Arc 8 (crypto engineering), site polish, discoverability | TBD |

Each phase ships site content and its matching video batch together — the pipeline is the product.

---

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Toy breaks are misread as "real crypto is broken" | AttackMeter + explicit on-screen honesty notes are mandatory (NFR-4), and become a brand asset rather than a caveat |
| 53 episodes is a long production commitment | Metadata-driven pages keep per-episode cost low; arcs are independently valuable so the series survives stopping early |
| Later arcs (MPC/FHE) resist visual demos | Format explicitly evolves to "show the limitation"; §6 Arc 7 defines this shift up front |
| Stage Mode drifts from Explore Mode | Single demo source with two render targets (FR-S1/FR-M1); no forked "video versions" of demos |
| Platform overlay changes break safe areas | Safe areas are tokens (`--stage-safe-*`), adjustable globally |

---

## 11. Open questions

1. **Name and domain** — "Build → Break" is a working title.
2. **Tech stack** — the requirements imply a component-based front end with static generation from lesson metadata; stack not yet decided.
3. **Video pipeline** — pure screen capture of Stage Mode vs programmatic frame rendering/export from the scene system (the URL-addressable scenes make the latter feasible later).
4. **Captions/narration workflow** — whether scene titles should export as a caption script per episode.
5. **Localisation** — worth deciding before the metadata schema hardens.
6. **Analytics** — what minimal, privacy-respecting measurement (if any) v1 includes.
7. **Arc 8** — in or out of the committed roadmap.

---

## 12. Appendix — templates at a glance

**Design-system spine:** Build → Break → Patch → Prove

**Page template:** Promise → Build → Trust → Break → Patch → Reality → Next

**Video template:** Hook → Build → Break → Lesson → Next

**Per-lesson production loop:** write metadata → demo builds itself in Explore Mode → step scenes in Stage Mode → screen-record per ratio → publish clip + page together.
