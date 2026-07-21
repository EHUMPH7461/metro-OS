# Security

AI credentials are accepted only through the Electron main-process environment. They are not exposed through preload, renderer state, SQLite, logs, screenshots, or repository files. Context isolation, renderer sandboxing, CSP, typed IPC validation, output sanitation, input length limits, and prompt-injection detection remain enforced. The standard test suite uses only the deterministic offline provider and makes no paid API calls.
