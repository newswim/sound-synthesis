<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import LessonScaffold from '../lib/components/LessonScaffold.svelte';
  import Slider from '../lib/components/Slider.svelte';
  import PlayButton from '../lib/components/PlayButton.svelte';
  import Oscilloscope from '../lib/components/Oscilloscope.svelte';
  import SpectrumAnalyzer from '../lib/components/SpectrumAnalyzer.svelte';
  import { getAudioContext, getMasterBus, unlockAudio } from '../lib/audio/context';
  import { createNoiseSource, type NoiseColor } from '../lib/audio/noise';
  import { playKick, playSnare, playHat } from '../lib/audio/drums';

  interface Props {
    step: number;
    total: number;
    section: string;
  }
  let { step, total, section }: Props = $props();

  // Shared bus so the visualizers see both the noise explorer and the drums.
  const bus = getAudioContext().createGain();
  const analyser = getAudioContext().createAnalyser();
  analyser.fftSize = 2048;
  bus.connect(analyser);
  analyser.connect(getMasterBus());

  // Noise explorer — source rebuilt in handlers (buffer swap needs a new node).
  let noisePlaying = $state(false);
  let color = $state<NoiseColor>('white');
  let noiseSrc: AudioBufferSourceNode | null = null;
  let noiseGain: GainNode | null = null;

  function startNoise() {
    const ctx = getAudioContext();
    noiseSrc = createNoiseSource(color);
    noiseGain = ctx.createGain();
    noiseGain.gain.value = color === 'white' ? 0.25 : 0.6;
    noiseSrc.connect(noiseGain);
    noiseGain.connect(bus);
    noiseSrc.start();
  }
  function stopNoise() {
    noiseSrc?.stop();
    noiseSrc?.disconnect();
    noiseGain?.disconnect();
    noiseSrc = noiseGain = null;
  }
  function toggleNoise(p: boolean) {
    noisePlaying = p;
    p ? startNoise() : stopNoise();
  }
  function setColor(c: NoiseColor) {
    color = c;
    if (noisePlaying) {
      stopNoise();
      startNoise();
    }
  }

  // Drum pads — params are read at hit time, so the sliders always apply.
  let kickFreq = $state(160);
  let kickDecay = $state(0.4);
  let snareTone = $state(190);
  let snareDecay = $state(0.18);
  let hatCutoff = $state(7000);
  let hatDecay = $state(0.06);

  async function hit(drum: 'kick' | 'snare' | 'chat' | 'ohat') {
    await unlockAudio();
    if (drum === 'kick') playKick({ startFreq: kickFreq, decay: kickDecay }, bus);
    else if (drum === 'snare') playSnare({ tone: snareTone, decay: snareDecay }, bus);
    else if (drum === 'chat') playHat({ cutoff: hatCutoff, decay: hatDecay }, bus);
    else playHat({ cutoff: hatCutoff, decay: 0.35 }, bus);
  }

  const PADS: { key: string; label: string; drum: 'kick' | 'snare' | 'chat' | 'ohat' }[] = [
    { key: 'z', label: 'Kick', drum: 'kick' },
    { key: 'x', label: 'Snare', drum: 'snare' },
    { key: 'c', label: 'Hat (closed)', drum: 'chat' },
    { key: 'v', label: 'Hat (open)', drum: 'ohat' },
  ];

  onMount(() => {
    function down(e: KeyboardEvent) {
      if (e.repeat) return;
      const pad = PADS.find((p) => p.key === e.key.toLowerCase());
      if (pad) hit(pad.drum);
    }
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  });

  onDestroy(() => {
    stopNoise();
    bus.disconnect();
    analyser.disconnect();
  });
</script>

<LessonScaffold {step} {total} {section} title="Noise & percussion" subtitle="Some of the best sounds have no pitch at all.">
  {#snippet intro()}
    <p>
      Every sound so far has had a pitch. <strong>Noise</strong> has none — it's every frequency
      at once, like all the piano keys pressed together, and then some. <strong>White</strong>
      noise spreads its energy evenly and sounds like hiss. <strong>Pink</strong> noise turns the
      high end down a little and sounds deeper, like steady rain. You can see the difference as a
      tilt in the spectrum.
    </p>
    <p>
      Drums are mostly shaped noise, plus one clever trick. A snare is a short knock plus a burst
      of filtered noise. A hi-hat is nothing but noise with a very short envelope — the length
      alone decides whether it sounds closed or open. And a kick is a sine wave whose
      <em>pitch</em> gets the envelope: it starts high and dives in about a tenth of a second.
      You've spent this section pointing envelopes at loudness. Point one at frequency and a beep
      becomes a boom.
    </p>
  {/snippet}

  {#snippet demo()}
    <div class="flex flex-wrap items-center gap-3">
      <PlayButton playing={noisePlaying} onToggle={toggleNoise} labelOff="Play noise" />
      <div class="inline-flex rounded-lg border border-[var(--color-edge)] bg-[var(--color-panel-2)] p-1">
        {#each ['white', 'pink'] as c (c)}
          <button
            onclick={() => setColor(c as NoiseColor)}
            class="rounded-md px-3 py-1.5 text-sm font-medium capitalize transition"
            style={color === c ? 'background:var(--color-accent);color:#04201b' : 'color:var(--color-muted)'}
          >{c}</button>
        {/each}
      </div>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-4">
      {#each PADS as pad (pad.drum)}
        <button
          class="touch-none rounded-lg border border-[var(--color-edge)] bg-[var(--color-panel-2)] px-3 py-4 text-sm font-semibold text-[var(--color-ink)] transition active:scale-95 active:bg-[var(--color-edge)]"
          onpointerdown={() => hit(pad.drum)}
        >
          {pad.label}
          <span class="mt-1 block font-mono text-[10px] text-[var(--color-muted)] uppercase">key {pad.key}</span>
        </button>
      {/each}
    </div>

    <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Slider label="Kick pitch drop from" bind:value={kickFreq} min={60} max={400} step={1} unit=" Hz" />
      <Slider label="Kick decay" bind:value={kickDecay} min={0.1} max={1} step={0.01} format={(v) => `${(v * 1000).toFixed(0)} ms`} />
      <Slider label="Snare tone" bind:value={snareTone} min={100} max={400} step={1} unit=" Hz" />
      <Slider label="Snare decay" bind:value={snareDecay} min={0.05} max={0.5} step={0.01} format={(v) => `${(v * 1000).toFixed(0)} ms`} />
      <Slider label="Hat brightness" bind:value={hatCutoff} min={3000} max={12000} step={100} format={(v) => `${(v / 1000).toFixed(1)} kHz`} />
      <Slider label="Hat decay (closed)" bind:value={hatDecay} min={0.02} max={0.5} step={0.01} format={(v) => `${(v * 1000).toFixed(0)} ms`} />
    </div>

    <div class="mt-5 grid gap-4 md:grid-cols-2">
      <Oscilloscope {analyser} />
      <SpectrumAnalyzer {analyser} maxFreq={12000} />
    </div>
  {/snippet}

  {#snippet tryThis()}
    <p>
      Flip between white and pink while the noise plays and watch the spectrum tilt. Then drum a
      beat on <span class="font-mono">Z X C V</span> — kick, snare, closed hat, open hat. Drag the
      kick's pitch drop down to 60 Hz for a soft heartbeat, then up to 400 Hz and it snaps like a
      laser. Stretch the decay to a full second and see what it becomes. Every drum here is built
      from things you already know, just aimed at new targets.
    </p>
  {/snippet}
</LessonScaffold>
