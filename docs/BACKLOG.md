# Backlog

_Running list of possible features/improvements. Filed items live as GitHub issues;
ideas below the line are candidates not yet filed. Keep it terse._

## Filed (GitHub issues)
- #4 — [Lesson] Filter envelope (cutoff ADSR)
- #5 — [Synth Lab] Second oscillator (mix + detune) + filter envelope — **depends on #4**
- #6 — [Synth Lab] Preset save/load + shareable patch URL
- #7 — [UX] Visible audio status / "tap to start" indicator
- #8 — [Cleanup] DPR-aware canvas rendering (crisp visualizers)
- #9 — [Cleanup] Shared segmented button-group component
- #10 — [Infra] Unit tests (Vitest) for audio math
- #14 — [Infra] Social/OG meta + favicon + PWA manifest for synth.cool

**Dependencies:** #5 → #4 (filter envelope must land first). All others are independent
and parallelizable. #6/#7 touch the Synth Lab / App shell respectively; coordinate if
worked alongside #5.

## Ideas (not yet filed)

### Lessons / content
- Noise & percussion (white/pink noise → hats/snares via envelope + filter)
- Effects: delay, reverb (`ConvolverNode`), waveshaper distortion, chorus
- Step sequencer / arpeggiator to hear patterns in motion
- Music-theory bridge: scales & chords on the keyboard

### Synth Lab
- Web MIDI input (play from a hardware MIDI keyboard)
- Velocity sensitivity + octave shift on the on-screen keyboard
- Effects send (delay/reverb) in the chain

### UX / accessibility
- `prefers-reduced-motion` + pause visualizers when tab hidden (battery/perf)
- Glossary / tooltips for jargon
- Optional light theme toggle
- Mobile layout polish for the dense Synth Lab
- Lesson progress tracking (localStorage)

### Cleanup / infra
- Proper `navigator.audioSession` typing via a `.d.ts` (drop inline cast)
- Keyboard drag-to-play (legato) + fix release when dragging across keys
- E2E smoke test (Playwright) loading each lesson
