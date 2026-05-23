<script lang="ts">
  import { filterResponseDb, logFreqAxis, type FilterType } from '../audio/filter';

  interface Props {
    type: FilterType;
    cutoff: number;
    resonance: number;
    height?: number;
  }
  let { type, cutoff, resonance, height = 160 }: Props = $props();

  const W = 600;
  const PAD = 16;
  const DB_MIN = -48;
  const DB_MAX = 24;

  const freqs = logFreqAxis(20, 20000, 220);

  function xFor(freq: number): number {
    const t = (Math.log10(freq) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20));
    return PAD + t * (W - 2 * PAD);
  }
  function yFor(db: number): number {
    const t = (db - DB_MIN) / (DB_MAX - DB_MIN);
    return height - PAD - t * (height - 2 * PAD);
  }

  const path = $derived.by(() => {
    const db = filterResponseDb(type, cutoff, resonance, freqs);
    let d = '';
    for (let i = 0; i < freqs.length; i++) {
      const x = xFor(freqs[i]);
      const y = yFor(db[i]);
      d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)} `;
    }
    return d.trim();
  });

  const cutoffX = $derived(xFor(cutoff));
  const gridFreqs = [100, 1000, 10000];
</script>

<svg
  viewBox="0 0 {W} {height}"
  class="w-full rounded-lg border border-[var(--color-edge)] bg-[var(--color-panel)]"
  style="height:{height}px"
  role="img"
  aria-label="Filter frequency response"
>
  <line x1={PAD} y1={yFor(0)} x2={W - PAD} y2={yFor(0)} stroke="rgba(138,150,173,0.25)" />
  {#each gridFreqs as f (f)}
    <line x1={xFor(f)} y1={PAD} x2={xFor(f)} y2={height - PAD} stroke="rgba(138,150,173,0.15)" />
    <text x={xFor(f) + 3} y={height - 4} fill="var(--color-muted)" font-size="10">
      {f >= 1000 ? `${f / 1000}k` : f}
    </text>
  {/each}
  <line
    x1={cutoffX}
    y1={PAD}
    x2={cutoffX}
    y2={height - PAD}
    stroke="var(--color-warn)"
    stroke-dasharray="3 3"
  />
  <path d={path} fill="none" stroke="#5eead4" stroke-width="2.5" stroke-linejoin="round" />
</svg>
