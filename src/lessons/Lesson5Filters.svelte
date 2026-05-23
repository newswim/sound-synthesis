<script lang="ts">
  import { onDestroy } from 'svelte';
  import LessonScaffold from '../lib/components/LessonScaffold.svelte';
  import Slider from '../lib/components/Slider.svelte';
  import PlayButton from '../lib/components/PlayButton.svelte';
  import SpectrumAnalyzer from '../lib/components/SpectrumAnalyzer.svelte';
  import FilterResponseGraph from '../lib/components/FilterResponseGraph.svelte';
  import { getAudioContext, getMasterBus } from '../lib/audio/context';
  import { FILTER_TYPES, type FilterType } from '../lib/audio/filter';

  interface Props {
    step: number;
    total: number;
  }
  let { step, total }: Props = $props();

  let playing = $state(false);
  let type = $state<FilterType>('lowpass');
  let cutoff = $state(1200);
  let resonance = $state(4);

  let osc: OscillatorNode | null = null;
  let filter: BiquadFilterNode | null = null;
  let gain: GainNode | null = null;
  let analyser = $state<AnalyserNode | null>(null);

  function toggle(p: boolean) {
    playing = p;
    p ? start() : stop();
  }

  function start() {
    const ctx = getAudioContext();
    osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 110;

    filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = cutoff;
    filter.Q.value = resonance;

    gain = ctx.createGain();
    gain.gain.value = 0.5;

    const a = ctx.createAnalyser();
    a.fftSize = 2048;
    analyser = a;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(a);
    a.connect(getMasterBus());
    osc.start();
  }

  function stop() {
    osc?.stop();
    osc?.disconnect();
    filter?.disconnect();
    gain?.disconnect();
    analyser?.disconnect();
    osc = filter = gain = null;
    analyser = null;
  }

  $effect(() => {
    if (filter) filter.type = type;
  });
  $effect(() => {
    if (filter) filter.frequency.setTargetAtTime(cutoff, getAudioContext().currentTime, 0.01);
  });
  $effect(() => {
    if (filter) filter.Q.setTargetAtTime(resonance, getAudioContext().currentTime, 0.01);
  });

  onDestroy(stop);
</script>

<LessonScaffold {step} {total} title="Filters & EQ" subtitle="Carve away harmonics to sculpt a bright wave into the tone you want.">
  {#snippet intro()}
    <p>
      We start with a harmonic-rich saw, then <strong>subtract</strong> from it. A
      <strong>filter</strong> lets some frequencies through and attenuates others. This
      "subtractive" approach is the heart of most classic synths.
    </p>
    <p>
      A <strong>low-pass</strong> keeps lows and rolls off highs (darker, the most common).
      A <strong>high-pass</strong> does the opposite (thinner). A <strong>band-pass</strong> keeps
      a slice around the cutoff. The <strong>cutoff</strong> is where it starts acting;
      <strong>resonance</strong> (Q) boosts a peak right at the cutoff — that vocal "wah".
    </p>
  {/snippet}

  {#snippet demo()}
    <div class="flex flex-wrap items-center gap-3">
      <PlayButton {playing} onToggle={toggle} />
      <div class="inline-flex rounded-lg border border-[var(--color-edge)] bg-[var(--color-panel-2)] p-1">
        {#each FILTER_TYPES as f (f.value)}
          <button
            onclick={() => (type = f.value)}
            class="rounded-md px-3 py-1.5 text-sm font-medium transition"
            style={type === f.value ? 'background:var(--color-accent);color:#04201b' : 'color:var(--color-muted)'}
          >{f.label}</button>
        {/each}
      </div>
    </div>
    <div class="mt-5 grid gap-4 sm:grid-cols-2">
      <Slider label="Cutoff" bind:value={cutoff} min={80} max={12000} step={1} format={(v) => (v >= 1000 ? `${(v / 1000).toFixed(2)} kHz` : `${v.toFixed(0)} Hz`)} />
      <Slider label="Resonance (Q)" bind:value={resonance} min={0.1} max={20} step={0.1} format={(v) => v.toFixed(1)} />
    </div>
    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <FilterResponseGraph {type} {cutoff} {resonance} />
      <SpectrumAnalyzer {analyser} label="Output spectrum" maxFreq={12000} />
    </div>
  {/snippet}

  {#snippet tryThis()}
    <p>
      Play the saw and slowly sweep <strong>cutoff</strong> down on a low-pass — hear it go from
      bright and buzzy to dark and muffled as harmonics are removed. Now crank
      <strong>resonance</strong> and sweep again: that whistling peak riding the cutoff is the
      sound of a thousand techno records. The left graph shows the filter's shape; the right shows
      which harmonics actually survive.
    </p>
  {/snippet}
</LessonScaffold>
