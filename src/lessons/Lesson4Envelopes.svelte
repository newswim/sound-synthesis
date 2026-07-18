<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import LessonScaffold from '../lib/components/LessonScaffold.svelte';
  import Slider from '../lib/components/Slider.svelte';
  import PlayButton from '../lib/components/PlayButton.svelte';
  import EnvelopeGraph from '../lib/components/EnvelopeGraph.svelte';
  import { unlockAudio } from '../lib/audio/context';
  import { Voice, type VoiceConfig } from '../lib/audio/voice';
  import type { ADSR } from '../lib/audio/envelope';

  interface Props {
    step: number;
    total: number;
    section: string;
  }
  let { step, total, section }: Props = $props();

  let attack = $state(0.01);
  let decay = $state(0.2);
  let sustain = $state(0.6);
  let release = $state(0.4);

  const env = $derived<ADSR>({ attack, decay, sustain, release });

  let held: Voice | null = null;

  function presetPluck() {
    attack = 0.005; decay = 0.25; sustain = 0; release = 0.15;
  }
  function presetPad() {
    attack = 0.8; decay = 0.4; sustain = 0.8; release = 1.2;
  }

  function makeCfg(): VoiceConfig {
    return {
      waveform: 'sawtooth',
      detune: 0,
      filterType: 'lowpass',
      cutoff: 4000,
      resonance: 1,
      env,
      lfoRate: 0,
      lfoDepth: 0,
    };
  }

  let latched = $state(false);

  async function down() {
    await unlockAudio();
    if (held) return;
    held = new Voice(57, makeCfg());
    held.start();
  }
  function up() {
    if (latched) return; // a latched note releases only via the toggle
    held?.stop();
    held = null;
  }
  function toggleLatch(p: boolean) {
    latched = p;
    if (p) {
      void down();
    } else {
      held?.stop();
      held = null;
    }
  }
  // Sustain/release edits apply to the note being held. makeCfg() runs before the
  // held-null short-circuit so the effect always tracks the env sliders.
  $effect(() => {
    const c = makeCfg();
    held?.update(c);
  });

  onMount(() => {
    function kd(e: KeyboardEvent) {
      if (e.repeat || e.key.toLowerCase() !== 'a') return;
      void down();
    }
    function ku(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== 'a') return;
      up();
    }
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    return () => {
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
    };
  });

  onDestroy(() => held?.stop());
</script>

<LessonScaffold {step} {total} {section} title="Envelopes (ADSR)" subtitle="A note isn't instant — its loudness has a life story over time.">
  {#snippet intro()}
    <p>
      Real notes <strong>evolve</strong>. A plucked string snaps in and rings out; a bowed pad
      swells in slowly. An <strong>envelope</strong> is the curve that shapes a parameter (usually
      loudness) from the moment a key is pressed to after it's released.
    </p>
    <p>
      The classic shape has four stages — <strong>ADSR</strong>:
      <strong>Attack</strong> (time to rise to full), <strong>Decay</strong> (fall to the sustain
      level), <strong>Sustain</strong> (the level held while the key is down — a level, not a time),
      and <strong>Release</strong> (fade to silence after you let go).
    </p>
  {/snippet}

  {#snippet demo()}
    <EnvelopeGraph {env} />
    <div class="mt-5 grid gap-4 sm:grid-cols-2">
      <Slider label="Attack" bind:value={attack} min={0.001} max={2} step={0.001} format={(v) => `${(v * 1000).toFixed(0)} ms`} />
      <Slider label="Decay" bind:value={decay} min={0.001} max={2} step={0.001} format={(v) => `${(v * 1000).toFixed(0)} ms`} />
      <Slider label="Sustain" bind:value={sustain} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} />
      <Slider label="Release" bind:value={release} min={0.001} max={3} step={0.001} format={(v) => `${(v * 1000).toFixed(0)} ms`} />
    </div>
    <div class="mt-5 flex flex-wrap items-center gap-3">
      <button
        class="touch-none rounded-lg px-6 py-3 text-sm font-semibold active:scale-95"
        style="background:var(--color-accent);color:#04201b"
        onpointerdown={down}
        onpointerup={up}
        onpointerleave={up}
      >
        Hold to play
      </button>
      <PlayButton playing={latched} onToggle={toggleLatch} labelOff="Latch note" labelOn="Release" />
      <button class="rounded-lg border border-[var(--color-edge)] px-3 py-2 text-sm text-[var(--color-muted)]" onclick={presetPluck}>Pluck preset</button>
      <button class="rounded-lg border border-[var(--color-edge)] px-3 py-2 text-sm text-[var(--color-muted)]" onclick={presetPad}>Pad preset</button>
    </div>
    <p class="mt-2 text-xs text-[var(--color-muted)]">
      Or hold <span class="font-mono">A</span> on your keyboard — press for the attack, release for
      the release. <strong>Latch note</strong> keeps it sounding while you tweak the sliders.
    </p>
  {/snippet}

  {#snippet tryThis()}
    <p>
      Click <strong>Pluck preset</strong>, then hold <span class="font-mono">A</span>: tiny attack,
      zero sustain — the note fires and dies even while you hold. Now <strong>Pad preset</strong>:
      long attack and release — the note swells in, and fades slowly after you let go. Then
      <strong>Latch note</strong> and drag <strong>Sustain</strong> while it rings — the level
      follows your finger. Same oscillator, completely different instrument, just from the
      envelope.
    </p>
  {/snippet}
</LessonScaffold>
