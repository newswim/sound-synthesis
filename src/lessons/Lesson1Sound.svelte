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
    section: string;
  }
  let { step, total, section }: Props = $props();

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

<LessonScaffold {step} {total} {section} title="What is sound?" subtitle="Everything you will ever hear comes down to two numbers.">
  {#snippet intro()}
    <p>
      Sound is air moving. A loudspeaker is a surface that pushes air back and forth, and your
      eardrum is a surface that gets pushed. The simplest possible push is a
      <strong>sine wave</strong>: a perfectly smooth back-and-forth, repeated over and over.
    </p>
    <p>
      Two numbers describe it completely. <strong>Frequency</strong> is how many back-and-forths
      happen each second, measured in hertz (Hz). We hear frequency as pitch.
      <strong>Amplitude</strong> is how far the air moves on each push. We hear amplitude as
      loudness.
    </p>
    <p>
      Press play and move the sliders. The left graph is an <strong>oscilloscope</strong> — it
      draws the wave itself. The right one is a <strong>spectrum</strong> — it shows which
      frequencies the sound contains.
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
      A sine wave shows up in the spectrum as a single spike, because it contains exactly one
      frequency. Slide the frequency up and watch the wave squeeze together while the spike moves
      right. Then pull the amplitude to zero. The wave flattens and the sound fades out, but
      notice what didn't change: the pitch. The two numbers really are independent.
    </p>
  {/snippet}
</LessonScaffold>
