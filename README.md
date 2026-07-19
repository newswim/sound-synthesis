# Synth School

An interactive, step-by-step web app that teaches the fundamentals of **sound
synthesis** — visually and audibly. Built on the **raw Web Audio API** (no Tone.js)
so you work with the real primitives: `OscillatorNode`, `GainNode`, `BiquadFilterNode`,
`DelayNode`, `ConvolverNode`, `WaveShaperNode`, `AnalyserNode`, and `PeriodicWave`.

Each lesson pairs a short explanation with a hands-on, sound-making demo and a
"try this" prompt. Every section ends in a **lab** that wires its concepts into
something playable, building toward a semi-modular synth you patch yourself.

**Live: [synth.cool](https://www.synth.cool)**

## Curriculum

### Basics
1. [What is sound?](https://www.synth.cool/) — frequency & amplitude; a sine tone with a live oscilloscope and spectrum
2. [Waveforms](https://www.synth.cool/waveforms) — sine / square / saw / triangle and their harmonic content
3. [Pitch & frequency](https://www.synth.cool/pitch) — Hz ↔ notes, octaves, A440; a playable on-screen keyboard
4. [**Lab: Wave Builder**](https://www.synth.cool/wavetables) — additive synthesis: build a wave from harmonic sliders

### Shaping
1. [Envelopes (ADSR)](https://www.synth.cool/envelopes) — attack / decay / sustain / release; hold-to-play pad and presets
2. [Filters & EQ](https://www.synth.cool/filters) — cutoff & resonance, with a filter-response curve beside the output spectrum
3. [Modulation](https://www.synth.cool/modulation) — LFO vibrato / tremolo, then FM synthesis
4. [Noise & percussion](https://www.synth.cool/percussion) — white/pink noise, then kick / snare / hats built from it
5. [**Lab: Synth Lab**](https://www.synth.cool/synth-lab) — oscillator → filter → ADSR → output + a vibrato LFO, played from the keyboard

### Effects
1. [Delay & feedback](https://www.synth.cool/delay) — echoes, slapback, and your first feedback loop
2. [Chorus & flanger](https://www.synth.cool/chorus) — one short delay, modulated by an LFO
3. [Distortion](https://www.synth.cool/distortion) — waveshaping: clipping *creates* harmonics
4. [Reverb](https://www.synth.cool/reverb) — convolution with generated impulse responses
5. [**Lab: FX Rack**](https://www.synth.cool/fx-rack) — a reorderable pedalboard; hear why effect order matters

### Patching
1. [**Lab: Signal Chain**](https://www.synth.cool/signal-chain) — a semi-modular synth: reorder the chain and patch the LFO to pitch, cutoff, volume, or delay time
2. [Sound Match](https://www.synth.cool/challenges) — ear-training challenges: recreate hidden patches by pitch, waveform, filter, and envelope

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
