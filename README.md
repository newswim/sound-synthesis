# Synth School

An interactive, step-by-step web app that teaches the fundamentals of **sound
synthesis** — visually and audibly. Built on the **raw Web Audio API** (no
Tone.js) so you work with the real primitives: `OscillatorNode`, `GainNode`,
`BiquadFilterNode`, `AnalyserNode`, and `PeriodicWave`.

Each lesson pairs a short explanation with a hands-on, sound-making demo and a
"try this" prompt. You finish by wiring the pieces together into a playable synth.

## Curriculum

1. **What is sound?** — frequency & amplitude; a sine tone with a live oscilloscope and spectrum
2. **Waveforms** — sine / square / saw / triangle and their harmonic content
3. **Pitch & frequency** — Hz ↔ notes, octaves, A440; a playable on-screen keyboard
4. **Envelopes (ADSR)** — attack / decay / sustain / release; hold-to-play pad and presets
5. **Filters & EQ** — cutoff & resonance, with a filter-response curve beside the output spectrum
6. **Modulation** — LFO vibrato / tremolo, then FM synthesis
7. **Wavetables** — additive synthesis: build a wave from harmonic sliders
8. **Capstone: Synth Lab** — oscillator → filter → ADSR → output + a vibrato LFO, played from the keyboard

## Tech stack

- [Svelte 5](https://svelte.dev) + [Vite](https://vitejs.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- The native [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

It's a static SPA — no backend.

## Getting started

```bash
npm install
npm run dev      # start the dev server
```

Then open the printed local URL. Audio stays silent until your first click or
keypress (browser autoplay policy), then a tone plays — so press **Play** or hit
a key to begin.

Other scripts:

```bash
npm run check    # type-check (svelte-check)
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build locally
```

## Project structure

```
src/
├── App.svelte              # shell: sidebar nav, hash routing, master volume
├── lib/
│   ├── audio/              # the synthesis engine
│   │   ├── context.ts      # shared AudioContext, master bus + limiter, analyser tap
│   │   ├── oscillator.ts   # waveforms, note↔frequency, custom PeriodicWave
│   │   ├── envelope.ts     # ADSR scheduling
│   │   ├── filter.ts       # biquad filter + frequency-response sampling
│   │   ├── lfo.ts          # low-frequency oscillator
│   │   ├── voice.ts        # a playable voice: osc → filter → amp envelope
│   │   └── tone.ts         # simple continuous tone for the early lessons
│   ├── components/         # reusable UI (sliders, visualizers, keyboard, …)
│   └── lessons/lessons.ts  # ordered lesson registry (single source of truth)
└── lessons/                # one component per lesson
docs/                       # project tracking (PLAN/STATUS/TASKS/WORKLOG) and knowledge
```

## Deployment

Configured for [Vercel](https://vercel.com) via `vercel.json` (Vite preset →
`dist`, SPA fallback). With the Git integration connected, pushes deploy
automatically; previews are created for pull requests.

## A note on safety

A conservative master gain and a limiter sit on the output bus to guard against
harsh or loud sounds while you experiment. There's also a master volume slider in
the sidebar.
