# Push Tutor

Learn Push-style 8x8 grid playing with movable chord shapes in chromatic 4ths mode. Built for beginners with zero piano background.

## What is this?

Push Tutor is a mobile-first PWA that teaches you to play chords on an Ableton Push-style note grid. Instead of learning piano fingerings, you learn **shapes** that work from any root note — thanks to the isomorphic chromatic 4ths layout.

**Key features:**
- 8x8 touch grid with instant audio feedback
- Chromatic 4ths layout (default) with In Key mode
- 8 chord lessons: power, major, minor, sus2, sus4, maj7, min7, dom7
- Guided lessons with visual shape overlays
- Quiz mode with scoring and streaks
- 5 built-in synth presets (piano, organ, pluck, pad, bass)
- Works offline after first load
- Installable as a PWA on Android

## Quick Start

```sh
npm install
npm run dev        # Dev server at localhost:5173
npm run build      # Production build to dist/
npm run preview    # Preview production build
npm test           # Run all tests
npm run typecheck  # TypeScript type check
```

## Deployment (Netlify)

1. Push this repo to GitHub
2. Connect the repo in Netlify
3. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy

The `netlify.toml`, `public/_redirects`, and `public/_headers` files handle SPA routing and security headers.

## Architecture

```
src/
  app/                  # App entry, root component, screen router
  components/
    Grid/               # 8x8 pad grid, individual pad, controls
    Layout/             # App shell with nav
    AudioGate/          # Audio context unlock gate
  features/
    practice/           # Free play mode
    lessons/            # Lesson list and step-by-step viewer
    quiz/               # Quiz mode with chord matching
    settings/           # User settings panel
    onboarding/         # First-time onboarding flow
  audio/
    engine/             # Web Audio API engine, voice allocator
    presets/            # Synth preset definitions
  lib/
    music-theory/       # Notes, intervals, scales, chords, grid mapping
    storage/            # localStorage + IndexedDB wrappers
  stores/               # Zustand state management
  content/              # Lesson data, scale data
  styles/               # CSS variables, global styles
packages/
  dsp-core/             # Optional Rust/Wasm DSP (proof of architecture)
tests/                  # Unit and component tests
```

## Grid Layout

The default layout is **chromatic 4ths**:
- Moving **right** = +1 semitone
- Moving **up** = +5 semitones (perfect fourth)
- Formula: `midi = baseMidi + x + (y × 5)`

This makes chord shapes **movable** — the same shape produces the same chord quality from any root.

## Audio

The app uses the Web Audio API with a polyphonic voice allocator:
- Oscillator-based synthesis (no samples)
- Per-voice ADSR envelopes and filters
- Master bus compressor/limiter
- Audio context created only on user gesture

### JS vs Wasm Backend

The audio engine has a clean interface. The shipping backend is pure JS/TS.

To enable the optional Wasm DSP backend:
1. Build `packages/dsp-core` with `wasm-pack`
2. Set `VITE_AUDIO_BACKEND=wasm` in `.env`

The JS backend remains the fallback and is production-ready on its own.

## PWA / Offline

After the first visit, the app works fully offline:
- App shell and assets are precached by the service worker
- Lesson content is bundled (no API calls)
- All data stored client-side (localStorage + IndexedDB)

### Install on Android

1. Open the app in Chrome
2. Tap the "Install" prompt (or use Chrome menu → "Add to Home screen")
3. The app opens in standalone mode

## Mobile Audio

Mobile browsers require a user gesture before playing audio. The app shows a "Tap to Start" screen that initializes the AudioContext. This is expected behavior.

## Cross-Origin Isolation

The `_headers` file includes `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` to enable future use of SharedArrayBuffer for audio processing. All assets are self-hosted to comply with these headers.

## Browser Support

| Browser | Status |
|---------|--------|
| Android Chrome | Primary target |
| Desktop Chrome | Supported |
| Firefox | Supported |
| Safari | Supported (some Web Audio quirks) |

## Tech Stack

- **Vite** — build tool
- **React 18** — UI
- **TypeScript** (strict mode) — type safety
- **Zustand** — state management
- **idb** — IndexedDB wrapper
- **vite-plugin-pwa** — service worker + manifest
- **Web Audio API** — sound engine
- **Vitest** + React Testing Library — tests

## License

See LICENSE file.
