# Synth School

An interactive, step-by-step web app that teaches the fundamentals of **sound
synthesis** — visually and audibly. Built on the **raw Web Audio API** (no Tone.js)
so you work with the real primitives: `OscillatorNode`, `GainNode`, `BiquadFilterNode`,
`AnalyserNode`, and `PeriodicWave`.

Each lesson pairs a short explanation with a hands-on, sound-making demo and a
"try this" prompt. You finish by wiring the pieces together into a playable synth.

**Live: [synth.cool](https://synth.cool)**

## Curriculum

1. **What is sound?** — frequency & amplitude; a sine tone with a live oscilloscope and spectrum
2. **Waveforms** — sine / square / saw / triangle and their harmonic content
3. **Pitch & frequency** — Hz ↔ notes, octaves, A440; a playable on-screen keyboard
4. **Envelopes (ADSR)** — attack / decay / sustain / release; hold-to-play pad and presets
5. **Filters & EQ** — cutoff & resonance, with a filter-response curve beside the output spectrum
6. **Modulation** — LFO vibrato / tremolo, then FM synthesis
7. **Wavetables** — additive synthesis: build a wave from harmonic sliders
8. **Capstone: Synth Lab** — oscillator → filter → ADSR → output + a vibrato LFO, played from the keyboard

## Quick start

```bash
npm install
npm run dev
```

Open the printed URL. Audio stays silent until your first click or keypress (browser
autoplay policy) — press **Play** or hit a key to begin.

Built with Svelte 5 + Vite + TypeScript + Tailwind v4; a static SPA deployed on Vercel.

## Development

Contributing, or pointing an agent at this repo? See **[AGENTS.md](./AGENTS.md)** for
commands, architecture, conventions, and the docs/PR workflow. Project tracking and
accumulated knowledge live in [`docs/`](./docs).

## License

[MIT](./LICENSE) © Dan Minshew
