# Push Tutor

Static PWA that teaches Push-style 8x8 grid playing with chord shapes in chromatic 4ths mode.

## Quick Reference

```sh
npm run dev          # Dev server
npm run build        # Production build
npm test             # Run tests
npm run typecheck    # TS check
```

## Architecture

- **Zero backend** — pure static site, client-side only
- **Vite + React + TS** with strict mode
- **Zustand** stores for grid, audio, lessons, settings state
- **Web Audio API** with polyphonic voice allocator
- **IndexedDB** (via idb) for lesson progress, **localStorage** for settings
- **vite-plugin-pwa** for offline/installable PWA

## Key Design Decisions

1. **Chromatic 4ths as default**: `midi = baseMidi + x + y*5`. All chord shapes are movable.
2. **Shapes-first pedagogy**: Lessons teach grid shapes before note names or theory.
3. **Interval-based chords**: No hardcoded note lists — chords are interval patterns.
4. **Audio unlock gate**: AudioContext created only on explicit user gesture.
5. **JS audio backend shipping, Wasm optional**: `packages/dsp-core` is proof-of-architecture only.
6. **Memoized pads**: Each pad rerenders only when its own state changes.

## Domain Expert Agent

Use `.claude/agents/music-domain-expert.md` to validate:
- Grid mapping formulas
- Scale interval patterns
- Chord shape definitions
- Lesson content accuracy

## File Map

| Path | Purpose |
|------|---------|
| `src/lib/music-theory/` | Pure functions: notes, intervals, scales, chords, grid mapping |
| `src/audio/engine/` | AudioContext, voice allocator, engine interface |
| `src/audio/presets/` | Synth preset definitions |
| `src/stores/` | Zustand stores |
| `src/content/lessons/` | Data-driven lesson definitions |
| `src/components/Grid/` | Pad + Grid + Controls |
| `src/features/` | Practice, lessons, quiz, settings, onboarding |
| `packages/dsp-core/` | Optional Rust/Wasm DSP |

## Testing

Unit tests for all music theory functions. Component smoke tests for app loading.
Run `npm test` — all tests should pass before shipping changes.
