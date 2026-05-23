<script lang="ts">
  import { onDestroy } from 'svelte';
  import LessonScaffold from '../lib/components/LessonScaffold.svelte';
  import Slider from '../lib/components/Slider.svelte';
  import PlayButton from '../lib/components/PlayButton.svelte';
  import Oscilloscope from '../lib/components/Oscilloscope.svelte';
  import SpectrumAnalyzer from '../lib/components/SpectrumAnalyzer.svelte';
  import { Tone } from '../lib/audio/tone';
  import { freqToMidi, midiToName } from '../lib/audio/oscillator';

  interface Props {
    step: number;
    total: number;
  }
  let { step, total }: Props = $props();

  const tone = new Tone();
  let playing = $state(false);
  let freq = $state(220);
  let amp = $state(0.4);

  $effect(() => {
    tone.frequency = freq;
  });
  $effect(() => {
    tone.amplitude = amp;
  });

  function toggle(p: boolean) {
    playing = p;
    p ? tone.start() : tone.stop();
  }

  onDestroy(() => tone.dispose());

  const note = $derived(midiToName(Math.round(freqToMidi(freq))));
</script>

<LessonScaffold {step} {total} title="What is sound?" subtitle="Two numbers describe every pure tone: how fast it wiggles, and how big the wiggle is.">
  {#snippet intro()}
    <p>
      Sound is a <strong>vibration</strong> travelling through the air. A loudspeaker pushes
      air back and forth; your eardrum feels those pressure changes. The simplest possible
      sound is a <strong>sine wave</strong> — a perfectly smooth back-and-forth.
    </p>
    <p>
      It has just two properties. <strong>Frequency</strong> (measured in hertz, Hz) is how
      many wiggles happen per second — this is what we hear as <em>pitch</em>.
      <strong>Amplitude</strong> is how big each wiggle is — this is what we hear as
      <em>loudness</em>.
    </p>
    <p>
      Press play, then move the sliders. Watch the <strong>oscilloscope</strong> (the shape of
      the wave over time) and the <strong>spectrum</strong> (which frequencies are present).
    </p>
  {/snippet}

  {#snippet demo()}
    <div class="flex flex-wrap items-center gap-4">
      <PlayButton {playing} onToggle={toggle} />
      <span class="font-mono text-sm text-[var(--color-muted)]">≈ {note}</span>
    </div>
    <div class="mt-5 grid gap-4 sm:grid-cols-2">
      <Slider label="Frequency" bind:value={freq} min={50} max={2000} step={1} unit=" Hz" />
      <Slider label="Amplitude" bind:value={amp} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} />
    </div>
    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <Oscilloscope analyser={tone.analyser} />
      <SpectrumAnalyzer analyser={tone.analyser} />
    </div>
  {/snippet}

  {#snippet tryThis()}
    <p>
      A pure sine shows a <strong>single spike</strong> in the spectrum — one frequency, nothing
      else. Raise the frequency: the wave on the left gets denser and the spike on the right
      slides upward. Drop the amplitude to zero — the shape flattens and the sound fades, but the
      pitch never changed. Pitch and loudness are independent.
    </p>
  {/snippet}
</LessonScaffold>
