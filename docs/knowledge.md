# Knowledge & Learnings

_Reusable findings so we don't rediscover them. Newest at top._

## Svelte 5 runes
- **$effect tracks only what a run actually reads.** A guarded body like
  `if (node) node.freq = cutoff` with `node` null on the first run reads nothing →
  the effect records zero deps and never reruns (sliders look dead until restart).
  Same trap with `obj?.method(makeCfg())` — optional chaining skips the argument.
  Fix: read the reactive values *before* the null guard.
- **An $effect must not read + replace the same $state.** Lesson 6's rebuild effect
  called stop()/start(), which read `analyser` and assigned a fresh one — the effect
  retriggered itself until Svelte's max-update-depth guard killed the whole effect
  tree (UI wedges, buttons dead). Wrap the action in `untrack()`.

## Web Audio gotchas
- **AnalyserNode spectral floor:** the FFT window's sidelobe leakage from loud low
  harmonics puts a ~-55 dB floor across all bins — filter attenuation below that is
  invisible in `getFloatFrequencyData`. To verify filtering/vibrato programmatically,
  use time-domain metrics instead (derivative RMS for brightness, zero-crossing
  period for pitch).
- **Autoplay policy:** an AudioContext starts `suspended`; must call `ctx.resume()`
  inside a user gesture (click/keydown) before sound plays.
- **Exponential ramps:** `exponentialRampToValueAtTime` cannot target 0 and the
  current value must be > 0. Clamp release target to a tiny epsilon (e.g. 1e-4).
- **AnalyserNode:** `fftSize` must be a power of two. Use `getByteTimeDomainData`
  for oscilloscope, `getByteFrequencyData` for spectrum. Larger fft = more bins.
- **Node lifecycle:** OscillatorNodes are one-shot — `start()`/`stop()` once, then
  discard. Disconnect to free; reconnect a fresh node to replay.
- **Filter response:** `BiquadFilterNode.getFrequencyResponse(freqHz, mag, phase)`
  gives magnitude per frequency — use a log-spaced freq array for the curve.

## Mobile / iOS audio
- **iOS mute switch silences Web Audio.** HTML `<video>`/`<audio>` play through the
  media channel (mute-switch exempt); Web Audio defaults to a session that the
  hardware silent switch mutes. Diagnostic signature: YouTube plays but the app is
  silent, while Play toggles and visualizers still animate (graph runs, output muted).
  **Fix:** set `navigator.audioSession.type = 'playback'` (Safari 16.4+).
- **WebKit unlock:** resuming the context isn't enough — start a 1-sample silent
  buffer *inside* the first user gesture to fully unlock output.
- **`interrupted` state:** WebKit can drop the context to `interrupted` (calls,
  backgrounding), not just `suspended`. Resume whenever `state !== 'running'`.
- **All iOS browsers are WebKit** — "Firefox"/"Chrome" on iPhone behave like Safari.

## Mobile UI
- Disable long-press text selection on `<button>`: `user-select:none` +
  `-webkit-touch-callout:none`; add `touch-action:manipulation` to kill tap delay.

## Deployment
- Custom domain: synth.cool uses Vercel nameservers (Namecheap → Custom DNS). With
  nameserver delegation you manage records in Vercel's "Vercel DNS" tab, not Namecheap.

## References
- MDN Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
