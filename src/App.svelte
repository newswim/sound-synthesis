<script lang="ts">
  import { onMount } from 'svelte';
  import { lessons, sections, indexForSlug, SITE } from './lib/lessons/lessons';

  let current = $state(0);
  let menuOpen = $state(false);

  function syncFromPath() {
    const slug = decodeURIComponent(location.pathname).replace(/^\/+|\/+$/g, '');
    if (slug && lessons.every((l) => l.slug !== slug)) {
      // Unknown path: normalize to home so bad URLs don't masquerade as pages.
      history.replaceState(null, '', '/');
    }
    current = indexForSlug(slug);
  }
  function go(i: number) {
    current = Math.max(0, Math.min(lessons.length - 1, i));
    history.pushState(null, '', current === 0 ? '/' : `/${lessons[current].slug}`);
    menuOpen = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onMount(() => {
    // Legacy hash links (#/filters) → real paths (/filters).
    const legacy = location.hash.replace(/^#\/?/, '');
    if (legacy) history.replaceState(null, '', `/${legacy}`);
    syncFromPath();
    window.addEventListener('popstate', syncFromPath);
    return () => window.removeEventListener('popstate', syncFromPath);
  });

  // Keep the head in sync on client-side navigation (prerendered pages seed
  // the same values for crawlers; see scripts/prerender.mjs).
  $effect(() => {
    const l = lessons[current];
    const home = current === 0;
    document.title = home ? SITE.title : `${l.title} · ${SITE.name}`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', home ? SITE.description : l.description);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', home ? `${SITE.baseUrl}/` : `${SITE.baseUrl}/${l.slug}`);
  });

  const Active = $derived(lessons[current].component);
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
            <a
              href={i === 0 ? '/' : `/${lesson.slug}`}
              onclick={(e) => {
                e.preventDefault();
                go(i);
              }}
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
            </a>
          {/each}
        {/each}
      </nav>
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
