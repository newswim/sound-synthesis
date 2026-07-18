# Status

_Mutable snapshot of where the project is. Keep it short — overwrite, don't append._

**Updated:** 2026-07-18

## Now
- **Shipped and live** on Vercel at **synth.cool**; audio confirmed on desktop and iOS.
- In flight: UX pass #1 — controls now modulate *sounding* audio everywhere:
  lessons 3/4/8 via `Voice.update()`, lessons 5/6 dead-`$effect` fix, plus a Lesson 6
  mode-switch-while-playing crash fix (#16, PR open).

## Done
- All 8 lessons + audio engine + components + app shell (Svelte 5, Vite, TS, Tailwind v4).
- CI (type-check + build) on every PR; Vercel preview per PR.
- Mobile fixes (iOS mute-switch, WebKit unlock); #14 social/OG meta + PWA manifest.
- Live-reactive voice controls: cutoff/resonance/waveform/LFO/sustain apply to held
  notes; release read at note-off; LFO always wired so depth works from 0.

## Next
- File/land the reactive-controls PR; then further UX polish or backlog issues #4–#10.

## Blockers
- None.
