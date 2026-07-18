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

<LessonScaffold {step} {total} {section} title="Distortion" subtitle="Bend the wave itself — clipping doesn't remove harmonics, it invents them.">
  {#snippet intro()}
    <p>
      Every effect so far worked <em>around</em> the wave. Distortion reshapes the wave itself: a
      <strong>waveshaper</strong> maps each incoming sample through a curve. A gentle curve barely
      changes the shape; <strong>drive</strong> steepens it until the peaks flatten off —
      <strong>clipping</strong>, the overloaded-amplifier sound.
    </p>
    <p>
      Here's the deep part: filters (Shaping) <em>subtract</em> harmonics, but changing a wave's
      shape <em>adds</em> them. Feed in a pure sine — one lonely spectrum spike — and crank the
      drive: the flattened sine sprouts a whole ladder of new odd harmonics, morphing toward a
      square wave. Distortion is a harmonic generator.
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
      Play a <strong>sine</strong> at drive 1 — one spike. Sweep drive to 40 and watch the scope
      square off while the spectrum grows a comb of odd harmonics out of nothing. Switch to a saw:
      already-rich input distorts into something snarling. Pull <strong>mix</strong> back to ~0.3
      for "parallel drive" — the clean tone underneath, grit blended on top, a classic mixing
      trick.
    </p>
  {/snippet}
</LessonScaffold>
