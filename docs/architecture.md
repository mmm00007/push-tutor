# Architecture Decision Records

## ADR-001: Static-Only Architecture

**Decision:** Zero backend, zero server functions, zero auth, zero cloud runtime.

**Why:** The app is a learning tool / practice instrument. All state is personal and local. There is no need for user accounts, data sync, or server-side processing. Static deployment to Netlify from GitHub is the simplest reliable hosting.

**Consequence:** All persistence uses localStorage (settings) and IndexedDB (progress/stats). No data portability between devices without manual export (acceptable for v1).

## ADR-002: Chromatic 4ths as Default Layout

**Decision:** The default and primary layout is chromatic mode with 4ths row interval.

**Why:** This is the layout that makes chord shapes movable — the key pedagogical advantage of isomorphic grids. Teaching shapes-first requires a layout where shapes are consistent across all roots.

**Formula:** `midi = baseMidi + x + (y × 5)`

**Consequence:** In Key mode is secondary. 3rds and Sequential layouts are supported but not the focus of lessons.

## ADR-003: Interval-Based Chord System

**Decision:** Chords are defined as arrays of semitone intervals from root, not as note lists.

**Why:** This makes chords inherently transposable. A major triad is always `[0, 4, 7]` regardless of root. Grid shapes are derived from these intervals using the layout formula, so they're also automatically correct for any layout mode.

**Consequence:** Adding new chord types requires only adding an interval array. The lesson system, grid overlay, and quiz validation all work from the same interval definitions.

## ADR-004: Web Audio API with JS Backend

**Decision:** Ship with a pure JS/TS Web Audio API backend. Optional Wasm DSP behind a feature flag.

**Why:** Web Audio API oscillators and gain nodes provide good-enough synthesis for a learning tool. The touch response time matters more than synthesis complexity. A Wasm DSP engine adds build complexity and mobile compatibility risk without clear user benefit in v1.

**Wasm path:** `packages/dsp-core` contains a Rust crate stub. The `AudioEngine` interface is the same for both backends. Switch via `VITE_AUDIO_BACKEND=wasm`.

**Consequence:** The app ships without Rust toolchain requirements. Wasm expansion is possible without changing the audio interface.

## ADR-005: Zustand for State Management

**Decision:** Use Zustand instead of React Context, Redux, or signals.

**Why:** Zustand provides fine-grained subscriptions (each pad can subscribe to only its own state), minimal boilerplate, and no provider wrapper. The grid has 64 pads that need to rerender independently — Zustand's selector pattern handles this efficiently.

**Consequence:** Stores are simple and testable. No context provider nesting.

## ADR-006: CSS Modules Over UI Framework

**Decision:** Use CSS Modules for styling. No component library (Material, Chakra, etc.).

**Why:** The app has a very specific visual identity (dark, instrument-like, minimal). Component libraries add weight and fight against custom designs. CSS Modules provide scoping without runtime cost.

**Consequence:** All styles are hand-written. This keeps the bundle tiny (~4KB gzipped CSS) but requires more manual work for new components.

## ADR-007: Pointer Events for Touch Handling

**Decision:** Use Pointer Events (not Touch Events) for multi-touch grid interaction.

**Why:** Pointer Events unify mouse, touch, and stylus handling. `setPointerCapture` enables proper drag-across-pads behavior. Touch Events would require separate mouse handling for desktop.

**Consequence:** Works on all modern browsers. Touch-specific features (haptics) are behind capability checks.

## ADR-008: Data-Driven Lessons

**Decision:** Lessons are TypeScript data structures, not components or markdown files.

**Why:** Lesson content includes grid shapes (coordinate arrays), MIDI references, and quiz questions with validation logic. This is structured data, not prose. Keeping it in TS provides type safety for shape definitions and makes it easy to add new lessons.

**Consequence:** Adding a lesson means adding a data object to `chord-lessons.ts`. The lesson viewer and quiz engine are generic.

## ADR-009: PWA with Workbox Precache

**Decision:** Use `vite-plugin-pwa` with workbox precaching for offline support.

**Why:** The app should work on the subway, in a practice room, anywhere without WiFi. All content is bundled (no API calls), so precaching the app shell makes it fully offline after first load.

**Consequence:** Service worker updates need clean handling to avoid stale-cache bugs. The plugin handles this via `registerType: 'prompt'`.

## ADR-010: Cross-Origin Isolation Headers

**Decision:** Include COOP/COEP headers in Netlify config even though SharedArrayBuffer is not used yet.

**Why:** Future Wasm DSP integration may benefit from SharedArrayBuffer for lock-free audio thread communication. Setting up the headers now means all assets are already self-hosted and compliant, avoiding a painful migration later.

**Consequence:** No third-party scripts, fonts, or CDN resources. Everything is self-hosted. This is also a privacy/performance win.
