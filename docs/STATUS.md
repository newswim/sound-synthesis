# Status

_Mutable snapshot of where the project is. Keep it short — overwrite, don't append._

**Updated:** 2026-05-23

## Now
- **Shipped and live.** App deployed on Vercel; custom domain **synth.cool** active
  (HTTPS, www primary). Audio confirmed working on desktop and iOS.
- Backlog filed as issues #4–#10, #14; AGENTS.md/CLAUDE.md added for agent hand-off.
- Social/OG meta + favicon + PWA manifest shipped (#14).
- Vitest unit tests cover the pure audio-math helpers; CI now runs `npm test` + build (#10, PR open).

## Done
- All 8 lessons + audio engine + components + app shell (Svelte 5, Vite, TS, Tailwind v4).
- GitHub Actions CI (unit tests + type-check + build) on every PR; Vercel preview per PR.
- Vitest tests (#10): `midiToFreq`/`midiToName`/`freqToMidi`, `envelopePoints`, `logFreqAxis`.
- PR #1 (initial app) and PR #2 (mobile audio + button fixes) merged to `main`.
- Mobile fixes: iOS mute-switch (`audioSession='playback'`), WebKit gesture/silent-buffer
  unlock + `interrupted` recovery, no long-press text selection on buttons.

## Next
- Land #10 (unit tests), then optional polish / new lessons as desired.

## Blockers
- None.
