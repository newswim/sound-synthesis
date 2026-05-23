<script lang="ts">
  import { onDestroy } from 'svelte';
  import LessonScaffold from '../lib/components/LessonScaffold.svelte';
  import Slider from '../lib/components/Slider.svelte';
  import PlayButton from '../lib/components/PlayButton.svelte';
  import Oscilloscope from '../lib/components/Oscilloscope.svelte';
  import SpectrumAnalyzer from '../lib/components/SpectrumAnalyzer.svelte';
  import { getAudioContext, getMasterBus } from '../lib/audio/context';

  interface Props {
    step: number;
    total: number;
  }
  let { step, total }: Props = $props();

  type Mode = 'vibrato' | 'tremolo' | 'fm';
  const CARRIER = 220;

  let playing = $state(false);
  let mode = $state<Mode>('vibrato');
  let rate = $state(5); // Hz (LFO)
  let depth = $state(20); // Hz (vibrato) or 0..1 (tremolo)
  let ratio = $state(2); // FM modulator : carrier
  let index = $state(200); // FM depth in Hz

  let carrier: OscillatorNode | null = null;
  let amp: GainNode | null = null;
  let mod: OscillatorNode | null = null;
  let modGain: GainNode | null = null;
  let analyser = $state<AnalyserNode | null>(null);

  function toggle(p: boolean) {
    playing = p;
    p ? start() : stop();
  }

  function start() {
    const ctx = getAudioContext();
    carrier = ctx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.value = CARRIER;

    amp = ctx.createGain();
    amp.gain.value = 0.4;

    const a = ctx.createAnalyser();
    a.fftSize = 2048;
    analyser = a;

    carrier.connect(amp);
    amp.connect(a);
    a.connect(getMasterBus());

    mod = ctx.createOscillator();
    modGain = ctx.createGain();
    mod.connect(modGain);

    if (mode === 'vibrato') {
      mod.frequency.value = rate;
      modGain.gain.value = depth;
      modGain.connect(carrier.frequency);
    } else if (mode === 'tremolo') {
      mod.frequency.value = rate;
      modGain.gain.value = depth * 0.4;
      modGain.connect(amp.gain);
    } else {
      mod.frequency.value = CARRIER * ratio;
      modGain.gain.value = index;
      modGain.connect(carrier.frequency);
    }

    carrier.start();
    mod.start();
  }

  function stop() {
    carrier?.stop();
    mod?.stop();
    [carrier, amp, mod, modGain, analyser].forEach((n) => n?.disconnect());
    carrier = amp = mod = modGain = null;
    analyser = null;
  }

  function restart() {
    if (playing) {
      stop();
      start();
    }
  }

  // Structural change -> rebuild graph.
  $effect(() => {
    mode;
    restart();
  });

  // Live parameter updates.
  $effect(() => {
    const ctx = getAudioContext();
    if (!mod || !modGain) return;
    if (mode === 'fm') {
      mod.frequency.setTargetAtTime(CARRIER * ratio, ctx.currentTime, 0.01);
      modGain.gain.setTargetAtTime(index, ctx.currentTime, 0.01);
    } else {
      mod.frequency.setTargetAtTime(rate, ctx.currentTime, 0.01);
      modGain.gain.setTargetAtTime(mode === 'tremolo' ? depth * 0.4 : depth, ctx.currentTime, 0.01);
    }
  });

  onDestroy(stop);

  const MODES: { value: Mode; label: string }[] = [
    { value: 'vibrato', label: 'Vibrato (pitch)' },
    { value: 'tremolo', label: 'Tremolo (volume)' },
    { value: 'fm', label: 'FM (timbre)' },
  ];
</script>

<LessonScaffold {step} {total} title="Modulation" subtitle="Use one wave to wiggle another — slow wiggles add motion, fast ones invent new tones.">
  {#snippet intro()}
    <p>
      <strong>Modulation</strong> means using one signal to control a parameter of another. The
      controller is often a <strong>Low-Frequency Oscillator (LFO)</strong> — an oscillator too
      slow to hear (under ~20 Hz), used as a remote control.
    </p>
    <p>
      Point an LFO at <strong>pitch</strong> and you get <strong>vibrato</strong>. Point it at
      <strong>volume</strong> and you get <strong>tremolo</strong>. Now speed the modulator up into
      the audible range and point it at pitch: it's too fast to hear as wobble and instead spawns
      whole new harmonics — that's <strong>FM synthesis</strong>, famous for bells and electric
      pianos.
    </p>
  {/snippet}

  {#snippet demo()}
    <div class="flex flex-wrap items-center gap-3">
      <PlayButton {playing} onToggle={toggle} />
      <div class="inline-flex rounded-lg border border-[var(--color-edge)] bg-[var(--color-panel-2)] p-1">
        {#each MODES as m (m.value)}
          <button
            onclick={() => (mode = m.value)}
            class="rounded-md px-3 py-1.5 text-sm font-medium transition"
            style={mode === m.value ? 'background:var(--color-accent);color:#04201b' : 'color:var(--color-muted)'}
          >{m.label}</button>
        {/each}
      </div>
    </div>

    <div class="mt-5 grid gap-4 sm:grid-cols-2">
      {#if mode === 'fm'}
        <Slider label="Ratio (mod : carrier)" bind:value={ratio} min={0.5} max={8} step={0.5} format={(v) => `${v}:1`} />
        <Slider label="Index (FM depth)" bind:value={index} min={0} max={1000} step={1} unit=" Hz" />
      {:else}
        <Slider label="LFO rate" bind:value={rate} min={0.1} max={15} step={0.1} unit=" Hz" />
        <Slider label="Depth" bind:value={depth} min={0} max={mode === 'tremolo' ? 1 : 50} step={mode === 'tremolo' ? 0.01 : 0.5} format={(v) => (mode === 'tremolo' ? v.toFixed(2) : `${v.toFixed(1)} Hz`)} />
      {/if}
    </div>

    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <Oscilloscope {analyser} />
      <SpectrumAnalyzer {analyser} maxFreq={4000} />
    </div>
  {/snippet}

  {#snippet tryThis()}
    <p>
      In <strong>vibrato</strong>, a gentle 5 Hz / 20 Hz setting is a singer's wobble — watch the
      scope shimmer side to side. Switch to <strong>FM</strong> and push the <strong>index</strong>
      up: the single spectrum spike erupts into a cluster of metallic sidebands. Change the
      <strong>ratio</strong> to retune which harmonics appear — whole numbers sound musical,
      in-between values sound clangorous and bell-like.
    </p>
  {/snippet}
</LessonScaffold>
