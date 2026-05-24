# Knowledge & Learnings

_Reusable findings so we don't rediscover them. Newest at top._

## Web Audio gotchas
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

## Testing
- **Vitest runs in node** — only the pure helpers are unit-testable there; anything
  calling `getAudioContext()` (`filterResponseDb`, `buildPeriodicWave`, ADSR scheduling)
  needs a real `AudioContext`/`AudioParam` and is out of scope. Note these modules import
  `getAudioContext` but don't *call* it at module load, so importing them in node is safe.
- **Float32Array precision:** `logFreqAxis` returns a `Float32Array`, so values carry only
  ~7 significant digits. Assert intermediate values with `toBeCloseTo(x, 3)`, not `6`.

## References
- MDN Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
