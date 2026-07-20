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

<LessonScaffold {step} {total} {section} title="Lab: FX Rack" subtitle="Four effects, one synth, and a decision: what order?">
  {#snippet intro()}
    <p>
      A guitarist's pedalboard is a <strong>signal chain</strong>: instrument into the first
      pedal, that pedal into the next, and so on down the line. Here your synth feeds the four
      effects you just learned. Switch them on and off, tweak them while notes ring — and then
      try reordering them, because that's the real experiment.
    </p>
    <p>
      Order matters. Distorting a reverb crushes the whole room into fizz. Reverberating a
      distortion puts a crunchy guitar <em>inside</em> a room. Neither is wrong; they're simply
      different instruments, made from the same parts.
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
      Turn on distortion and reverb and play a low note. Now move reverb ahead of distortion and
      play it again — same two pedals, very different animal. Next, a dub echo: delay on, feedback
      at 0.8, short stabby notes, and ride the time slider while it repeats. Or go gentle: chorus
      into a big reverb, saw chords, nothing else.
    </p>
  {/snippet}
</LessonScaffold>
