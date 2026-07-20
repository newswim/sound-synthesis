---
name: verify
description: Build, launch, and behaviorally verify Synth School audio changes in the browser.
---

# Verifying Synth School changes

## Launch
- `npm run build` must pass (CI gate), but verification is runtime: start the dev
  server via `.claude/launch.json` ("dev", port 5173) and drive the browser pane.
- Navigate by hash slug (`#/synth-lab`, `#/filters`, …) — slugs live in
  `src/lib/lessons/lessons.ts`. Clicking the sidebar also works.

## Audio unlock
- The AudioContext needs one **trusted** gesture: perform a real click anywhere
  (synthetic JS events don't count). After that, synthetic events are fine.

## Driving
- Hold a note: `window.dispatchEvent(new KeyboardEvent('keydown', {key:'a'}))`
  (Keyboard component maps A W S E D F …; keyup releases). Lesson 4 uses a
  pointer-held button instead.
- Move sliders through the real path: set `input.value` then dispatch
  `new Event('input', {bubbles:true})` — this triggers Svelte's `bind:value`.

## Observing (no ears needed)
- Same-module access to the live graph:
  `const m = await import('/src/lib/audio/context.ts')` in the page returns the
  app's own module instance → `m.getMasterAnalyser()` taps the real mix.
- **Don't trust FFT spectra for filter checks** — window-leakage floor ~-55 dB
  masks attenuation (see docs/knowledge.md). Use time-domain metrics:
  - brightness: RMS of the sample-to-sample derivative (saw ≈ 19, sine ≈ 4);
  - pitch/vibrato: samples-per-cycle from zero crossings (C3 ≈ 337 @ 44.1 kHz);
  - loudness: plain RMS.
- To introspect a `Voice`, patch the shared prototype:
  `vm = await import('/src/lib/audio/voice.ts')`, wrap `vm.Voice.prototype.update`
  to capture `this`. Beware stale captures — the ref updates only when update runs.

## Gotchas
- The user may be interacting with the main preview tab; run measurements in a
  fresh tab (`tabs_create`) as one atomic async script assigning to `window.__result`,
  then poll it — the JS tool does not await promises.
- **Background-tab timer throttling**: if the pane isn't foregrounded, `setTimeout`
  can be throttled to ~1/min, making wait-loop scripts look hung. For DOM-only
  scripts (clicks + reads, no audio timing), wait on microtasks instead — Svelte 5
  flushes on microtask: `for (let i = 0; i < 6; i++) await Promise.resolve();`.
  Audio measurements genuinely need wall-clock time; keep those scripts short and
  screenshot/interact first so the tab stays active.
