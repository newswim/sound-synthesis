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

## References
- MDN Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
