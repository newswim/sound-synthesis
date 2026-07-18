# Work Log

_Append-only. Newest at top. One short entry per work session._

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
