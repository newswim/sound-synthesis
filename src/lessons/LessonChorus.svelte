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

<LessonScaffold {step} {total} {section} title="Chorus & flanger" subtitle="One short delay plus one slow LFO makes a whole family of effects.">
  {#snippet intro()}
    <p>
      Make a delay shorter than about 30 milliseconds and something odd happens: you stop hearing
      an echo. The copy fuses with the original into one thicker sound. Now point an LFO at the
      <em>delay time</em>. The copy drifts slightly sharp and flat as the delay stretches and
      shrinks, like a second player who can't quite hold the tuning. That shimmer is
      <strong>chorus</strong> — and it's why a choir sounds richer than one singer: nobody is
      perfectly in tune with anybody else.
    </p>
    <p>
      Shrink the delay further, down to a few milliseconds, and add feedback. Now the copy
      interferes with the original: some frequencies cancel, others pile up, in a comb pattern
      that crawls as the LFO moves. That sweep is a <strong>flanger</strong>. Same circuit,
      different settings.
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
      Load the chorus preset, then set the depth to zero and listen to the shimmer die — that's
      how much work the LFO was doing. Load the flanger preset and watch the spectrum while you
      listen: the notches sweep in time with the LFO. If this feels familiar, it should. It's the
      modulation lesson again, pointed at a new target.
    </p>
  {/snippet}
</LessonScaffold>
