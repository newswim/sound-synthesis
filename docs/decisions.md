# Decision Record

_ADR-lite. Newest at top. Format: date · decision · why · alternatives._

## 2026-07-18 · Live voice edits via `Voice.update()`, not node rebuild
Sliders push config into sounding voices (`setTargetAtTime` on params; LFO always
wired so depth can rise from 0 mid-note). Attack/decay stay as scheduled; sustain
retargets once decay has passed; release is read at `stop()`.
**Why:** rebuilding nodes mid-note clicks and re-triggers the envelope.
**Alt:** stop/restart the voice on edit (audible glitch), or per-param setters (chattier API).

## 2026-05-23 · iOS audio via `navigator.audioSession.type = 'playback'`
Declare a playback audio session so Web Audio routes through the media channel.
**Why:** iOS otherwise silences Web Audio with the hardware mute switch (HTML media
is exempt). **Alt:** route through a muted `<audio>`/MediaStreamDestination (hackier).

## 2026-05-23 · Custom domain via Vercel nameservers
synth.cool delegates DNS to `ns1/ns2.vercel-dns.com` (not Namecheap A/CNAME records).
**Why:** Vercel manages records + SSL automatically. **Alt:** keep Namecheap BasicDNS
and add A (`216.150.1.1`) + CNAME records manually.

## 2026-05-23 · Tailwind v4 via @tailwindcss/vite
Use Tailwind v4 with the Vite plugin (CSS-first config, no postcss/tailwind.config).
**Why:** current standard, less config. **Alt:** Tailwind v3 + postcss.

## 2026-05-23 · Hash-based nav, no router dependency
Lesson order lives in `lessons.ts`; navigation via a current-step store synced to
`location.hash`. **Why:** zero deps, deep links, trivial static deploy.
**Alt:** SvelteKit routing (heavier; not needed for a static SPA).

## 2026-05-23 · Raw Web Audio API (no Tone.js)
**Why:** the app teaches fundamentals — learners should see the real nodes.
**Alt:** Tone.js (faster to build, hides primitives).

## 2026-05-23 · Svelte 5 + Vite + TS
**Why:** reactive runes suit slider/visualizer-heavy UI; static build deploys easily.
**Alt:** vanilla JS (more manual), React (heavier for this).
