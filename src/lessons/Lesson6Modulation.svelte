<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import LessonScaffold from '../lib/components/LessonScaffold.svelte';
  import Slider from '../lib/components/Slider.svelte';
  import PlayButton from '../lib/components/PlayButton.svelte';
  import Oscilloscope from '../lib/components/Oscilloscope.svelte';
  import SpectrumAnalyzer from '../lib/components/SpectrumAnalyzer.svelte';
  import { getAudioContext, getMasterBus } from '../lib/audio/context';

  interface Props {
    step: number;
    total: number;
    section: string;
  }
  let { step, total, section }: Props = $props();

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

  // Structural change -> rebuild graph. untrack: stop()/start() read *and* replace
  // the `analyser` state, which would otherwise make this effect retrigger itself.
  $effect(() => {
    mode;
    untrack(restart);
  });

  // Live parameter updates. Read params before the null guard — $effect only tracks
  // what a run actually reads; bailing while `mod` is null would leave it depless, dead.
  $effect(() => {
    const [mo, r, d, ra, i] = [mode, rate, depth, ratio, index];
    const ctx = getAudioContext();
    if (!mod || !modGain) return;
    if (mo === 'fm') {
      mod.frequency.setTargetAtTime(CARRIER * ra, ctx.currentTime, 0.01);
      modGain.gain.setTargetAtTime(i, ctx.currentTime, 0.01);
    } else {
      mod.frequency.setTargetAtTime(r, ctx.currentTime, 0.01);
      modGain.gain.setTargetAtTime(mo === 'tremolo' ? d * 0.4 : d, ctx.currentTime, 0.01);
    }
  });

  onDestroy(stop);

  const MODES: { value: Mode; label: string }[] = [
    { value: 'vibrato', label: 'Vibrato (pitch)' },
    { value: 'tremolo', label: 'Tremolo (volume)' },
    { value: 'fm', label: 'FM (timbre)' },
  ];
</script>

<LessonScaffold {step} {total} {section} title="Modulation" subtitle="What happens when one oscillator turns the knobs on another.">
  {#snippet intro()}
    <p>
      So far you've moved every control by hand. <strong>Modulation</strong> hands a control to a
      machine: one signal automatically wiggles a setting on another. The machine is usually an
      <strong>LFO</strong>, a low-frequency oscillator — too slow to hear as a tone, useful as a
      remote control.
    </p>
    <p>
      Point the LFO at pitch and you get <strong>vibrato</strong>, a singer's wobble. Point it at
      volume and you get <strong>tremolo</strong>. Then try something stranger: speed the
      modulator up until it becomes a pitch itself. It's now too fast to hear as movement, so your
      ear hears something else entirely — brand-new frequencies appear around the original. That
      is <strong>FM synthesis</strong>, and it's how digital synths in the 1980s made all those
      bells and electric pianos.
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
      In vibrato mode, 5 Hz at a depth of 20 Hz is a gentle, singerly wobble — watch the scope
      sway. Switch to FM and push the index up: the single spike in the spectrum bursts into a
      cluster of sidebands. Then play with the ratio. Whole numbers land in tune with the
      original; in-between values sound like bells and gongs.
    </p>
  {/snippet}
</LessonScaffold>
