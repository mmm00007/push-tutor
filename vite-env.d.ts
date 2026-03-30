/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUDIO_BACKEND: 'js' | 'wasm';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
