<script lang="ts">
  import { onDestroy } from 'svelte';
  import LessonScaffold from '../lib/components/LessonScaffold.svelte';
  import Slider from '../lib/components/Slider.svelte';
  import PlayButton from '../lib/components/PlayButton.svelte';
  import Oscilloscope from '../lib/components/Oscilloscope.svelte';
  import SpectrumAnalyzer from '../lib/components/SpectrumAnalyzer.svelte';
  import { getAudioContext, getMasterBus } from '../lib/audio/context';
  import { Reverb } from '../lib/audio/effects';
  import { Voice, type VoiceConfig } from '../lib/audio/voice';

  interface Props {
    step: number;
    total: number;
    section: string;
  }
  let { step, total, section }: Props = $props();

  let playing = $state(false);
  let size = $state(2);
  let decay = $state(3);
  let mix = $state(0.4);

  const fx = new Reverb(2, 3, 0.4);
  const analyser = getAudioContext().createAnalyser();
  analyser.fftSize = 2048;
  fx.output.connect(analyser);
  analyser.connect(getMasterBus());

  $effect(() => {
    fx.seconds = size;
  });
  $effect(() => {
    fx.decay = decay;
  });
  $effect(() => {
    fx.mix = mix;
  });

  const PLUCK: VoiceConfig = {
    waveform: 'triangle',
    detune: 0,
    filterType: 'lowpass',
    cutoff: 6000,
    resonance: 0.7,
    env: { attack: 0.003, decay: 0.15, sustain: 0, release: 0.1 },
    lfoRate: 0,
    lfoDepth: 0,
  };

  let timer: ReturnType<typeof setInterval> | undefined;
  function ping() {
    const v = new Voice(76, PLUCK, fx.input);
    v.start();
    setTimeout(() => v.stop(), 160);
  }
  function toggle(p: boolean) {
    playing = p;
    if (p) {
      ping();
      timer = setInterval(ping, 1400);
    } else {
      clearInterval(timer);
    }
  }

  onDestroy(() => {
    clearInterval(timer);
    fx.dispose();
    analyser.disconnect();
  });
</script>

<LessonScaffold {step} {total} {section} title="Reverb" subtitle="Every room you've ever been in is an instrument.">
  {#snippet intro()}
    <p>
      Clap in a big empty church and the clap smears into a long, soft wash. What you're hearing
      is thousands of echoes off every surface, arriving too close together to count.
      <strong>Reverb</strong> is that wash, and each space makes its own. A room's fingerprint is
      its <strong>impulse response</strong> — the exact way it answers one sharp clap.
    </p>
    <p>
      <strong>Convolution</strong> reverb takes a fingerprint and applies it to any sound: every
      sample of your note triggers the whole room, all overlapping. Real fingerprints are recorded
      in real places with real claps. Ours is built from a burst of fading noise, which turns out
      to sound remarkably like a room. Size sets how long the response lasts; decay sets how fast
      it dies away.
    </p>
  {/snippet}

  {#snippet demo()}
    <PlayButton {playing} onToggle={toggle} labelOff="Play pattern" />
    <div class="mt-5 grid gap-4 sm:grid-cols-3">
      <Slider label="Size" bind:value={size} min={0.2} max={4} step={0.05} format={(v) => `${v.toFixed(2)} s`} />
      <Slider label="Decay" bind:value={decay} min={1} max={6} step={0.25} format={(v) => v.toFixed(2)} />
      <Slider label="Mix" bind:value={mix} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} />
    </div>
    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <Oscilloscope {analyser} />
      <SpectrumAnalyzer {analyser} maxFreq={8000} />
    </div>
  {/snippet}

  {#snippet tryThis()}
    <p>
      Set the size to 0.3 and you're in a closet. Set it to 4 seconds with a gentle decay and
      you're in a cathedral — listen to the tail breathe after each pluck. Then push the mix all
      the way to 1.0, so only the room remains and the plucks turn into ghosts. Next time you
      listen to a recording you love, notice the space around it. Someone chose that room on
      purpose.
    </p>
  {/snippet}
</LessonScaffold>
