<script lang="ts">
  import { onDestroy } from 'svelte';
  import LessonScaffold from '../lib/components/LessonScaffold.svelte';
  import Slider from '../lib/components/Slider.svelte';
  import PlayButton from '../lib/components/PlayButton.svelte';
  import Oscilloscope from '../lib/components/Oscilloscope.svelte';
  import SpectrumAnalyzer from '../lib/components/SpectrumAnalyzer.svelte';
  import { getAudioContext, getMasterBus } from '../lib/audio/context';
  import { FeedbackDelay } from '../lib/audio/effects';
  import { Voice, type VoiceConfig } from '../lib/audio/voice';

  interface Props {
    step: number;
    total: number;
    section: string;
  }
  let { step, total, section }: Props = $props();

  let playing = $state(false);
  let time = $state(0.35);
  let feedback = $state(0.45);
  let mix = $state(0.5);

  const fx = new FeedbackDelay(0.35, 0.45, 0.5);
  const analyser = getAudioContext().createAnalyser();
  analyser.fftSize = 2048;
  fx.output.connect(analyser);
  analyser.connect(getMasterBus());

  $effect(() => {
    fx.time = time;
  });
  $effect(() => {
    fx.feedback = feedback;
  });
  $effect(() => {
    fx.mix = mix;
  });

  const PLUCK: VoiceConfig = {
    waveform: 'sawtooth',
    detune: 0,
    filterType: 'lowpass',
    cutoff: 5000,
    resonance: 0.7,
    env: { attack: 0.003, decay: 0.18, sustain: 0, release: 0.1 },
    lfoRate: 0,
    lfoDepth: 0,
  };

  let timer: ReturnType<typeof setInterval> | undefined;
  function ping() {
    const v = new Voice(69, PLUCK, fx.input);
    v.start();
    setTimeout(() => v.stop(), 180);
  }
  function toggle(p: boolean) {
    playing = p;
    if (p) {
      ping();
      timer = setInterval(ping, 900);
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

<LessonScaffold {step} {total} {section} title="Delay & feedback" subtitle="Copy the sound, play it back late — then feed the echo back into itself.">
  {#snippet intro()}
    <p>
      A <strong>delay</strong> is the simplest effect there is: record the signal, play it back a
      moment later, mix it with the original. One echo. The magic comes from
      <strong>feedback</strong> — wiring the delay's <em>output back into its own input</em>, so
      every echo makes another, quieter echo.
    </p>
    <p>
      This is your first <strong>feedback loop</strong>, and it's a big idea: until now every
      signal flowed one way, source → output. Loops let a patch develop a life of its own — each
      trip around the loop the sound is multiplied by the feedback amount, so below 1.0 it decays
      away; near 1.0 it almost lasts forever.
    </p>
  {/snippet}

  {#snippet demo()}
    <PlayButton {playing} onToggle={toggle} labelOff="Play pattern" />
    <div class="mt-5 grid gap-4 sm:grid-cols-3">
      <Slider label="Time" bind:value={time} min={0.05} max={1} step={0.005} format={(v) => `${(v * 1000).toFixed(0)} ms`} />
      <Slider label="Feedback" bind:value={feedback} min={0} max={0.9} step={0.01} format={(v) => v.toFixed(2)} />
      <Slider label="Mix" bind:value={mix} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} />
    </div>
    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <Oscilloscope {analyser} />
      <SpectrumAnalyzer {analyser} maxFreq={6000} />
    </div>
  {/snippet}

  {#snippet tryThis()}
    <p>
      Set <strong>time</strong> ≈ 90 ms with low feedback — that tight double is "slapback", the
      1950s rock-and-roll vocal sound. Now push time toward 450 ms and <strong>feedback</strong>
      to 0.85: a canyon. Then grab the time slider and <em>drag it while echoes ring</em> — the
      pitch smears like a tape machine changing speed, because the notes already inside the delay
      line get stretched or squeezed.
    </p>
  {/snippet}
</LessonScaffold>
