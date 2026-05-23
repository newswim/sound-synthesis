# AGENTS.md

Guidance for AI agents and contributors. Keep this file **lean** — it indexes the
deeper docs in [`docs/`](./docs) rather than restating them.

**Project:** Synth School — an interactive sound-synthesis tutorial (live:
<https://synth.cool>). Static SPA: **Svelte 5 + Vite + TypeScript + Tailwind v4**, on
the **raw Web Audio API** (no Tone.js — learners must see the real nodes).

## Commands
- `npm run dev` — dev server
- `npm run check` — type-check (svelte-check)
- `npm run build` — type-check **and** production build to `dist/` (CI runs this; must pass)
- `npm run preview` — serve the built app

## Layout
- `src/lib/audio/` — engine: `context` (AudioContext, master bus + limiter, analyser
  tap, iOS/mobile unlock), `oscillator`, `envelope`, `filter`, `lfo`, `voice`, `tone`.
- `src/lib/components/` — reusable UI (sliders, visualizers, keyboard, scaffold).
- `src/lib/lessons/lessons.ts` — ordered lesson registry (single source of truth).
- `src/lessons/*.svelte` — one component per lesson. `src/App.svelte` — shell + hash routing.

## Conventions
- Svelte 5 runes (`$state` / `$derived` / `$effect`); TypeScript strict.
- Terse code, minimal comments (only the non-obvious "why"); match the existing style.
- Reuse the audio engine + components; don't add dependencies without a clear reason.
- **Before touching audio**, read [`docs/knowledge.md`](./docs/knowledge.md) — iOS
  mute-switch / `audioSession`, gesture + silent-buffer unlock, exponential-ramp epsilon,
  `AnalyserNode` fftSize, node lifecycle.
- Stack/architecture rationale: [`docs/decisions.md`](./docs/decisions.md).

## Workflow
- Work from a GitHub issue. **One issue → one branch → one PR into `main`.**
- **Never push to `main` directly.** Rebase on `main` before pushing; keep PRs focused.
- CI (`build`) must be green; Vercel posts a preview per PR.
- Respect issue **dependencies** (tracked in [`docs/BACKLOG.md`](./docs/BACKLOG.md)) —
  e.g. #5 builds on #4. Don't start a blocked issue before its prerequisite merges.

## Docs — how & when to update
Docs are terse and live in [`docs/`](./docs). Update the relevant ones **in the same PR**
as your change:
- **STATUS.md** — overwrite to reflect current state (Now / Done / Next / Blockers). Every PR.
- **WORKLOG.md** — append one dated entry (newest on top) per work session/PR.
- **TASKS.md** — check off what you completed.
- **decisions.md** — add an entry when you make a non-obvious technical/architectural choice.
- **knowledge.md** — add when you learn a non-obvious gotcha worth not rediscovering.
- **BACKLOG.md** — keep in sync with issues; move an idea to "Filed" with its number when filed.
- **PLAN.md** — original design; historical, edit only on a major direction change.
