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
    section: string;
  }
  let { step, total, section }: Props = $props();

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

  // Read params before the null guard — $effect only tracks what a run actually reads,
  // so a guarded read while `filter` is null would leave the effect with no deps, dead.
  $effect(() => {
    const [t, hz, q] = [type, cutoff, resonance];
    if (!filter) return;
    filter.type = t;
    filter.frequency.setTargetAtTime(hz, getAudioContext().currentTime, 0.01);
    filter.Q.setTargetAtTime(q, getAudioContext().currentTime, 0.01);
  });

  onDestroy(stop);
</script>

<LessonScaffold {step} {total} {section} title="Filters & EQ" subtitle="Start with too many harmonics, then take some away.">
  {#snippet intro()}
    <p>
      The waveforms lesson ended with a promise: synths mostly work by starting bright and carving
      away. The carving tool is a <strong>filter</strong> — it lets some frequencies through and
      quiets the rest. Building sounds this way is called subtractive synthesis, and it's how most
      classic synthesizers work.
    </p>
    <p>
      A <strong>low-pass</strong> filter keeps the lows and rolls off the highs, which makes
      things darker. A <strong>high-pass</strong> does the opposite. A <strong>band-pass</strong>
      keeps only a slice in the middle. The <strong>cutoff</strong> sets where the filter starts
      working, and <strong>resonance</strong> boosts a narrow peak right at the cutoff — a sound
      you'll recognize the moment you hear it.
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
      Play the saw, then drag the cutoff down slowly and just listen. Bright and buzzy turns dark
      and muffled as harmonics disappear. Now raise the resonance and sweep again — that whistling
      edge riding the cutoff is one of the most recognizable sounds in electronic music. The left
      graph is the filter's shape; the right shows which harmonics survive it.
    </p>
  {/snippet}
</LessonScaffold>
