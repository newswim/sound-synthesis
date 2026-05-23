# Work Log

_Append-only. Newest at top. One short entry per work session._

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
