<script lang="ts">
  import { onDestroy } from 'svelte';
  import LessonScaffold from '../lib/components/LessonScaffold.svelte';
  import Slider from '../lib/components/Slider.svelte';
  import PlayButton from '../lib/components/PlayButton.svelte';
  import Oscilloscope from '../lib/components/Oscilloscope.svelte';
  import SpectrumAnalyzer from '../lib/components/SpectrumAnalyzer.svelte';
  import { getAudioContext, getMasterBus } from '../lib/audio/context';
  import { Chorus } from '../lib/audio/effects';
  import { Tone } from '../lib/audio/tone';

  interface Props {
    step: number;
    total: number;
    section: string;
  }
  let { step, total, section }: Props = $props();

  let playing = $state(false);
  let rate = $state(0.8);
  let depthMs = $state(4);
  let baseMs = $state(18);
  let feedback = $state(0);
  let mix = $state(0.5);

  const fx = new Chorus(0.8, 0.004, 0.018, 0, 0.5);
  const analyser = getAudioContext().createAnalyser();
  analyser.fftSize = 2048;
  fx.output.connect(analyser);
  analyser.connect(getMasterBus());

  const tone = new Tone(fx.input);
  tone.waveform = 'sawtooth';
  tone.frequency = 220;

  $effect(() => {
    fx.rate = rate;
  });
  $effect(() => {
    fx.depth = depthMs / 1000;
  });
  $effect(() => {
    fx.base = baseMs / 1000;
  });
  $effect(() => {
    fx.feedback = feedback;
  });
  $effect(() => {
    fx.mix = mix;
  });

  function toggle(p: boolean) {
    playing = p;
    p ? tone.start() : tone.stop();
  }
  function presetChorus() {
    baseMs = 18; depthMs = 4; rate = 0.8; feedback = 0; mix = 0.5;
  }
  function presetFlanger() {
    baseMs = 2.5; depthMs = 2; rate = 0.25; feedback = 0.75; mix = 0.5;
  }

  onDestroy(() => {
    tone.dispose();
    fx.dispose();
    analyser.disconnect();
  });
</script>

<LessonScaffold {step} {total} {section} title="Chorus & flanger" subtitle="A delay too short to hear as an echo, wobbled by an LFO — instant motion.">
  {#snippet intro()}
    <p>
      Shrink a delay below ~30 ms and you stop hearing an echo — the copy fuses with the original.
      Now point an <strong>LFO</strong> (Shaping, remember?) at the <em>delay time</em>: the copy
      drifts slightly sharp and flat as the delay stretches and shrinks, like a second player who
      can't quite stay in tune. That shimmer is <strong>chorus</strong>.
    </p>
    <p>
      Make the base delay <em>very</em> short (1–5 ms) and add <strong>feedback</strong>, and the
      copy interferes with the original — some frequencies cancel, others reinforce, in a moving
      comb pattern you can see in the spectrum. That jet-engine sweep is a <strong>flanger</strong>.
      Same circuit, different settings.
    </p>
  {/snippet}

  {#snippet demo()}
    <div class="flex flex-wrap items-center gap-3">
      <PlayButton {playing} onToggle={toggle} />
      <button class="rounded-lg border border-[var(--color-edge)] px-3 py-2 text-sm text-[var(--color-muted)]" onclick={presetChorus}>Chorus preset</button>
      <button class="rounded-lg border border-[var(--color-edge)] px-3 py-2 text-sm text-[var(--color-muted)]" onclick={presetFlanger}>Flanger preset</button>
    </div>
    <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Slider label="Base delay" bind:value={baseMs} min={1} max={30} step={0.5} format={(v) => `${v.toFixed(1)} ms`} />
      <Slider label="LFO rate" bind:value={rate} min={0.05} max={8} step={0.05} unit=" Hz" />
      <Slider label="LFO depth" bind:value={depthMs} min={0} max={10} step={0.1} format={(v) => `${v.toFixed(1)} ms`} />
      <Slider label="Feedback" bind:value={feedback} min={0} max={0.85} step={0.01} format={(v) => v.toFixed(2)} />
      <Slider label="Mix" bind:value={mix} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} />
    </div>
    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <Oscilloscope {analyser} />
      <SpectrumAnalyzer {analyser} maxFreq={8000} />
    </div>
  {/snippet}

  {#snippet tryThis()}
    <p>
      Start from the <strong>Chorus preset</strong> and set depth to 0 — the shimmer dies; that's
      how much work the LFO is doing. Switch to the <strong>Flanger preset</strong> and watch the
      spectrum: the comb's notches crawl up and down as the LFO sweeps. This lesson is modulation
      routing in disguise — the same LFO you pointed at pitch and volume before, now pointed at a
      delay line.
    </p>
  {/snippet}
</LessonScaffold>
