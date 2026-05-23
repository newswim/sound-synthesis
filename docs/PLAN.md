# Plan: Interactive Sound Synthesis Tutorial

## Context
Greenfield web app that teaches sound-synthesis fundamentals in a visual +
auditory, step-by-step way: waveforms, frequency/pitch, envelopes (ADSR),
filters/EQ, modulation (LFO/FM), wavetables/additive, and a capstone where the
learner wires components into a signal chain and plays them.

Confirmed decisions:
- **Audio:** raw Web Audio API (no Tone.js) — exposes the real primitives.
- **Stack:** Svelte 5 + Vite + TypeScript + Tailwind CSS (static SPA).
- **Scope:** full curriculum + capstone.
- **Deploy:** Vercel.

## Architecture
- `src/lib/audio/` — engine: `context` (singleton AudioContext + resume gate),
  `oscillator` (waveforms, note→freq, periodic waves), `envelope` (ADSR),
  `filter` (biquad + response sampling), `lfo`, `voice` (capstone voice).
- `src/lib/components/` — reusable UI: `Slider`, `WaveformPicker`, `Oscilloscope`,
  `SpectrumAnalyzer`, `EnvelopeGraph`, `FilterResponseGraph`, `Keyboard`,
  `PlayButton`, `LessonScaffold`.
- `src/lib/lessons/lessons.ts` — ordered lesson registry (single source of truth).
- `src/lessons/*.svelte` — one component per module.
- `App.svelte` — shell: sidebar nav + current lesson + Prev/Next, hash routing.

## Curriculum
1. What is sound? (amplitude/frequency, scope + spectrum)
2. Waveforms (sine/square/saw/triangle, harmonics)
3. Pitch & frequency (Hz↔notes, keyboard)
4. Envelopes / ADSR
5. Filters & EQ (cutoff, resonance, response curve)
6. Modulation (LFO vibrato/tremolo, FM)
7. Wavetables / additive (PeriodicWave)
8. Capstone: Synth Lab (osc→filter→ADSR→out + LFO + keyboard)

## Verification
- `npm run dev`: every lesson plays sound + visualizers animate; keyboard works.
- Autoplay gate: silent until first gesture, then audio works.
- `npm run build` + `npm run preview` clean.
- Deploy to Vercel, smoke-test live URL.

## Safeguards
- Conservative master gain + limiter.
- Stop/disconnect nodes on lesson change (no stuck voices).
- Svelte 5 runes for reactive demo state.
