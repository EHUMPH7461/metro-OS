# AI Provider Configuration

The default provider is local, a deterministic offline implementation used for development, tests, and no-credential operation. It performs no network calls.

The architecture exposes a provider-neutral interface with capability flags, model identifiers, cancellation signals, retry handling, safe metadata, and structured requests/responses. An OpenAI capability descriptor is included, but production network generation is intentionally not activated in v0.5.0.

For future OpenAI adapter activation, provide OPENAI_API_KEY and optional METRO_AI_MODEL in the Electron main-process environment. Never place credentials in repository files. Secrets are not sent through preload IPC, exposed to the renderer, persisted in SQLite, or printed in logs. Settings store provider names and model preferences only.
