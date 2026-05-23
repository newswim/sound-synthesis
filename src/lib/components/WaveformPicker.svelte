<script lang="ts">
  import { WAVEFORMS, type Waveform } from '../audio/oscillator';

  interface Props {
    value: Waveform;
  }
  let { value = $bindable() }: Props = $props();
</script>

<div class="inline-flex rounded-lg border border-[var(--color-edge)] bg-[var(--color-panel-2)] p-1">
  {#each WAVEFORMS as w (w.value)}
    <button
      onclick={() => (value = w.value)}
      class="rounded-md px-3 py-1.5 text-sm font-medium transition"
      style={value === w.value
        ? 'background:var(--color-accent);color:#04201b'
        : 'color:var(--color-muted)'}
    >
      {w.label}
    </button>
  {/each}
</div>
