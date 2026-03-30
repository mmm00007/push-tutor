//! Optional Wasm DSP backend for Push Tutor.
//!
//! This crate provides a proof-of-architecture module showing how to integrate
//! Rust-based DSP processing with the JS audio engine. The JS backend remains
//! the primary and fallback implementation.
//!
//! ## Building
//! ```sh
//! cd packages/dsp-core
//! wasm-pack build --target web --release
//! ```
//!
//! ## Integration
//! Set `VITE_AUDIO_BACKEND=wasm` in `.env` to enable the Wasm backend.
//! The JS engine interface (`AudioEngine`) remains identical — only the
//! voice processing is swapped.

use wasm_bindgen::prelude::*;

/// MIDI note to frequency (A4 = 440 Hz).
#[wasm_bindgen]
pub fn midi_to_freq(midi: u8) -> f32 {
    440.0 * 2.0_f32.powf((midi as f32 - 69.0) / 12.0)
}

/// Simple sine oscillator sample generator for proof of concept.
/// Returns a single sample for the given phase (0..2π).
#[wasm_bindgen]
pub fn sine_sample(phase: f32) -> f32 {
    phase.sin()
}

/// Generate a buffer of sine wave samples at the given frequency.
/// Useful for testing Wasm <-> JS audio data transfer.
#[wasm_bindgen]
pub fn generate_sine_buffer(freq: f32, sample_rate: f32, length: usize) -> Vec<f32> {
    let phase_inc = 2.0 * std::f32::consts::PI * freq / sample_rate;
    (0..length)
        .map(|i| (i as f32 * phase_inc).sin())
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a4_is_440() {
        let freq = midi_to_freq(69);
        assert!((freq - 440.0).abs() < 0.01);
    }

    #[test]
    fn sine_at_zero_is_zero() {
        assert!((sine_sample(0.0)).abs() < 0.001);
    }

    #[test]
    fn buffer_length_matches() {
        let buf = generate_sine_buffer(440.0, 44100.0, 128);
        assert_eq!(buf.len(), 128);
    }
}
