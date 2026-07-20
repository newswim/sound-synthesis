<script lang="ts">
  import { onDestroy } from 'svelte';
  import LessonScaffold from '../lib/components/LessonScaffold.svelte';
  import Slider from '../lib/components/Slider.svelte';
  import WaveformPicker from '../lib/components/WaveformPicker.svelte';
  import Keyboard from '../lib/components/Keyboard.svelte';
  import Oscilloscope from '../lib/components/Oscilloscope.svelte';
  import SpectrumAnalyzer from '../lib/components/SpectrumAnalyzer.svelte';
  import EnvelopeGraph from '../lib/components/EnvelopeGraph.svelte';
  import FilterResponseGraph from '../lib/components/FilterResponseGraph.svelte';
  import { getMasterAnalyser } from '../lib/audio/context';
  import { Voice, type VoiceConfig } from '../lib/audio/voice';
  import { FILTER_TYPES, type FilterType } from '../lib/audio/filter';
  import type { Waveform } from '../lib/audio/oscillator';
  import type { ADSR } from '../lib/audio/envelope';

  interface Props {
    step: number;
    total: number;
    section: string;
  }
  let { step, total, section }: Props = $props();

  let waveform = $state<Waveform>('sawtooth');
  let filterType = $state<FilterType>('lowpass');
  let cutoff = $state(2200);
  let resonance = $state(6);
  let attack = $state(0.02);
  let decay = $state(0.3);
  let sustain = $state(0.5);
  let release = $state(0.5);
  let lfoRate = $state(5);
  let lfoDepth = $state(0);

  const env = $derived<ADSR>({ attack, decay, sustain, release });
  const analyser = getMasterAnalyser();
  const voices = new Map<number, Voice>();

  function cfg(): VoiceConfig {
    return { waveform, detune: 0, filterType, cutoff, resonance, env, lfoRate, lfoDepth };
  }
  function noteOn(midi: number) {
    if (voices.has(midi)) return;
    const v = new Voice(midi, cfg());
    v.start();
    voices.set(midi, v);
  }
  function noteOff(midi: number) {
    voices.get(midi)?.stop();
    voices.delete(midi);
  }
  // Push control edits to already-sounding voices.
  $effect(() => {
    const c = cfg();
    voices.forEach((v) => v.update(c));
  });
  onDestroy(() => {
    voices.forEach((v) => v.stop());
    voices.clear();
  });
</script>

<LessonScaffold {step} {total} {section} title="Lab: Synth Lab" subtitle="Everything from this section, wired into one playable instrument.">
  {#snippet intro()}
    <p>
      This is a real, if small, <strong>subtractive synth</strong>. Press a key and a voice is
      born; its signal flows through the chain below and out of your speakers. You've met every
      box already. This is the first time they're all connected.
    </p>
    <div class="my-3 flex flex-wrap items-center gap-2 font-mono text-xs">
      {#each ['Oscillator', 'Filter', 'Amp + ADSR', 'Output'] as node, i (node)}
        <span class="rounded-md border border-[var(--color-edge)] bg-[var(--color-panel-2)] px-2.5 py-1 text-[var(--color-accent)]">{node}</span>
        {#if i < 3}<span class="text-[var(--color-muted)]">→</span>{/if}
      {/each}
    </div>
    <p>An <strong>LFO</strong> on the side adds vibrato to the oscillator's pitch.</p>
  {/snippet}

  {#snippet demo()}
    <div class="grid gap-5 md:grid-cols-2">
      <div class="space-y-4">
        <div>
          <p class="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted)] uppercase">Oscillator</p>
          <WaveformPicker bind:value={waveform} />
        </div>
        <div>
          <p class="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted)] uppercase">Filter</p>
          <div class="inline-flex rounded-lg border border-[var(--color-edge)] bg-[var(--color-panel-2)] p-1">
            {#each FILTER_TYPES as f (f.value)}
              <button onclick={() => (filterType = f.value)} class="rounded-md px-2.5 py-1 text-xs font-medium" style={filterType === f.value ? 'background:var(--color-accent);color:#04201b' : 'color:var(--color-muted)'}>{f.label}</button>
            {/each}
          </div>
          <div class="mt-3 space-y-3">
            <Slider label="Cutoff" bind:value={cutoff} min={80} max={12000} step={1} format={(v) => (v >= 1000 ? `${(v / 1000).toFixed(2)} kHz` : `${v.toFixed(0)} Hz`)} />
            <Slider label="Resonance" bind:value={resonance} min={0.1} max={20} step={0.1} format={(v) => v.toFixed(1)} />
          </div>
          <div class="mt-3"><FilterResponseGraph type={filterType} {cutoff} {resonance} height={110} /></div>
        </div>
      </div>

      <div class="space-y-4">
        <div>
          <p class="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted)] uppercase">Amp envelope</p>
          <EnvelopeGraph {env} height={110} />
          <div class="mt-3 grid grid-cols-2 gap-3">
            <Slider label="Attack" bind:value={attack} min={0.001} max={2} step={0.001} format={(v) => `${(v * 1000).toFixed(0)} ms`} />
            <Slider label="Decay" bind:value={decay} min={0.001} max={2} step={0.001} format={(v) => `${(v * 1000).toFixed(0)} ms`} />
            <Slider label="Sustain" bind:value={sustain} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} />
            <Slider label="Release" bind:value={release} min={0.001} max={3} step={0.001} format={(v) => `${(v * 1000).toFixed(0)} ms`} />
          </div>
        </div>
        <div>
          <p class="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted)] uppercase">Vibrato LFO</p>
          <div class="grid grid-cols-2 gap-3">
            <Slider label="Rate" bind:value={lfoRate} min={0.1} max={12} step={0.1} unit=" Hz" />
            <Slider label="Depth" bind:value={lfoDepth} min={0} max={30} step={0.5} unit=" Hz" />
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-2">
      <Oscilloscope {analyser} label="Output" />
      <SpectrumAnalyzer {analyser} label="Output spectrum" maxFreq={10000} />
    </div>

    <div class="mt-6">
      <Keyboard startMidi={48} octaves={2} onNoteOn={noteOn} onNoteOff={noteOff} />
    </div>
  {/snippet}

  {#snippet tryThis()}
    <p>
      Make a bass: saw wave, cutoff around 600 Hz, short attack, low sustain. Now make a pad: slow
      attack, long release, higher cutoff, a little vibrato. Hold a chord and move the cutoff
      while it rings. Nearly every synthesizer you'll ever meet is some version of this chain —
      oscillator, filter, envelope — with more knobs.
    </p>
  {/snippet}
</LessonScaffold>
