<script lang="ts">
  import { onMount } from 'svelte';
  import { unlockAudio } from '../audio/context';
  import { midiToName } from '../audio/oscillator';

  interface Props {
    /** lowest MIDI note shown */
    startMidi?: number;
    /** number of white-key octaves */
    octaves?: number;
    onNoteOn: (midi: number) => void;
    onNoteOff: (midi: number) => void;
  }
  let { startMidi = 60, octaves = 2, onNoteOn, onNoteOff }: Props = $props();

  // QWERTY -> semitone offset from startMidi (one octave + a bit).
  const KEYMAP: Record<string, number> = {
    a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11,
    k: 12, o: 13, l: 14, p: 15,
  };

  const BLACK = new Set([1, 3, 6, 8, 10]);
  let active = $state<Set<number>>(new Set());

  const keys = $derived.by(() => {
    const out: { midi: number; black: boolean; whiteIndex: number }[] = [];
    let whiteIndex = 0;
    const total = octaves * 12 + 1;
    for (let i = 0; i < total; i++) {
      const midi = startMidi + i;
      const black = BLACK.has(((midi % 12) + 12) % 12);
      out.push({ midi, black, whiteIndex });
      if (!black) whiteIndex++;
    }
    return out;
  });
  const whiteCount = $derived(keys.filter((k) => !k.black).length);

  async function press(midi: number) {
    if (active.has(midi)) return;
    await unlockAudio();
    active = new Set(active).add(midi);
    onNoteOn(midi);
  }
  function release(midi: number) {
    if (!active.has(midi)) return;
    const next = new Set(active);
    next.delete(midi);
    active = next;
    onNoteOff(midi);
  }

  onMount(() => {
    function down(e: KeyboardEvent) {
      if (e.repeat) return;
      const off = KEYMAP[e.key.toLowerCase()];
      if (off !== undefined) press(startMidi + off);
    }
    function up(e: KeyboardEvent) {
      const off = KEYMAP[e.key.toLowerCase()];
      if (off !== undefined) release(startMidi + off);
    }
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  });
</script>

<div class="relative h-40 select-none" style="touch-action:none">
  <!-- white keys -->
  <div class="flex h-full w-full gap-[2px]">
    {#each keys.filter((k) => !k.black) as k (k.midi)}
      <button
        class="relative flex-1 rounded-b-md border border-[var(--color-edge)] transition"
        style={active.has(k.midi)
          ? 'background:var(--color-accent)'
          : 'background:#e9eef7'}
        onpointerdown={() => press(k.midi)}
        onpointerup={() => release(k.midi)}
        onpointerleave={() => release(k.midi)}
        aria-label={midiToName(k.midi)}
      >
        <span class="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">
          {midiToName(k.midi)}
        </span>
      </button>
    {/each}
  </div>
  <!-- black keys overlaid -->
  {#each keys.filter((k) => k.black) as k (k.midi)}
    <button
      class="absolute top-0 h-24 rounded-b-md border border-black/40"
      style="width:calc({100 / whiteCount}% * 0.62); left:calc({(k.whiteIndex / whiteCount) * 100}% - ({100 / whiteCount}% * 0.31)); background:{active.has(k.midi) ? 'var(--color-accent-2)' : '#11151f'}"
      onpointerdown={() => press(k.midi)}
      onpointerup={() => release(k.midi)}
      onpointerleave={() => release(k.midi)}
      aria-label={midiToName(k.midi)}
    ></button>
  {/each}
</div>
<p class="mt-2 text-center text-xs text-[var(--color-muted)]">
  Click keys or use your keyboard: <span class="font-mono">A W S E D F T G Y H U J</span>
</p>
