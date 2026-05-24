# Work Log

_Append-only. Newest at top. One short entry per work session._

## 2026-05-23 (unit tests — #10)
- Added Vitest + `npm test` script; CI now runs unit tests before type-check/build.
- Covered pure audio math: `midiToFreq`/`midiToName`/`freqToMidi` (A4=440, octave doubling,
  round-trips), `envelopePoints` (monotonic x, sustain levels, segment timing), `logFreqAxis`
  (bounds, strictly increasing, constant log ratio). 16 tests green.
- Skipped helpers needing a real AudioContext (`filterResponseDb`, `buildPeriodicWave`,
  ADSR `triggerAttack`/`triggerRelease`) — out of scope for node-only tests.

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
