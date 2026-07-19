# Work Log

_Append-only. Newest at top. One short entry per work session._

## 2026-07-18 (Sound Match challenges — #26)
- New Patching page "Sound Match" (slug `challenges`): four ear-training
  challenges — pitch (±25 cents), waveform (identify), filter cutoff (±⅓ octave),
  envelope A/R (±log₂ 0.58) — with A/B target/yours playback, directional hints,
  randomized replayable targets, and localStorage progress.
- Scoring compares configs in ear-units (cents/octaves/log-time) — we run both
  synths, so no analyser round-trip (see decisions.md).
- Verified by solving all four via audio measurement: pitch heard 494 Hz →
  matched; waveform identified by brightness A/B; cutoff via 4-step search;
  envelope hints converge in 3 checks; ✓ chips persist across reload.

## 2026-07-18 (Envelope lesson interactions — #35)
- Try-this said "Hit Pluck" but the preset button only sets sliders (no sound);
  copy rewritten around the real interactions.
- Added **Latch note / Release** toggle (press-to-hold) — sweep sustain/release
  while the note rings — and **hold-A keyboard trigger** (keydown = attack,
  keyup = release), consistent with the piano lessons.
- Verified: pluck dies while A held (sustain 0); pad swells + long tail; latch
  survives stray key taps; sustain live while latched (0.034 ↔ 0.276 RMS).

## 2026-07-18 (Keyboard black keys — #33)
- Black keys were filled #11151f — near-identical to the page background — so the
  keyboard read as white-keys-only and sharps looked missing. Now a distinct fill
  (#2a3147) with border + drop shadow, and visible note labels (C#, D#, …) to
  match the labeled white keys.

## 2026-07-18 (Master volume placement — #31)
- Moved master volume out of the (now-crowded) sidebar into LessonScaffold: one
  compact `Volume` slider + % readout, right-aligned above every demo panel.
  Binds `masterVolumeStore` directly, so it persists across lessons. Verified
  RMS tracks the slider (0.052 @ 20% ↔ 0.255 @ 100%).

## 2026-07-18 (SEO pass — #29)
- Added `humans.txt` (+ `rel="author"` link); ASCII-only (no charset header on .txt).
- **Path routing** replaces hash routing (`/filters` etc.); legacy `#/` links
  redirect client-side; unknown slugs normalize to `/`; sidebar items are real
  `<a>` links; head (title/description/canonical) updates on client nav.
- **Prerender** (`scripts/prerender.mjs`, runs post-build): stamps per-lesson
  `dist/<slug>/index.html` with unique head + LearningResource JSON-LD, adds
  WebSite+Course JSON-LD to the homepage, emits `sitemap.xml`. Vercel serves the
  static files before the SPA rewrite — no SSR.
- Lesson metadata (+ new per-lesson descriptions) extracted to `meta.json`,
  shared by app, prerenderer, and sitemap. Added `robots.txt`.
- **Canonical host fixed**: everything now on `https://www.synth.cool` (the apex
  307s to www, so the old canonical pointed at a redirect).

## 2026-07-18 (Signal Chain Lab — #24)
- New **Patching** section (course finale; #25/#26 will join it) with Lab: Signal
  Chain — a semi-modular synth: filter joins the chain as a module (`FilterEffect`),
  five reorderable/bypassable slots, and an **LFO destination selector**
  (pitch / cutoff / volume / delay time), MS-20 style.
- Routing under the hood: pitch vibrato rides each voice's own LFO (already
  live-updatable); the other targets patch a shared LFO's depth gain into exposed
  AudioParams (`FilterEffect.cutoffParam`, `FeedbackDelay.timeParam`, rack gain).
- Verified all four cables on one held note: cutoff sweep (brightness 2.3↔19.3),
  tremolo (RMS 0.105↔0.227), vibrato (period 289↔410), delay warble (151↔374);
  filter-before vs -after distortion audibly differs (51 vs 34); bypass live.

## 2026-07-18 (Noise & percussion — #20)
- New `noise.ts` (cached white/pink buffers — Paul Kellet pink filter) and `drums.ts`
  (one-shot kick/snare/hat; params read at trigger time).
- New Shaping lesson "Noise & percussion" (slug `percussion`, before Synth Lab):
  white/pink explorer + Z/X/C/V drum pads with per-drum sliders. The kick teaches
  envelope→pitch routing (sine dive).
- Verified: pink tilts low-vs-high band +8.5 dB (white −0.4); closed vs open hat
  tails distinct; kick pitch slider audibly changes hits.

## 2026-07-18 (Effects module + sectioned curriculum)
- Curriculum now has sections — Basics / Shaping / Effects — each ending in a **lab**
  (Wave Builder, Synth Lab, FX Rack). Grouped sidebar, per-section numbering, LAB
  badges; slugs unchanged.
- New `effects.ts`: FeedbackDelay, Chorus, Distortion (tanh waveshaper), Reverb
  (generated IR) — uniform input/output + live setters. `Voice`/`Tone` take an
  optional destination node so sources can feed effect chains.
- Four new lessons (delay, chorus/flanger, distortion, reverb) + **Lab: FX Rack**
  (keyboard synth → reorderable, toggleable pedalboard with live chain chips).
- Verified in-browser: echoes circulate ~2.5 s after source stops (fb 0.85); chorus
  depth 0→8 ms raises RMS spread 13×; flanger comb sweeps; drive 1→40 lifts sine
  brightness 3.9→28; reverb tails scale with size; rack rewire + order swap audible.

## 2026-07-18 (UX: live-reactive controls, part 2 — dead effects)
- User repro: Lesson 5 cutoff/resonance did nothing until stop/restart. Root cause:
  `$effect` bodies guarded by a null node read no state on their first run → zero
  deps → never rerun. Fixed lessons 5, 6, and the new lesson-4 effect by reading
  params before the guard (see knowledge.md).
- Also fixed a latent Lesson 6 crash: mode switch *while playing* self-retriggered
  the rebuild effect (stop/start read + replace `analyser` $state) until Svelte
  killed the effect tree. Now `untrack(restart)`.
- Verified in-browser: L5 cutoff/resonance/type live mid-play; L6 vibrato depth,
  tremolo depth/rate live + mode switches while playing; L4 sustain/release mid-hold.

## 2026-07-18 (UX: live-reactive controls)
- `Voice.update(cfg)`: sliders now modulate *sounding* notes — filter cutoff/resonance/
  type, waveform, detune, LFO rate/depth via `setTargetAtTime`; sustain retargets after
  decay; release read at note-off. LFO always wired (depth 0 = silent) so raising depth
  mid-note works.
- Lessons 3/4/8 push control changes to active voices via one `$effect` each.
- Verified end-to-end in-browser (held note + real slider events, master-analyser
  time-domain metrics); byte/float FFT spectra are leakage-limited — see knowledge.md.
- Added `.claude/launch.json` (dev preview) + project verify skill; ignored `.claude/worktrees`.

## 2026-05-23 (SEO / social meta — #14)
- Added Open Graph + Twitter Card meta, canonical, theme-color to `index.html`.
- New `public/` assets: SVG favicon, PWA icons (192/512/180), 1200×630 OG image.
- `site.webmanifest` (installable; **no service worker** — metadata only, by design).
- `scripts/gen-assets.mjs` generates the PNGs via Node `zlib` (no image dep); `npm run gen:assets`.

## 2026-05-23 (agents hand-off)
- Filed backlog issues #4–#10; added BACKLOG dependency notes (#5 → #4).
- Added lean AGENTS.md (indexes docs/, defines doc-update policy) + CLAUDE.md import.
- Trimmed README to visitor-facing; moved contributor detail to AGENTS.md.

## 2026-05-23 (later)
- Shipped: PR #1 (full app) merged; README + GitHub Actions CI added.
- Custom domain synth.cool connected via Vercel nameservers.
- PR #2 merged — mobile audio fixes (iOS mute-switch, WebKit unlock) + button long-press fix.
- Confirmed audio works on iOS.

## 2026-05-23
- Initialized repo, docs (PLAN/STATUS/TASKS/WORKLOG/decisions/knowledge).
- Began project scaffold.
