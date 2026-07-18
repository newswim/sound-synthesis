<script lang="ts">
  import { onDestroy } from 'svelte';
  import LessonScaffold from '../lib/components/LessonScaffold.svelte';
  import Slider from '../lib/components/Slider.svelte';
  import WaveformPicker from '../lib/components/WaveformPicker.svelte';
  import Keyboard from '../lib/components/Keyboard.svelte';
  import Oscilloscope from '../lib/components/Oscilloscope.svelte';
  import SpectrumAnalyzer from '../lib/components/SpectrumAnalyzer.svelte';
  import { getAudioContext, getMasterBus } from '../lib/audio/context';
  import { FeedbackDelay, Chorus, Distortion, Reverb, type Effect } from '../lib/audio/effects';
  import { Voice, type VoiceConfig } from '../lib/audio/voice';
  import type { Waveform } from '../lib/audio/oscillator';

  interface Props {
    step: number;
    total: number;
    section: string;
  }
  let { step, total, section }: Props = $props();

  type UnitKey = 'distortion' | 'delay' | 'chorus' | 'reverb';
  const NAMES: Record<UnitKey, string> = {
    distortion: 'Distortion',
    delay: 'Delay',
    chorus: 'Chorus',
    reverb: 'Reverb',
  };

  const ctx = getAudioContext();
  const rackIn = ctx.createGain();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.connect(getMasterBus());

  const units: Record<UnitKey, Effect> = {
    distortion: new Distortion(10, 1),
    delay: new FeedbackDelay(0.3, 0.4, 0.35),
    chorus: new Chorus(0.8, 0.004, 0.018, 0, 0.5),
    reverb: new Reverb(2, 3, 0.35),
  };

  let order = $state<UnitKey[]>(['distortion', 'delay', 'chorus', 'reverb']);
  let enabled = $state<Record<UnitKey, boolean>>({
    distortion: false,
    delay: false,
    chorus: false,
    reverb: false,
  });

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

  // Rewire the rack whenever order or enables change; the units persist,
  // only the patch cables between them move.
  $effect(() => {
    const chain = order.filter((k) => enabled[k]).map((k) => units[k]);
    rackIn.disconnect();
    for (const u of Object.values(units)) u.output.disconnect();
    let prev: AudioNode = rackIn;
    for (const u of chain) {
      prev.connect(u.input);
      prev = u.output;
    }
    prev.connect(analyser);
  });

  $effect(() => {
    const u = units.distortion as Distortion;
    u.drive = xDrive;
    u.mix = xMix;
  });
  $effect(() => {
    const u = units.delay as FeedbackDelay;
    u.time = dTime;
    u.feedback = dFeedback;
    u.mix = dMix;
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
      cutoff: 6000,
      resonance: 0.8,
      env: { attack: 0.005, decay: 0.25, sustain: 0.35, release: 0.35 },
      lfoRate: 0,
      lfoDepth: 0,
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
    Object.values(units).forEach((u) => u.dispose());
    rackIn.disconnect();
    analyser.disconnect();
  });
</script>

<LessonScaffold {step} {total} {section} title="Lab: FX Rack" subtitle="Every effect from this section on one pedalboard — and the order of the pedals is part of the sound.">
  {#snippet intro()}
    <p>
      A guitarist's pedalboard is a <strong>signal chain</strong>: the instrument feeds the first
      pedal, its output feeds the next, and so on to the amp. Here your synth feeds the four
      effects you just learned. Switch pedals on and off, tweak them <em>while notes ring</em>, and
      — the real lesson — <strong>reorder them</strong>.
    </p>
    <p>
      Order matters because effects don't commute: distorting a reverb-washed sound crushes the
      whole room into fizz, while reverberating a distorted sound puts a crunchy guitar <em>in</em>
      a room. There is no "correct" order — only choices with different sounds.
    </p>
  {/snippet}

  {#snippet demo()}
    <div class="flex flex-wrap items-center gap-2 font-mono text-xs">
      {#each chainChips as chip, i (i)}
        <span class="rounded-md border border-[var(--color-edge)] bg-[var(--color-panel-2)] px-2.5 py-1 text-[var(--color-accent)]">{chip}</span>
        {#if i < chainChips.length - 1}<span class="text-[var(--color-muted)]">→</span>{/if}
      {/each}
    </div>

    <div class="mt-5 grid gap-4 sm:grid-cols-2">
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
            {#if key === 'distortion'}
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
      Enable <strong>distortion and reverb</strong> and play a low note. Now move reverb
      <em>before</em> distortion — same two pedals, completely different animal. Build a dub echo:
      delay on, feedback 0.8, staccato notes, then ride the delay <strong>time</strong> while it
      regenerates. Finish with a lush pad: chorus + big reverb, saw chords, no distortion. You've
      gone from "what does each box do" to <strong>routing signals on purpose</strong> — which is
      what synthesis actually is.
    </p>
  {/snippet}
</LessonScaffold>
