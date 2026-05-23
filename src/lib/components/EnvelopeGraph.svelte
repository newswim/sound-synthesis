<script lang="ts">
  import { envelopePoints, type ADSR } from '../audio/envelope';

  interface Props {
    env: ADSR;
    height?: number;
  }
  let { env, height = 160 }: Props = $props();

  const W = 600;
  const PAD = 14;

  const path = $derived.by(() => {
    const pts = envelopePoints(env);
    const h = height;
    return pts
      .map((p, i) => {
        const x = PAD + p.x * (W - 2 * PAD);
        const y = h - PAD - p.y * (h - 2 * PAD);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });

  // Stage boundary x positions (attack end, decay end, release start) for guide lines.
  const guides = $derived.by(() => {
    const total = env.attack + env.decay + 0.4 + env.release;
    const xs = [
      env.attack / total,
      (env.attack + env.decay) / total,
      (env.attack + env.decay + 0.4) / total,
    ];
    return xs.map((x) => PAD + x * (W - 2 * PAD));
  });
</script>

<svg
  viewBox="0 0 {W} {height}"
  class="w-full rounded-lg border border-[var(--color-edge)] bg-[var(--color-panel)]"
  style="height:{height}px"
  role="img"
  aria-label="ADSR envelope shape"
>
  {#each guides as gx (gx)}
    <line x1={gx} y1={PAD} x2={gx} y2={height - PAD} stroke="rgba(138,150,173,0.2)" stroke-dasharray="4 4" />
  {/each}
  <path d={path} fill="none" stroke="#a78bfa" stroke-width="2.5" stroke-linejoin="round" />
  <text x={PAD + 2} y={height - 4} fill="var(--color-muted)" font-size="11">A</text>
  <text x={guides[0] + 4} y={height - 4} fill="var(--color-muted)" font-size="11">D</text>
  <text x={guides[1] + 4} y={height - 4} fill="var(--color-muted)" font-size="11">S</text>
  <text x={guides[2] + 4} y={height - 4} fill="var(--color-muted)" font-size="11">R</text>
</svg>
