<script lang="ts">
  import { onDestroy } from 'svelte';
  import LessonScaffold from '../lib/components/LessonScaffold.svelte';
  import Slider from '../lib/components/Slider.svelte';
  import PlayButton from '../lib/components/PlayButton.svelte';
  import WaveformPicker from '../lib/components/WaveformPicker.svelte';
  import Oscilloscope from '../lib/components/Oscilloscope.svelte';
  import SpectrumAnalyzer from '../lib/components/SpectrumAnalyzer.svelte';
  import { getAudioContext, getMasterBus } from '../lib/audio/context';
  import { Distortion } from '../lib/audio/effects';
  import { Tone } from '../lib/audio/tone';
  import type { Waveform } from '../lib/audio/oscillator';

  interface Props {
    step: number;
    total: number;
    section: string;
  }
  let { step, total, section }: Props = $props();

  let playing = $state(false);
  let wave = $state<Waveform>('sine');
  let freq = $state(110);
  let drive = $state(8);
  let mix = $state(1);

  const fx = new Distortion(8, 1);
  const analyser = getAudioContext().createAnalyser();
  analyser.fftSize = 2048;
  fx.output.connect(analyser);
  analyser.connect(getMasterBus());

  const tone = new Tone(fx.input);
  tone.frequency = 110;

  $effect(() => {
    tone.waveform = wave;
  });
  $effect(() => {
    tone.frequency = freq;
  });
  $effect(() => {
    fx.drive = drive;
  });
  $effect(() => {
    fx.mix = mix;
  });

  function toggle(p: boolean) {
    playing = p;
    p ? tone.start() : tone.stop();
  }

  onDestroy(() => {
    tone.dispose();
    fx.dispose();
    analyser.disconnect();
  });
</script>

<LessonScaffold {step} {total} {section} title="Distortion" subtitle="Filters take harmonics away. Distortion makes new ones.">
  {#snippet intro()}
    <p>
      Every effect so far has left the wave's shape alone. Distortion changes the shape directly.
      A <strong>waveshaper</strong> pushes each sample through a curve, and the <strong>drive</strong>
      control steepens that curve until the wave's peaks flatten against the ceiling. The
      flattening is called <strong>clipping</strong> — it's the sound of an amplifier pushed past
      what it can handle.
    </p>
    <p>
      Watch what this does to a pure sine. A flattened sine isn't a sine anymore, and a changed
      shape means changed harmonics: a ladder of new ones appears in the spectrum, and the sound
      creeps toward a square wave. Filters subtract harmonics. Distortion manufactures them.
    </p>
  {/snippet}

  {#snippet demo()}
    <div class="flex flex-wrap items-center gap-4">
      <PlayButton {playing} onToggle={toggle} />
      <WaveformPicker bind:value={wave} />
    </div>
    <div class="mt-5 grid gap-4 sm:grid-cols-3">
      <Slider label="Frequency" bind:value={freq} min={50} max={400} step={1} unit=" Hz" />
      <Slider label="Drive" bind:value={drive} min={1} max={40} step={0.5} format={(v) => v.toFixed(1)} />
      <Slider label="Mix" bind:value={mix} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} />
    </div>
    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <Oscilloscope {analyser} label="Shaped wave" />
      <SpectrumAnalyzer {analyser} label="Harmonics created" maxFreq={6000} />
    </div>
  {/snippet}

  {#snippet tryThis()}
    <p>
      Play a sine at drive 1: one spike. Sweep the drive to 40 and watch the scope square off
      while the spectrum grows teeth. Feed it a saw instead and it snarls — rich input, richer
      output. Then pull the mix back to about 0.3: clean sound underneath, grit on top. Engineers
      call that parallel distortion, and it's on more records than you might guess.
    </p>
  {/snippet}
</LessonScaffold>
