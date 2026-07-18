# Decision Record

_ADR-lite. Newest at top. Format: date · decision · why · alternatives._

## 2026-07-18 · Signal Chain Lab: shared paraphonic chain + dual-path LFO routing
Voices (osc + amp env only, per-voice filter wide open) feed one shared chain where
the filter is a module like the effects. LFO routing is dual-path: **pitch** uses each
voice's built-in LFO (per-voice AudioParams come and go with notes); cutoff/volume/
delay-time patch a shared LFO into stable exposed AudioParams.
**Why:** per-voice targets need per-voice modulators; node params don't. A single
mechanism would mean tracking voice lifecycles from outside the Voice class.
**Alt:** true polyphonic chain per voice (heavier, no shared-effect teaching value).

## 2026-07-18 · Sectioned curriculum: Basics / Shaping / Effects, each ending in a lab
Lessons are grouped into sections in `lessons.ts`; the last lesson of each section is a
lab that integrates that section's concepts (Wave Builder, Synth Lab, FX Rack). Slugs
are unchanged so deep links survive; numbering is per-section.
**Why:** a flat list doesn't scale past ~8 lessons, and labs give each section a payoff.
**Alt:** flat list with one capstone (what we outgrew).

## 2026-07-18 · Effects as wet/dry classes with a uniform input/output interface
`effects.ts` — FeedbackDelay, Chorus, Distortion, Reverb share `input`/`output` GainNodes
and live setters (`setTargetAtTime`), so lessons and the FX Rack chain them arbitrarily.
Reverb IRs are generated (decaying noise), no sample assets.
**Why:** rack-chainable units; the graph stays raw Web Audio per project philosophy.
**Alt:** per-lesson inline graphs (no reuse), or an effects library dependency.

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
