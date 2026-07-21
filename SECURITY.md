# Security

AI credentials are accepted only through the Electron main-process environment. They are not exposed through preload, renderer state, SQLite, logs, screenshots, or repository files. Context isolation, renderer sandboxing, CSP, typed IPC validation, output sanitation, input length limits, and prompt-injection detection remain enforced. The standard test suite uses only the deterministic offline provider and makes no paid API calls.

## Dependency maintenance status

Phase A updates Vitest to 4.1.10, electron-builder to 26.15.3, and PostCSS to 8.5.21. This resolves the audited Vitest development-tool findings and electron-builder/tar build-chain findings. `npm audit` still reports one high-severity direct finding for Electron 33.4.11, which affects the packaged runtime. Electron is intentionally deferred to Phase B because its multi-major upgrade requires isolated compatibility and live Windows acceptance testing. The maintenance candidate must not be represented as vulnerability-free.
