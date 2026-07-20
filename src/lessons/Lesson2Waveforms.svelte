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
    section: string;
  }
  let { step, total, section }: Props = $props();

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

<LessonScaffold {step} {total} {section} title="Waveforms & timbre" subtitle="Same note, different character — a wave's shape is its tone colour.">
  {#snippet intro()}
    <p>
      Play the same note on a trumpet and a flute and nobody would confuse them. What's different
      is the shape of the wave. Musicians call this quality <strong>timbre</strong> — the colour
      of a sound.
    </p>
    <p>
      Here is the surprising part: any repeating shape can be built by stacking sine waves at
      multiples of the base pitch. Those extra sines are called <strong>harmonics</strong>, and
      the spectrum shows you exactly which ones a sound contains.
    </p>
    <p>
      Each of the four classic shapes has its own recipe. A sine is just the fundamental. A
      triangle adds odd harmonics that fade out quickly — it sounds soft and "hollow". A square's
      odd harmonics fade slowly, so it "buzzes" like a reed. And a saw has every harmonic — the
      brightest of the four, and the workhorse of synths.
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
      Play a note and switch between the four shapes. Listen to the brightness climb as you go
      sine, triangle, square, saw — and watch the spectrum grow from one lonely spike to a whole
      comb of them. More harmonics means a brighter sound. Keep that in mind, because most synths
      start with a bright wave and carve harmonics away with a filter. That's where this course is
      headed.
    </p>
  {/snippet}
</LessonScaffold>
