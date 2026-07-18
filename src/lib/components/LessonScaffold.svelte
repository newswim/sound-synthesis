<script lang="ts">
  import type { Snippet } from 'svelte';
  import { masterVolumeStore } from '../audio/context';

  interface Props {
    step: number;
    total: number;
    section?: string;
    title: string;
    subtitle?: string;
    intro?: Snippet;
    demo?: Snippet;
    tryThis?: Snippet;
  }
  let { step, total, section, title, subtitle, intro, demo, tryThis }: Props = $props();
</script>

<article class="mx-auto max-w-3xl px-5 py-8">
  <p class="mb-1 font-mono text-xs tracking-widest text-[var(--color-accent)] uppercase">
    {section ? `${section} · ` : ''}{step} / {total}
  </p>
  <h1 class="text-3xl font-bold text-[var(--color-ink)]">{title}</h1>
  {#if subtitle}
    <p class="mt-1 text-[var(--color-muted)]">{subtitle}</p>
  {/if}

  {#if intro}
    <div class="prose-tight mt-6 text-[15px]">{@render intro()}</div>
  {/if}

  {#if demo}
    <div class="mt-6 flex items-center justify-end gap-2">
      <label class="flex items-center gap-2 text-xs text-[var(--color-muted)] select-none">
        Volume
        <input type="range" min="0" max="1" step="0.01" bind:value={$masterVolumeStore} class="w-24" />
      </label>
      <span class="w-9 text-right font-mono text-xs text-[var(--color-muted)]">
        {Math.round($masterVolumeStore * 100)}%
      </span>
    </div>
    <section
      class="mt-2 rounded-xl border border-[var(--color-edge)] bg-[var(--color-panel)] p-5"
    >
      {@render demo()}
    </section>
  {/if}

  {#if tryThis}
    <aside
      class="mt-6 rounded-xl border-l-4 p-4"
      style="border-color:var(--color-accent-2);background:rgba(167,139,250,0.08)"
    >
      <p class="mb-1 text-sm font-semibold text-[var(--color-accent-2)]">Try this</p>
      <div class="prose-tight text-sm">{@render tryThis()}</div>
    </aside>
  {/if}
</article>
