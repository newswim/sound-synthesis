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

<LessonScaffold {step} {total} {section} title="Pitch & frequency" subtitle="How note names map onto frequencies, and why octaves rhyme.">
  {#snippet intro()}
    <p>
      Musicians say C, D, E. A synth says 261.6 Hz. The bridge between the two is simple: each
      step up the keyboard multiplies the frequency by the same small ratio, and twelve steps —
      one <strong>octave</strong> — exactly doubles it.
    </p>
    <p>
      The note everyone tunes to is A4, at 440 Hz. One octave up, A5 is 880. One octave down, A3
      is 220. Because pitches multiply instead of adding, the same musical distance covers more
      hertz the higher you go.
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
      Play any key, then find the same letter one octave to the right. It sounds like the same
      note, somehow higher — your ear hears "double the frequency" as a kind of rhyme. Watch the
      readout while you climb: the hertz doubles every octave, even though your fingers move the
      same distance each time.
    </p>
  {/snippet}
</LessonScaffold>
