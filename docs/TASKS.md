# Tasks

## Setup
- [x] Project scaffold (Vite + Svelte 5 + TS + Tailwind)
- [x] App shell + sidebar nav + hash routing
- [x] Theme / base styles

## Audio engine
- [x] context.ts (singleton + resume gate + audioReady store)
- [x] oscillator.ts (waveforms, noteToFreq, buildPeriodicWave)
- [x] envelope.ts (ADSR scheduling)
- [x] filter.ts (biquad + response sampling)
- [x] lfo.ts
- [x] voice.ts

## Components
- [x] Slider
- [x] WaveformPicker
- [x] Oscilloscope
- [x] SpectrumAnalyzer
- [x] EnvelopeGraph
- [x] FilterResponseGraph
- [x] Keyboard
- [x] PlayButton
- [x] LessonScaffold

## Lessons
- [x] 1 What is sound?
- [x] 2 Waveforms
- [x] 3 Pitch & frequency
- [x] 4 Envelopes (ADSR)
- [x] 5 Filters & EQ
- [x] 6 Modulation (LFO/FM)
- [x] 7 Wavetables / additive
- [x] 8 Capstone: Synth Lab

## Ship
- [x] build + preview clean
- [x] Deploy to Vercel (live; custom domain synth.cool)
- [x] PR (#1 app, #2 mobile fixes — both merged)
- [x] GitHub Actions CI on each PR
- [x] Mobile audio working (iOS mute-switch fix)

## Infra
- [x] Unit tests (Vitest) for pure audio math + `npm test` in CI (#10)
