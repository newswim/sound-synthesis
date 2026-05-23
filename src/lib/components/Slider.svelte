<script lang="ts">
  interface Props {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    /** Optional formatter for the displayed value. */
    format?: (v: number) => string;
  }

  let {
    label,
    value = $bindable(),
    min,
    max,
    step = 1,
    unit = '',
    format,
  }: Props = $props();

  const display = $derived(format ? format(value) : `${value}${unit}`);
</script>

<label class="block select-none">
  <div class="mb-1 flex items-baseline justify-between gap-2">
    <span class="text-sm font-medium text-[var(--color-ink)]">{label}</span>
    <span class="font-mono text-xs text-[var(--color-accent)]">{display}</span>
  </div>
  <input type="range" {min} {max} {step} bind:value class="w-full" />
</label>
