# Decision Record

_ADR-lite. Newest at top. Format: date · decision · why · alternatives._

## 2026-05-23 · Tailwind v4 via @tailwindcss/vite
Use Tailwind v4 with the Vite plugin (CSS-first config, no postcss/tailwind.config).
**Why:** current standard, less config. **Alt:** Tailwind v3 + postcss.

## 2026-05-23 · Hash-based nav, no router dependency
Lesson order lives in `lessons.ts`; navigation via a current-step store synced to
`location.hash`. **Why:** zero deps, deep links, trivial static deploy.
**Alt:** SvelteKit routing (heavier; not needed for a static SPA).

## 2026-05-23 · Raw Web Audio API (no Tone.js)
**Why:** the app teaches fundamentals — learners should see the real nodes.
**Alt:** Tone.js (faster to build, hides primitives).

## 2026-05-23 · Svelte 5 + Vite + TS
**Why:** reactive runes suit slider/visualizer-heavy UI; static build deploys easily.
**Alt:** vanilla JS (more manual), React (heavier for this).
