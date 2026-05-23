<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    analyser: AnalyserNode | null;
    height?: number;
    label?: string;
    /** Upper frequency to display (Hz). Default emphasizes the musical range. */
    maxFreq?: number;
  }
  let {
    analyser,
    height = 140,
    label = 'Spectrum (frequency)',
    maxFreq = 8000,
  }: Props = $props();

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const ctx = canvas.getContext('2d')!;
    let raf = 0;

    function draw() {
      raf = requestAnimationFrame(draw);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      if (!analyser) return;

      const bins = analyser.frequencyBinCount;
      const data = new Uint8Array(bins);
      analyser.getByteFrequencyData(data);

      const sampleRate = analyser.context.sampleRate;
      const nyquist = sampleRate / 2;
      const maxBin = Math.min(bins, Math.ceil((maxFreq / nyquist) * bins));

      const barW = w / maxBin;
      for (let i = 0; i < maxBin; i++) {
        const mag = data[i] / 255;
        const barH = mag * h;
        const hue = 160 + (i / maxBin) * 110; // teal -> violet
        ctx.fillStyle = `hsl(${hue} 70% ${30 + mag * 35}%)`;
        ctx.fillRect(i * barW, h - barH, Math.max(1, barW - 1), barH);
      }
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
