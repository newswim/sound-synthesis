<script lang="ts">
  import { onMount } from 'svelte';
  import { lessons, sections, indexForSlug } from './lib/lessons/lessons';
  import { masterVolumeStore } from './lib/audio/context';

  let current = $state(0);
  let menuOpen = $state(false);

  function syncFromHash() {
    const slug = location.hash.replace(/^#\/?/, '');
    current = indexForSlug(slug);
  }
  function go(i: number) {
    current = Math.max(0, Math.min(lessons.length - 1, i));
    location.hash = `/${lessons[current].slug}`;
    menuOpen = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onMount(() => {
    if (!location.hash) location.hash = `/${lessons[0].slug}`;
    else syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  });

  const Active = $derived(lessons[current].component);
  let volume = $state(0.7);
  $effect(() => masterVolumeStore.set(volume));
</script>

<div class="flex min-h-full">
  <!-- Sidebar -->
  <aside
    class="fixed inset-y-0 left-0 z-30 w-64 transform border-r border-[var(--color-edge)] bg-[var(--color-panel)] transition-transform md:static md:translate-x-0"
    class:translate-x-0={menuOpen}
    class:-translate-x-full={!menuOpen}
  >
    <div class="flex h-full flex-col p-4">
      <div class="mb-6 px-2">
        <h2 class="text-lg font-bold text-[var(--color-ink)]">Synth School</h2>
        <p class="text-xs text-[var(--color-muted)]">Learn sound synthesis by ear</p>
      </div>
      <nav class="flex-1 space-y-1 overflow-y-auto">
        {#each sections as sec (sec.title)}
          <p class="px-3 pt-3 pb-1 font-mono text-[10px] tracking-widest text-[var(--color-muted)] uppercase first:pt-0">
            {sec.title}
          </p>
          {#each sec.lessons as lesson, si (lesson.slug)}
            {@const i = indexForSlug(lesson.slug)}
            <button
              onclick={() => go(i)}
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition"
              style={i === current ? 'background:var(--color-panel-2)' : ''}
            >
              <span
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={i === current
                  ? 'background:var(--color-accent);color:#04201b'
                  : 'background:var(--color-edge);color:var(--color-muted)'}
              >{si + 1}</span>
              <span class="min-w-0">
                <span class="flex items-center gap-1.5 text-sm font-medium text-[var(--color-ink)]">
                  <span class="truncate">{lesson.title}</span>
                  {#if lesson.lab}
                    <span class="rounded border border-[var(--color-accent-2)] px-1 font-mono text-[9px] tracking-wider text-[var(--color-accent-2)]">LAB</span>
                  {/if}
                </span>
                <span class="block text-xs text-[var(--color-muted)]">{lesson.blurb}</span>
              </span>
            </button>
          {/each}
        {/each}
      </nav>
      <div class="mt-4 border-t border-[var(--color-edge)] px-2 pt-4">
        <label class="block">
          <span class="mb-1 flex justify-between text-xs text-[var(--color-muted)]">
            <span>Master volume</span><span class="font-mono">{Math.round(volume * 100)}%</span>
          </span>
          <input type="range" min="0" max="1" step="0.01" bind:value={volume} class="w-full" />
        </label>
      </div>
    </div>
  </aside>

  {#if menuOpen}
    <button
      class="fixed inset-0 z-20 bg-black/50 md:hidden"
      aria-label="Close menu"
      onclick={() => (menuOpen = false)}
    ></button>
  {/if}

  <!-- Main -->
  <main class="min-w-0 flex-1">
    <header
      class="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--color-edge)] bg-[var(--color-bg)]/90 px-4 py-3 backdrop-blur md:hidden"
    >
      <button
        class="rounded-md border border-[var(--color-edge)] px-3 py-1.5 text-sm"
        onclick={() => (menuOpen = true)}
      >☰ Lessons</button>
      <span class="text-sm font-medium">{lessons[current].title}</span>
    </header>

    <Active
      step={lessons[current].step}
      total={lessons[current].total}
      section={lessons[current].section}
    />

    <!-- Prev / Next -->
    <div class="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 pb-16">
      <button
        class="rounded-lg border border-[var(--color-edge)] px-4 py-2 text-sm font-medium transition disabled:opacity-30"
        disabled={current === 0}
        onclick={() => go(current - 1)}
      >← Previous</button>
      <span class="font-mono text-xs text-[var(--color-muted)]">{current + 1} / {lessons.length}</span>
      <button
        class="rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-30"
        style="background:var(--color-accent);color:#04201b"
        disabled={current === lessons.length - 1}
        onclick={() => go(current + 1)}
      >Next →</button>
    </div>
  </main>
</div>
