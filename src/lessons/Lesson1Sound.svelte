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

<LessonScaffold {step} {total} {section} title="What is sound?" subtitle="Two numbers describe every pure tone: how fast it wiggles, and how big the wiggle is.">
  {#snippet intro()}
    <p>
      Sound is air wiggling. A loudspeaker is a surface that pushes air back and forth, and your
      eardrum is a surface that gets pushed. The simplest possible wiggle is a
      <strong>sine wave</strong>: a perfectly smooth back-and-forth, over and over.
    </p>
    <p>
      Two numbers describe it completely. <strong>Frequency</strong> is how many wiggles happen
      each second, measured in hertz (Hz). We hear frequency as pitch.
      <strong>Amplitude</strong> is how big each wiggle is. We hear amplitude as loudness — the
      volume control on your phone is an amplitude control.
    </p>
    <p>
      Press play and move the sliders. The left graph is an <strong>oscilloscope</strong> — it
      draws the wiggle itself. The right one is a <strong>spectrum</strong> — it shows which
      frequencies are inside the sound.
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
      frequency. Slide the frequency up and listen to the pitch climb while the wave squeezes
      together. Then pull the amplitude to zero. The wave flattens and the sound fades away, but
      notice what didn't change: the pitch. The two numbers really are independent — a wiggle can
      be fast and small, or slow and huge.
    </p>
  {/snippet}
</LessonScaffold>
