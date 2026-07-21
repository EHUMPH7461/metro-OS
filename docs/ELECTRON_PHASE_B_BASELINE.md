# Electron Phase B Baseline

Captured from `feature/security-maintenance-v0.5.1` at `8684e3c81243b49d382ea8f8ad27d247c958fceb` before the Electron runtime upgrade.

## Runtime and toolchain

- Electron: `33.4.11`
- Node: `v22.23.1`
- npm: `10.9.8`
- Application: `0.5.0-development`
- Database schema: `6`
- Lockfile: version `3`

## Audit baseline

`npm audit` reported one high-severity direct Electron package entry. It aggregated the current Electron advisories affecting versions through `39.8.4`. npm recommended Electron `43.1.1` as the available breaking-change remediation.

| Severity | Count |
|---|---:|
| Moderate | 0 |
| High | 1 |
| Critical | 0 |
| Total | 1 |

No build-only or test-only findings remained after Phase A.

## Direct installed packages

| Package | Version |
|---|---:|
| Electron | 33.4.11 |
| electron-builder | 26.15.3 |
| Vitest | 4.1.10 |
| Vite | 6.4.3 |
| TypeScript | 5.9.3 |
| PostCSS | 8.5.21 |
| React / React DOM | 18.3.1 |
| sql.js | 1.14.1 |

The complete `npm outdated` baseline showed Electron `43.1.1` as latest; all unrelated outdated dependencies are intentionally outside Phase B.

## Existing Windows artifacts

| Artifact | Size |
|---|---:|
| `release/MetroCommandCenter-0.5.0-development-Setup.exe` | 85,796,204 bytes |
| `release/MetroCommandCenter-0.5.0-development-Portable.exe` | 75,169,194 bytes |
| `release/win-unpacked/MetroCommandCenter.exe` | 188,784,128 bytes |

These are the Phase A baseline artifacts and will be replaced by newly validated Phase B builds.

## Security architecture baseline

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- Preload exposes a narrow `contextBridge` API.
- IPC input validation is applied in the main process.
- Production CSP permits only self-hosted scripts and connections.
- No remote module is used.
- OpenAI credentials are read only in the main process; the renderer receives provider capability state, not secrets.
- No `shell.openExternal` or renderer-controlled external navigation exists in the current application.
