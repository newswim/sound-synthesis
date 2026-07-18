<script lang="ts">
  import LessonScaffold from '../lib/components/LessonScaffold.svelte';
  import Slider from '../lib/components/Slider.svelte';
  import WaveformPicker from '../lib/components/WaveformPicker.svelte';
  import { unlockAudio } from '../lib/audio/context';
  import { Voice, type VoiceConfig } from '../lib/audio/voice';
  import { freqToMidi, type Waveform } from '../lib/audio/oscillator';

  interface Props {
    step: number;
    total: number;
    section: string;
  }
  let { step, total, section }: Props = $props();

  type ChId = 'pitch' | 'wave' | 'cutoff' | 'env';
  const CHALLENGES: { id: ChId; title: string; brief: string }[] = [
    { id: 'pitch', title: 'Match the pitch', brief: 'A hidden sine note. Tune yours until the two are the same pitch — within a quarter of a semitone.' },
    { id: 'wave', title: 'Name that waveform', brief: 'Same note, hidden shape. Pick the waveform that matches what you hear.' },
    { id: 'cutoff', title: 'Match the filter', brief: 'A saw through a hidden low-pass. Sweep your cutoff until the brightness matches — within a third of an octave.' },
    { id: 'env', title: 'Match the envelope', brief: 'Same note, hidden attack and release. Shape yours until the note moves the same way.' },
  ];

  const LS = 'synthschool:sound-match';
  function loadSolved(): Record<ChId, boolean> {
    const none = { pitch: false, wave: false, cutoff: false, env: false };
    try {
      return { ...none, ...JSON.parse(localStorage.getItem(LS) ?? '{}') };
    } catch {
      return none;
    }
  }

  let current = $state<ChId>('pitch');
  let solved = $state<Record<ChId, boolean>>(loadSolved());
  let feedback = $state<string[]>([]);
  let matched = $state(false);
  let checked = $state(false);
  let playing = $state(false);

  const logUniform = (lo: number, hi: number) => lo * Math.pow(hi / lo, Math.random());

  // Hidden targets.
  let tFreq = 440;
  let tWave: Waveform = 'square';
  let tCutoff = 1200;
  let tAttack = 0.3;
  let tRelease = 0.6;

  // Your patch.
  let uFreq = $state(440);
  let uWave = $state<Waveform>('sine');
  let uCutoff = $state(2000);
  let uAttack = $state(0.05);
  let uRelease = $state(0.3);

  function newTarget() {
    matched = false;
    checked = false;
    feedback = [];
    if (current === 'pitch') {
      let k = 0;
      while (k === 0) k = Math.floor(Math.random() * 25) - 12; // ±12 semitones, never unison
      tFreq = 440 * Math.pow(2, k / 12);
      uFreq = 440;
    } else if (current === 'wave') {
      const options: Waveform[] = ['sine', 'square', 'sawtooth', 'triangle'];
      tWave = options[Math.floor(Math.random() * options.length)];
    } else if (current === 'cutoff') {
      tCutoff = Math.round(logUniform(250, 6000));
      uCutoff = 2000;
    } else {
      tAttack = logUniform(0.005, 1);
      tRelease = logUniform(0.08, 1.6);
    }
  }
  function select(id: ChId) {
    current = id;
    newTarget();
  }
  newTarget();

  function base(w: Waveform): VoiceConfig {
    return {
      waveform: w,
      detune: 0,
      filterType: 'lowpass',
      cutoff: 18000,
      resonance: 0.7,
      env: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.2 },
      lfoRate: 0,
      lfoDepth: 0,
    };
  }
  function build(target: boolean): { midi: number; cfg: VoiceConfig; hold: number } {
    if (current === 'pitch') {
      return { midi: freqToMidi(target ? tFreq : uFreq), cfg: base('sine'), hold: 900 };
    }
    if (current === 'wave') {
      return { midi: freqToMidi(220), cfg: base(target ? tWave : uWave), hold: 900 };
    }
    if (current === 'cutoff') {
      const cfg = { ...base('sawtooth'), cutoff: target ? tCutoff : uCutoff, resonance: 1 };
      return { midi: freqToMidi(110), cfg, hold: 900 };
    }
    const a = target ? tAttack : uAttack;
    const r = target ? tRelease : uRelease;
    const cfg = { ...base('triangle'), env: { attack: a, decay: 0.12, sustain: 0.55, release: r } };
    return { midi: freqToMidi(220), cfg, hold: a * 1000 + 500 };
  }
  async function play(target: boolean) {
    await unlockAudio();
    if (playing) return;
    playing = true;
    const { midi, cfg, hold } = build(target);
    const v = new Voice(midi, cfg);
    v.start();
    setTimeout(() => {
      v.stop();
      setTimeout(() => (playing = false), 250);
    }, hold);
  }

  function check() {
    const hints: string[] = [];
    if (current === 'pitch') {
      const cents = 1200 * Math.log2(uFreq / tFreq);
      if (Math.abs(cents) > 25) {
        const dir = cents > 0 ? 'sharp — tune down' : 'flat — tune up';
        hints.push(`${Math.abs(cents) > 200 ? 'Way' : 'A touch'} ${dir}.`);
      }
    } else if (current === 'wave') {
      if (uWave !== tWave) {
        const rank: Record<Waveform, number> = { sine: 0, triangle: 1, square: 2, sawtooth: 3 };
        hints.push(
          rank[tWave] > rank[uWave]
            ? 'Not it — the target sounds brighter and buzzier than your pick.'
            : 'Not it — the target sounds purer and softer than your pick.',
        );
      }
    } else if (current === 'cutoff') {
      const oct = Math.log2(uCutoff / tCutoff);
      if (Math.abs(oct) > 1 / 3) {
        const dir = oct > 0 ? 'brighter — close the filter' : 'darker — open the filter';
        hints.push(`Yours is ${Math.abs(oct) > 1.2 ? 'much' : 'a bit'} ${dir}.`);
      }
    } else {
      if (Math.abs(Math.log2(uAttack / tAttack)) > 0.58) {
        hints.push(uAttack > tAttack ? 'Your attack is too slow.' : 'Your attack is too fast.');
      }
      if (Math.abs(Math.log2(uRelease / tRelease)) > 0.58) {
        hints.push(uRelease > tRelease ? 'Your release is too long.' : 'Your release is too short.');
      }
    }
    matched = hints.length === 0;
    checked = true;
    feedback = hints;
    if (matched) {
      solved[current] = true;
      try {
        localStorage.setItem(LS, JSON.stringify(solved));
      } catch {
        /* private mode — fine, progress just won't persist */
      }
    }
  }

  const active = $derived(CHALLENGES.find((c) => c.id === current)!);
</script>

<LessonScaffold {step} {total} {section} title="Sound Match" subtitle="You've learned the controls — now trust your ears. Recreate the hidden sound.">
  {#snippet intro()}
    <p>
      Every challenge hides a synth patch. <strong>Play the target</strong>, then
      <strong>play yours</strong> and tweak until you can't tell them apart — the skills are the
      same ones sound designers use every day: hearing a pitch, a timbre, a filter setting or an
      envelope and dialing it in from nothing.
    </p>
    <p>
      Check your match for hints. Targets are randomized, so every challenge is replayable —
      solving one once is luck, solving it three times is a skill.
    </p>
  {/snippet}

  {#snippet demo()}
    <div class="flex flex-wrap gap-2">
      {#each CHALLENGES as c (c.id)}
        <button
          onclick={() => select(c.id)}
          class="rounded-lg border px-3 py-1.5 text-sm font-medium transition"
          style={c.id === current
            ? 'border-transparent;background:var(--color-accent);color:#04201b'
            : 'border-color:var(--color-edge);color:var(--color-muted)'}
        >
          {c.title}
          {#if solved[c.id]}<span class="ml-1">✓</span>{/if}
        </button>
      {/each}
    </div>

    <p class="mt-4 text-sm text-[var(--color-muted)]">{active.brief}</p>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <button
        class="rounded-lg px-5 py-2.5 text-sm font-semibold active:scale-95 disabled:opacity-50"
        style="background:var(--color-accent-2);color:#160b2e"
        disabled={playing}
        onclick={() => play(true)}
      >▶ Play target</button>
      <button
        class="rounded-lg px-5 py-2.5 text-sm font-semibold active:scale-95 disabled:opacity-50"
        style="background:var(--color-accent);color:#04201b"
        disabled={playing}
        onclick={() => play(false)}
      >▶ Play yours</button>
      <button
        class="rounded-lg border border-[var(--color-edge)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]"
        onclick={check}
      >Check match</button>
      <button
        class="rounded-lg border border-[var(--color-edge)] px-3 py-2 text-sm text-[var(--color-muted)]"
        onclick={newTarget}
      >New target</button>
    </div>

    <div class="mt-5 grid gap-4 sm:grid-cols-2">
      {#if current === 'pitch'}
        <Slider label="Your frequency" bind:value={uFreq} min={200} max={900} step={0.5} format={(v) => `${v.toFixed(1)} Hz`} />
      {:else if current === 'wave'}
        <div><WaveformPicker bind:value={uWave} /></div>
      {:else if current === 'cutoff'}
        <Slider label="Your cutoff" bind:value={uCutoff} min={150} max={9000} step={10} format={(v) => (v >= 1000 ? `${(v / 1000).toFixed(2)} kHz` : `${v.toFixed(0)} Hz`)} />
      {:else}
        <Slider label="Your attack" bind:value={uAttack} min={0.003} max={1.2} step={0.001} format={(v) => `${(v * 1000).toFixed(0)} ms`} />
        <Slider label="Your release" bind:value={uRelease} min={0.05} max={2} step={0.01} format={(v) => `${(v * 1000).toFixed(0)} ms`} />
      {/if}
    </div>

    {#if checked}
      <div
        class="mt-5 rounded-lg border-l-4 p-3 text-sm"
        style={matched
          ? 'border-color:var(--color-accent);background:rgba(52,211,153,0.08)'
          : 'border-color:var(--color-warn);background:rgba(251,191,36,0.06)'}
      >
        {#if matched}
          <p class="font-semibold text-[var(--color-accent)]">✓ Matched!</p>
          <p class="mt-1 text-[var(--color-muted)]">
            Try a <strong>new target</strong> to prove it wasn't luck, or move on to the next
            challenge.
          </p>
        {:else}
          {#each feedback as hint (hint)}
            <p>{hint}</p>
          {/each}
        {/if}
      </div>
    {/if}
  {/snippet}

  {#snippet tryThis()}
    <p>
      Stuck on pitch? Hum along with the target, then hum along with yours — your voice will tell
      you which is higher. For the filter, listen to the <em>hiss and edge</em>, not the note. For
      envelopes, listen for <em>when</em> the note arrives and how it lets go, not how it sounds in
      the middle. These are the listening habits the whole course has been building toward.
    </p>
  {/snippet}
</LessonScaffold>
