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
- #16 — [UX] Controls modulate sounding audio (live-reactive sliders)
- #18 — [Curriculum] Effects module + sectioned curriculum (labs per section)
- #20 — [Lesson] Noise & percussion (kick/snare/hats from noise + envelopes)
- #21 — [Lesson] AM & ring modulation
- #22 — [Lesson] Karplus-Strong plucked string (AudioWorklet)
- #23 — [Feature] Step sequencer / arpeggiator (lookahead scheduling)
- #24 — [Feature] Semi-modular rack (Signal Chain Lab)
- #25 — [Feature] Free-patch playground (node canvas) — **depends on #24**
- #26 — [Feature] Sound-matching challenges (auto-scored via analyser)

**Dependencies:** #5 → #4 (filter envelope must land first); #25 → #24 (semi-modular
rack proves the routing UX before the cable canvas). All others are independent and
parallelizable. #6/#7 touch the Synth Lab / App shell respectively; coordinate if
worked alongside #5.

## Ideas (not yet filed)

### Lessons / content
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
