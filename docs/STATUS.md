# Status

_Mutable snapshot of where the project is. Keep it short — overwrite, don't append._

**Updated:** 2026-05-23

## Now
- Full first build complete: docs, audio engine, components, all 8 lessons, app shell.
- `npm run check` and `npm run build` both clean; preview serves OK.

## Done
- Project scaffold (Vite 6 + Svelte 5 + TS + Tailwind v4).
- Audio engine: context (master bus + limiter + analyser tap), oscillator, envelope,
  filter, lfo, voice, tone.
- Components: Slider, WaveformPicker, PlayButton, Oscilloscope, SpectrumAnalyzer,
  EnvelopeGraph, FilterResponseGraph, Keyboard, LessonScaffold.
- Lessons 1–8 + sidebar nav with hash routing + master volume.

## Next
- Deploy to Vercel.
- Manual in-browser audio pass (not possible in headless CI).

## Blockers
- Live audio not verifiable in this headless env — needs a real browser to confirm sound.
