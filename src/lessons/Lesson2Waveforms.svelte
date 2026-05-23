<script lang="ts">
  import { onDestroy } from 'svelte';
  import LessonScaffold from '../lib/components/LessonScaffold.svelte';
  import Slider from '../lib/components/Slider.svelte';
  import PlayButton from '../lib/components/PlayButton.svelte';
  import WaveformPicker from '../lib/components/WaveformPicker.svelte';
  import Oscilloscope from '../lib/components/Oscilloscope.svelte';
  import SpectrumAnalyzer from '../lib/components/SpectrumAnalyzer.svelte';
  import { Tone } from '../lib/audio/tone';
  import type { Waveform } from '../lib/audio/oscillator';

  interface Props {
    step: number;
    total: number;
  }
  let { step, total }: Props = $props();

  const tone = new Tone();
  let playing = $state(false);
  let wave = $state<Waveform>('sawtooth');
  let freq = $state(150);

  $effect(() => {
    tone.waveform = wave;
  });
  $effect(() => {
    tone.frequency = freq;
  });

  function toggle(p: boolean) {
    playing = p;
    p ? tone.start() : tone.stop();
  }
  onDestroy(() => tone.dispose());
</script>

<LessonScaffold {step} {total} title="Waveforms & timbre" subtitle="Same pitch, different character — the wave's shape is its tone colour.">
  {#snippet intro()}
    <p>
      A sine is pure, but most sounds are richer. The <strong>shape</strong> of a repeating wave
      determines its <strong>timbre</strong> — why a trumpet and a flute playing the same note
      sound different.
    </p>
    <p>
      Any repeating shape is secretly a stack of sine waves at multiples of the base pitch, called
      <strong>harmonics</strong>. The recipe of harmonics is exactly what the spectrum shows:
    </p>
    <p>
      <strong>Sine</strong>: just the fundamental. <strong>Triangle</strong>: odd harmonics, fading
      fast — soft and hollow. <strong>Square</strong>: odd harmonics, fading slowly — buzzy and
      reedy. <strong>Saw</strong>: every harmonic — the brightest, the workhorse of synths.
    </p>
  {/snippet}

  {#snippet demo()}
    <div class="flex flex-wrap items-center gap-4">
      <PlayButton {playing} onToggle={toggle} />
      <WaveformPicker bind:value={wave} />
    </div>
    <div class="mt-5">
      <Slider label="Frequency" bind:value={freq} min={50} max={600} step={1} unit=" Hz" />
    </div>
    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <Oscilloscope analyser={tone.analyser} label="Wave shape" />
      <SpectrumAnalyzer analyser={tone.analyser} label="Harmonics" maxFreq={6000} />
    </div>
  {/snippet}

  {#snippet tryThis()}
    <p>
      Switch between the four shapes while it plays. Notice the sine has one lonely spike, while the
      saw has a tall comb of evenly-spaced harmonics. The more harmonics, the brighter the sound.
      Synthesizers usually start from a bright wave like saw or square, then <em>remove</em>
      harmonics with a filter — that's the next few lessons.
    </p>
  {/snippet}
</LessonScaffold>
