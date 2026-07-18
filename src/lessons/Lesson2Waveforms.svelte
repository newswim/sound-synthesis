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

<LessonScaffold {step} {total} {section} title="Waveforms & timbre" subtitle="Why a trumpet and a flute playing the same note still sound different.">
  {#snippet intro()}
    <p>
      A sine wave is the plainest sound there is. Most sounds are richer, and the difference is
      the shape of the wave. Shape is what makes a trumpet sound like a trumpet. Musicians call
      this quality <strong>timbre</strong>.
    </p>
    <p>
      Here is the surprising part: any repeating shape can be built by stacking sine waves at
      multiples of the base pitch. Those extra sines are called <strong>harmonics</strong>, and
      the spectrum shows you exactly which ones a sound contains.
    </p>
    <p>
      Each of the four classic shapes has its own recipe. Sine: just the fundamental. Triangle:
      odd harmonics that fade out quickly, so it sounds soft. Square: odd harmonics that fade
      slowly, so it buzzes. Saw: every harmonic, which makes it the brightest of the four.
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
      Play a note and switch between the four shapes. The sine has one lonely spike; the saw has a
      whole comb of them. More harmonics means a brighter sound. Keep that in mind, because most
      synthesizers work by starting with a bright wave and then carving harmonics away with a
      filter. That's where this course is headed.
    </p>
  {/snippet}
</LessonScaffold>
