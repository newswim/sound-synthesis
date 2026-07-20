<script lang="ts">
  import { onDestroy } from 'svelte';
  import LessonScaffold from '../lib/components/LessonScaffold.svelte';
  import Slider from '../lib/components/Slider.svelte';
  import WaveformPicker from '../lib/components/WaveformPicker.svelte';
  import Keyboard from '../lib/components/Keyboard.svelte';
  import Oscilloscope from '../lib/components/Oscilloscope.svelte';
  import SpectrumAnalyzer from '../lib/components/SpectrumAnalyzer.svelte';
  import { getAudioContext, getMasterBus, now } from '../lib/audio/context';
  import { FeedbackDelay, Chorus, Distortion, Reverb, FilterEffect, type Effect } from '../lib/audio/effects';
  import { createLfo } from '../lib/audio/lfo';
  import { Voice, type VoiceConfig } from '../lib/audio/voice';
  import type { Waveform } from '../lib/audio/oscillator';

  interface Props {
    step: number;
    total: number;
    section: string;
  }
  let { step, total, section }: Props = $props();

  type UnitKey = 'filter' | 'distortion' | 'delay' | 'chorus' | 'reverb';
  type ModDest = 'pitch' | 'cutoff' | 'volume' | 'delay';
  const NAMES: Record<UnitKey, string> = {
    filter: 'Filter',
    distortion: 'Distortion',
    delay: 'Delay',
    chorus: 'Chorus',
    reverb: 'Reverb',
  };
  const DESTS: { value: ModDest; label: string }[] = [
    { value: 'pitch', label: 'Pitch' },
    { value: 'cutoff', label: 'Cutoff' },
    { value: 'volume', label: 'Volume' },
    { value: 'delay', label: 'Delay time' },
  ];

  const ctx = getAudioContext();
  const rackIn = ctx.createGain();
  const rackOut = ctx.createGain(); // volume-modulation target
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  rackOut.connect(analyser);
  analyser.connect(getMasterBus());

  const filterUnit = new FilterEffect('lowpass', 2200, 2);
  const delayUnit = new FeedbackDelay(0.3, 0.4, 0.35);
  const units: Record<UnitKey, Effect> = {
    filter: filterUnit,
    distortion: new Distortion(10, 1),
    delay: delayUnit,
    chorus: new Chorus(0.8, 0.004, 0.018, 0, 0.5),
    reverb: new Reverb(2, 3, 0.35),
  };
  const lfo = createLfo(3, 0);
  lfo.start();

  let order = $state<UnitKey[]>(['filter', 'distortion', 'delay', 'chorus', 'reverb']);
  let enabled = $state<Record<UnitKey, boolean>>({
    filter: true,
    distortion: false,
    delay: false,
    chorus: false,
    reverb: false,
  });

  let cutoff = $state(2200);
  let resonance = $state(2);
  let xDrive = $state(10);
  let xMix = $state(1);
  let dTime = $state(0.3);
  let dFeedback = $state(0.4);
  let dMix = $state(0.35);
  let cRate = $state(0.8);
  let cDepth = $state(4);
  let cMix = $state(0.5);
  let rSize = $state(2);
  let rMix = $state(0.35);

  let modDest = $state<ModDest>('pitch');
  let lfoRate = $state(3);
  let lfoDepth = $state(0); // percent 0..100

  // Rewire the chain when order/enables change (units persist, cables move).
  $effect(() => {
    const chain = order.filter((k) => enabled[k]).map((k) => units[k]);
    rackIn.disconnect();
    for (const u of Object.values(units)) u.output.disconnect();
    let prev: AudioNode = rackIn;
    for (const u of chain) {
      prev.connect(u.input);
      prev = u.output;
    }
    prev.connect(rackOut);
  });

  // Patch the LFO into the selected destination. Pitch rides each voice's own
  // LFO (see cfg()); the other targets get the shared LFO's depth output.
  $effect(() => {
    const [dest, rate, pct] = [modDest, lfoRate, lfoDepth];
    lfo.osc.frequency.setTargetAtTime(rate, now(), 0.02);
    lfo.depth.disconnect();
    if (dest === 'cutoff') {
      lfo.depth.gain.value = pct * 30; // ±3 kHz at 100%
      lfo.depth.connect(filterUnit.cutoffParam);
    } else if (dest === 'volume') {
      lfo.depth.gain.value = pct * 0.006; // ±0.6 at 100%
      lfo.depth.connect(rackOut.gain);
    } else if (dest === 'delay') {
      lfo.depth.gain.value = pct * 0.0002; // ±20 ms at 100%
      lfo.depth.connect(delayUnit.timeParam);
    }
  });

  // Live unit params.
  $effect(() => {
    filterUnit.cutoff = cutoff;
    filterUnit.resonance = resonance;
  });
  $effect(() => {
    const u = units.distortion as Distortion;
    u.drive = xDrive;
    u.mix = xMix;
  });
  $effect(() => {
    delayUnit.time = dTime;
    delayUnit.feedback = dFeedback;
    delayUnit.mix = dMix;
  });
  $effect(() => {
    const u = units.chorus as Chorus;
    u.rate = cRate;
    u.depth = cDepth / 1000;
    u.mix = cMix;
  });
  $effect(() => {
    const u = units.reverb as Reverb;
    u.seconds = rSize;
    u.mix = rMix;
  });

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    order = next;
  }

  let waveform = $state<Waveform>('sawtooth');
  const voices = new Map<number, Voice>();
  function cfg(): VoiceConfig {
    return {
      waveform,
      detune: 0,
      filterType: 'lowpass',
      cutoff: 18000, // per-voice filter wide open; the chain's filter does the work
      resonance: 0.7,
      env: { attack: 0.01, decay: 0.25, sustain: 0.5, release: 0.4 },
      lfoRate,
      lfoDepth: modDest === 'pitch' ? lfoDepth * 0.4 : 0, // ±40 Hz at 100%
    };
  }
  function noteOn(midi: number) {
    if (voices.has(midi)) return;
    const v = new Voice(midi, cfg(), rackIn);
    v.start();
    voices.set(midi, v);
  }
  function noteOff(midi: number) {
    voices.get(midi)?.stop();
    voices.delete(midi);
  }
  $effect(() => {
    const c = cfg();
    voices.forEach((v) => v.update(c));
  });

  const chainChips = $derived(['Synth', ...order.filter((k) => enabled[k]).map((k) => NAMES[k]), 'Out']);

  onDestroy(() => {
    voices.forEach((v) => v.stop());
    voices.clear();
    lfo.stop();
    Object.values(units).forEach((u) => u.dispose());
    rackIn.disconnect();
    rackOut.disconnect();
    analyser.disconnect();
  });
</script>

<LessonScaffold {step} {total} {section} title="Lab: Signal Chain" subtitle="The LFO gets a patch cable, and where you plug it in changes everything.">
  {#snippet intro()}
    <p>
      This is a <strong>semi-modular synth</strong>: the modules are fixed, but you choose the
      order, what's active, and where the modulation goes. The filter now sits in the chain like
      any other module, so "filter before the distortion, or after?" is your decision too.
    </p>
    <p>
      The interesting control is the LFO's destination. Plug it into pitch and you get vibrato.
      Into cutoff, an automatic wah. Into volume, tremolo. Into the delay's time, tape warble.
      Same LFO, same rate, same depth — four different effects, decided entirely by where the
      cable lands. Every modular synthesizer ever built runs on this one idea.
    </p>
  {/snippet}

  {#snippet demo()}
    <div class="flex flex-wrap items-center gap-2 font-mono text-xs">
      {#each chainChips as chip, i (i)}
        <span class="rounded-md border border-[var(--color-edge)] bg-[var(--color-panel-2)] px-2.5 py-1 text-[var(--color-accent)]">{chip}</span>
        {#if i < chainChips.length - 1}<span class="text-[var(--color-muted)]">→</span>{/if}
      {/each}
    </div>

    <div class="mt-4 rounded-lg border border-[var(--color-accent-2)]/40 bg-[var(--color-panel-2)] p-3">
      <p class="mb-2 text-xs font-semibold tracking-wide text-[var(--color-accent-2)] uppercase">LFO → destination</p>
      <div class="flex flex-wrap items-center gap-3">
        <div class="inline-flex rounded-lg border border-[var(--color-edge)] bg-[var(--color-panel)] p-1">
          {#each DESTS as d (d.value)}
            <button
              onclick={() => (modDest = d.value)}
              class="rounded-md px-2.5 py-1 text-xs font-medium transition"
              style={modDest === d.value ? 'background:var(--color-accent-2);color:#160b2e' : 'color:var(--color-muted)'}
            >{d.label}</button>
          {/each}
        </div>
        <div class="grid min-w-56 flex-1 grid-cols-2 gap-3">
          <Slider label="Rate" bind:value={lfoRate} min={0.1} max={12} step={0.1} unit=" Hz" />
          <Slider label="Depth" bind:value={lfoDepth} min={0} max={100} step={1} unit="%" />
        </div>
      </div>
    </div>

    <div class="mt-4 grid gap-4 sm:grid-cols-2">
      {#each order as key, i (key)}
        <div class="rounded-lg border border-[var(--color-edge)] bg-[var(--color-panel-2)] p-3">
          <div class="flex items-center justify-between gap-2">
            <label class="flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)] select-none">
              <input type="checkbox" bind:checked={enabled[key]} class="accent-[var(--color-accent)]" />
              {NAMES[key]}
            </label>
            <div class="flex gap-1">
              <button
                class="rounded border border-[var(--color-edge)] px-2 py-0.5 text-xs text-[var(--color-muted)] disabled:opacity-30"
                disabled={i === 0}
                onclick={() => move(i, -1)}
                aria-label={`Move ${NAMES[key]} earlier`}
              >↑</button>
              <button
                class="rounded border border-[var(--color-edge)] px-2 py-0.5 text-xs text-[var(--color-muted)] disabled:opacity-30"
                disabled={i === order.length - 1}
                onclick={() => move(i, 1)}
                aria-label={`Move ${NAMES[key]} later`}
              >↓</button>
            </div>
          </div>
          <div class="mt-3 space-y-2" class:opacity-40={!enabled[key]}>
            {#if key === 'filter'}
              <Slider label="Cutoff" bind:value={cutoff} min={80} max={12000} step={1} format={(v) => (v >= 1000 ? `${(v / 1000).toFixed(2)} kHz` : `${v.toFixed(0)} Hz`)} />
              <Slider label="Resonance" bind:value={resonance} min={0.1} max={20} step={0.1} format={(v) => v.toFixed(1)} />
            {:else if key === 'distortion'}
              <Slider label="Drive" bind:value={xDrive} min={1} max={40} step={0.5} format={(v) => v.toFixed(1)} />
              <Slider label="Mix" bind:value={xMix} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} />
            {:else if key === 'delay'}
              <Slider label="Time" bind:value={dTime} min={0.05} max={1} step={0.005} format={(v) => `${(v * 1000).toFixed(0)} ms`} />
              <Slider label="Feedback" bind:value={dFeedback} min={0} max={0.9} step={0.01} format={(v) => v.toFixed(2)} />
              <Slider label="Mix" bind:value={dMix} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} />
            {:else if key === 'chorus'}
              <Slider label="Rate" bind:value={cRate} min={0.05} max={8} step={0.05} unit=" Hz" />
              <Slider label="Depth" bind:value={cDepth} min={0} max={10} step={0.1} format={(v) => `${v.toFixed(1)} ms`} />
              <Slider label="Mix" bind:value={cMix} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} />
            {:else}
              <Slider label="Size" bind:value={rSize} min={0.2} max={4} step={0.05} format={(v) => `${v.toFixed(2)} s`} />
              <Slider label="Mix" bind:value={rMix} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} />
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <Oscilloscope {analyser} label="Output" />
      <SpectrumAnalyzer {analyser} label="Output spectrum" maxFreq={8000} />
    </div>

    <div class="mt-5 flex flex-wrap items-center gap-4">
      <WaveformPicker bind:value={waveform} />
    </div>
    <div class="mt-4">
      <Keyboard startMidi={48} octaves={2} onNoteOn={noteOn} onNoteOff={noteOff} />
    </div>
  {/snippet}

  {#snippet tryThis()}
    <p>
      Hold a chord, point the LFO at cutoff, and set the rate low — around 0.3 Hz. The filter
      breathes. Snap the rate up to 6 Hz and it stutters instead. Now move the same cable to
      volume, then to delay time with the delay switched on, and listen to how much changes when
      nothing changed but the destination. Then revisit last section's question: filter after the
      distortion tames it; filter before gives the distortion more to chew on.
    </p>
  {/snippet}
</LessonScaffold>
