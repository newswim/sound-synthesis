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

<LessonScaffold {step} {total} {section} title="Delay & feedback" subtitle="An echo, and then an echo of the echo.">
  {#snippet intro()}
    <p>
      A <strong>delay</strong> records the signal and plays it back a moment later. On its own
      that gives you exactly one echo. The interesting part is <strong>feedback</strong>: wire the
      delay's output back into its own input, and every echo produces a quieter copy of itself.
    </p>
    <p>
      This is the first time in the course a signal travels in a loop instead of a straight line,
      and loops have personality. Each trip around, the sound is multiplied by the feedback
      amount. Keep it low and the echoes die out politely. Push it toward 1.0 and they very nearly
      refuse to leave.
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
      Set the time to about 90 ms with low feedback. That tight doubling is called slapback — it's
      all over 1950s rock records. Now push the time toward 450 ms and the feedback to 0.85, and
      you've built a canyon. One more experiment: drag the time slider while echoes are still
      going. The pitch smears, and it's not a glitch — the sound already inside the delay is being
      stretched, exactly like tape changing speed.
    </p>
  {/snippet}
</LessonScaffold>
