<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    analyser: AnalyserNode | null;
    height?: number;
    label?: string;
  }
  let { analyser, height = 140, label = 'Waveform (time)' }: Props = $props();

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const ctx = canvas.getContext('2d')!;
    let raf = 0;

    function draw() {
      raf = requestAnimationFrame(draw);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // midline
      ctx.strokeStyle = 'rgba(138,150,173,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      if (!analyser) return;
      const n = analyser.fftSize;
      const data = new Uint8Array(n);
      analyser.getByteTimeDomainData(data);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#5eead4';
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const x = (i / (n - 1)) * w;
        const y = (data[i] / 255) * h;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    draw();
    return () => cancelAnimationFrame(raf);
  });
</script>

<figure class="m-0">
  <canvas
    bind:this={canvas}
    width="600"
    {height}
    class="w-full rounded-lg border border-[var(--color-edge)] bg-[var(--color-panel)]"
    style="height:{height}px"
  ></canvas>
  <figcaption class="mt-1 text-center text-xs text-[var(--color-muted)]">{label}</figcaption>
</figure>
