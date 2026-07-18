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

<LessonScaffold {step} {total} {section} title="Reverb" subtitle="A room is thousands of echoes — teach the computer what a space sounds like.">
  {#snippet intro()}
    <p>
      Clap in a cathedral and you hear thousands of overlapping echoes off every surface, smearing
      into a wash. That's <strong>reverb</strong> — not one delay but a dense cloud of them. The
      space's acoustic fingerprint is its <strong>impulse response</strong>: the sound it makes
      when excited by a single instantaneous "click".
    </p>
    <p>
      <strong>Convolution</strong> reverb applies that fingerprint to any signal — every sample of
      your sound triggers the whole room response, all of them summed. Real impulse responses are
      recorded in real spaces; here we synthesize one from a burst of <strong>decaying noise</strong>,
      which sounds surprisingly like a real room. <strong>Size</strong> is the response's length;
      <strong>decay</strong> is how fast it fades.
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
      Size 0.3 with high decay is a closet; size 4 with decay 1.5 is a cathedral — listen to the
      tail breathe after each pluck. Push <strong>mix</strong> to 1.0: the dry pluck disappears and
      only the ghost of the room remains, an instant ambient pad. Reverb is why sounds feel
      <em>somewhere</em> — every record you love has a space dialed in on purpose.
    </p>
  {/snippet}
</LessonScaffold>
