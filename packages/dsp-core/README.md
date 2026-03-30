# dsp-core

Optional Rust/Wasm DSP backend for Push Tutor.

## Status

Proof of architecture. The JS AudioWorklet backend is the shipping engine.
This crate demonstrates the integration path for future Wasm DSP expansion.

## Building

```sh
# Install wasm-pack if needed
cargo install wasm-pack

# Build the Wasm package
cd packages/dsp-core
wasm-pack build --target web --release
```

## Integration

1. Build this crate with `wasm-pack`
2. Set `VITE_AUDIO_BACKEND=wasm` in your `.env`
3. The audio engine adapter will load the Wasm module instead of the JS synth

## Expansion Path

To add real DSP processing:

1. Add oscillator implementations (saw, square, wavetable) in `src/oscillators/`
2. Add envelope generators in `src/envelope/`
3. Add filter implementations in `src/filters/`
4. Export a `process_block(buffer: &mut [f32], ...)` function
5. Wire it into an AudioWorklet via `postMessage` or SharedArrayBuffer
