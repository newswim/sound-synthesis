<script lang="ts">
  import { onDestroy } from 'svelte';
  import LessonScaffold from '../lib/components/LessonScaffold.svelte';
  import WaveformPicker from '../lib/components/WaveformPicker.svelte';
  import Keyboard from '../lib/components/Keyboard.svelte';
  import { Voice, type VoiceConfig } from '../lib/audio/voice';
  import { midiToFreq, midiToName, type Waveform } from '../lib/audio/oscillator';

  interface Props {
    step: number;
    total: number;
    section: string;
  }
  let { step, total, section }: Props = $props();

  let wave = $state<Waveform>('triangle');
  let last = $state<{ midi: number } | null>(null);

  const voices = new Map<number, Voice>();

  function cfg(): VoiceConfig {
    return {
      waveform: wave,
      detune: 0,
      filterType: 'lowpass',
      cutoff: 18000,
      resonance: 0.7,
      env: { attack: 0.01, decay: 0.15, sustain: 0.7, release: 0.3 },
      lfoRate: 0,
      lfoDepth: 0,
    };
  }

  function noteOn(midi: number) {
    if (voices.has(midi)) return;
    const v = new Voice(midi, cfg());
    v.start();
    voices.set(midi, v);
    last = { midi };
  }
  function noteOff(midi: number) {
    voices.get(midi)?.stop();
    voices.delete(midi);
  }
  // Waveform switch applies to held notes too.
  $effect(() => {
    const c = cfg();
    voices.forEach((v) => v.update(c));
  });

  onDestroy(() => {
    voices.forEach((v) => v.stop());
    voices.clear();
  });

  const readout = $derived(
    last
      ? `${midiToName(last.midi)} = ${midiToFreq(last.midi).toFixed(1)} Hz`
      : 'play a note…',
  );
</script>

<LessonScaffold {step} {total} {section} title="Pitch & frequency" subtitle="From hertz to musical notes — and why octaves feel like 'the same note, higher'.">
  {#snippet intro()}
    <p>
      Musicians name pitches with letters (C, D, E…) but a synth thinks in <strong>hertz</strong>.
      The bridge between them is simple: each step up the keyboard multiplies the frequency by a
      fixed ratio. Twelve of those steps — one <strong>octave</strong> — exactly
      <strong>double</strong> the frequency.
    </p>
    <p>
      The reference everyone tunes to is <strong>A4 = 440 Hz</strong>. So A5 is 880 Hz, A3 is
      220 Hz. Because the relationship is multiplicative, the same musical interval covers a bigger
      span of hertz the higher you go.
    </p>
  {/snippet}

  {#snippet demo()}
    <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
      <WaveformPicker bind:value={wave} />
      <span class="font-mono text-sm text-[var(--color-accent)]">{readout}</span>
    </div>
    <Keyboard startMidi={60} octaves={2} onNoteOn={noteOn} onNoteOff={noteOff} />
  {/snippet}

  {#snippet tryThis()}
    <p>
      Play a note, then play the same letter one octave up (e.g. the next C to the right). It sounds
      like "the same note" — because its frequency is exactly twice as high. Watch the readout: the
      hertz value doubles every octave, even though your fingers moved the same distance.
    </p>
  {/snippet}
</LessonScaffold>
