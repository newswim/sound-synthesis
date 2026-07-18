<script lang="ts">
  import { onDestroy } from 'svelte';
  import LessonScaffold from '../lib/components/LessonScaffold.svelte';
  import PlayButton from '../lib/components/PlayButton.svelte';
  import Oscilloscope from '../lib/components/Oscilloscope.svelte';
  import SpectrumAnalyzer from '../lib/components/SpectrumAnalyzer.svelte';
  import { Tone } from '../lib/audio/tone';
  import { buildPeriodicWave } from '../lib/audio/oscillator';

  interface Props {
    step: number;
    total: number;
    section: string;
  }
  let { step, total, section }: Props = $props();

  const N = 8;
  let amps = $state<number[]>([1, 0, 0, 0, 0, 0, 0, 0]);

  const tone = new Tone();
  let playing = $state(false);

  $effect(() => {
    // Rebuild the custom wave whenever a harmonic level changes.
    const wave = buildPeriodicWave(amps.map((a) => a));
    tone.periodicWave = wave;
  });

  function toggle(p: boolean) {
    playing = p;
    if (p) {
      tone.frequency = 160;
      tone.start();
    } else {
      tone.stop();
    }
  }

  function set(i: number, v: number) {
    amps[i] = v;
  }
  function preset(values: number[]) {
    amps = [...values];
  }
  // Approximations: saw ~ 1/n, square ~ odd 1/n, organ-ish drawbars.
  const sawP = Array.from({ length: N }, (_, i) => 1 / (i + 1));
  const squareP = Array.from({ length: N }, (_, i) => ((i % 2 === 0) ? 1 / (i + 1) : 0));
  const organP = [1, 0, 0.6, 0, 0.4, 0, 0, 0.3];

  onDestroy(() => tone.dispose());
</script>

<LessonScaffold {step} {total} {section} title="Lab: Wave Builder" subtitle="You've been reading harmonic recipes. Time to write one.">
  {#snippet intro()}
    <p>
      In the waveforms lesson you saw that every repeating shape is secretly a stack of sines.
      This lab runs that idea in reverse: you set the level of each harmonic yourself, and the
      browser builds the wave. This is <strong>additive synthesis</strong> — an idea older than
      electronics. Pipe organs did it with pipes.
    </p>
    <p>
      Each vertical slider is one harmonic. The first is the fundamental; the second vibrates
      twice as fast; and so on up to eight. Your recipe becomes a custom single-cycle wave — a
      small <strong>wavetable</strong> — and you can hear and see it change as you move the bars.
    </p>
  {/snippet}

  {#snippet demo()}
    <div class="flex flex-wrap items-center gap-3">
      <PlayButton {playing} onToggle={toggle} />
      <span class="text-sm text-[var(--color-muted)]">Presets:</span>
      <button class="rounded-lg border border-[var(--color-edge)] px-3 py-1.5 text-sm text-[var(--color-muted)]" onclick={() => preset(sawP)}>Saw</button>
      <button class="rounded-lg border border-[var(--color-edge)] px-3 py-1.5 text-sm text-[var(--color-muted)]" onclick={() => preset(squareP)}>Square</button>
      <button class="rounded-lg border border-[var(--color-edge)] px-3 py-1.5 text-sm text-[var(--color-muted)]" onclick={() => preset(organP)}>Organ</button>
      <button class="rounded-lg border border-[var(--color-edge)] px-3 py-1.5 text-sm text-[var(--color-muted)]" onclick={() => preset([1, 0, 0, 0, 0, 0, 0, 0])}>Sine</button>
    </div>

    <div class="mt-6 flex items-end justify-between gap-2" style="height:140px">
      {#each amps as a, i (i)}
        <div class="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <input
            class="harmonic"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={a}
            oninput={(e) => set(i, +(e.currentTarget as HTMLInputElement).value)}
            aria-label={`Harmonic ${i + 1}`}
          />
          <span class="font-mono text-[10px] text-[var(--color-muted)]">{i + 1}</span>
        </div>
      {/each}
    </div>

    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <Oscilloscope analyser={tone.analyser} label="Resulting wave" />
      <SpectrumAnalyzer analyser={tone.analyser} label="Harmonics you built" maxFreq={3000} />
    </div>
  {/snippet}

  {#snippet tryThis()}
    <p>
      Start from the Sine preset and slowly raise harmonic 2 — watch the shape bend as a second
      sine folds in. Load the Saw preset and compare it with the real saw from the waveforms
      lesson. Then break the rules on purpose: silence the fundamental and keep only harmonics
      five through eight. Nothing else in this course makes that sound — you just did.
    </p>
  {/snippet}
</LessonScaffold>

<style>
  .harmonic {
    writing-mode: vertical-lr;
    direction: rtl;
    width: 8px;
    height: 110px;
    padding: 0;
  }
</style>
