# Electron Phase B Maintenance Candidate

Status: validated maintenance candidate on `feature/electron-upgrade-v0.5.2`; not merged, tagged, or released.

## Outcome

Electron was upgraded from `33.4.11` to the current stable `43.2.0` release. The final `npm audit` result is zero vulnerabilities. Application behavior, package identity, database schema 6, user-data paths, and packaging configuration remain unchanged.

Electron `43.1.1` was the current npm stable release at the start of implementation. During final validation the stable channel advanced to `43.2.0`; the branch moved forward without rewriting the already-created commit and repeated validation and packaging at `43.2.0`.

## Release-note and compatibility review

Electron 43 moves the embedded stack to Chromium 150, Node 24, and V8 15. Documented Electron 43 changes relevant to review include the new default download destination, Linux window-decoration behavior, and native-image color normalization. Metro Command Center does not implement automatic downloads, frameless Linux windows, or native-image pixel comparison, so no application migration was required.

Reviewed surfaces:

- Renderer and React navigation
- Electron main process and ESM output
- Sandboxed CommonJS preload
- Context bridge and IPC handlers
- sql.js database initialization and persistence
- Managed photo paths and file validation
- CSV save dialog and export validation
- Analytics, Action Center, Listing Workspace, Photo Manager, Inventory, AI Assistant, and Settings
- Offline AI provider, history persistence, and review workflow
- Vite and Electron TypeScript build scripts
- electron-builder NSIS, portable, and directory targets

No preload, IPC, BrowserWindow, CSP, session, permission, typing, or packaging source changes were required.

## Security review

- `contextIsolation` remains enabled.
- `nodeIntegration` remains disabled.
- Renderer sandboxing remains enabled.
- The preload exposes a narrow `contextBridge` API and does not expose Node primitives.
- No Electron remote module is used.
- Main-process IPC validates inventory, photo, listing, analytics-export, and identifier inputs.
- Production CSP restricts scripts and connections to `self`; objects, base navigation, and framing are disabled.
- No `shell.openExternal` call or renderer-controlled external-navigation path exists.
- OpenAI credentials remain main-process environment values. The renderer receives configuration status, never the key.
- The production OpenAI provider was not activated, and no paid API was called.

## Validation

| Check | Result |
|---|---|
| `npm ci` | Passed |
| Typecheck | Passed |
| Tests | 62/62 passed across 11 files |
| Renderer build | Passed; 1,601 modules |
| Electron build | Passed |
| NSIS x64 installer | Passed |
| Portable x64 build | Passed |
| Unpacked x64 directory | Passed |
| Browser regression | Passed; no console errors |
| Unpacked launch | Running after 8 seconds |
| Portable launch | Running after 15 seconds; expected four-process model |
| Audit before | 1 high Electron package entry |
| Audit after | 0 vulnerabilities |

The automated suite covers calculations, inline data behavior, filters, analytics and CSV escaping, Action Center routing, photo validation, listing readiness, validated IPC inputs, deterministic offline AI generation, AI output policy, database migrations, v5-to-v6 preservation, photo/listing preservation, and recoverable database writes.

The browser sweep verified Dashboard, Inventory, Photo Manager, Listing Workspace, Analytics, Action Center presentation, AI Assistant, Settings, and navigation without console errors. Automated launch checks verified that both packaged forms remained running. Human interactive installer-upgrade acceptance was not performed and is not claimed.

## Existing user data verification

After packaged Electron 43.2.0 launches, the existing per-user data at Electron's unchanged `app.getPath('userData')` location contained:

- Schema version: `6`
- Inventory records: `5`
- Listing records: `5`
- Photo records: `5`
- Managed photo files: `10`
- AI history sessions: `9`

No migration was added, and the database, inventory, photo, listing, and AI-history counts were preserved across the automated smoke launches.

## Final Windows artifacts

| Artifact | Size | SHA-256 |
|---|---:|---|
| `release/MetroCommandCenter-0.5.0-development-Setup.exe` | 105,255,714 bytes | `1BA6FBD1260B22490FE3C71568F9187BFEA73955D6CA8F01676B32ABF67BA6B1` |
| `release/MetroCommandCenter-0.5.0-development-Portable.exe` | 92,283,441 bytes | `090C26BC61FDB812FE6415CF9B214E1B117C31556CFE12C9C6D7C2CCE84ADB75` |
| `release/win-unpacked/MetroCommandCenter.exe` | 225,613,824 bytes | `2FFDEA31E001B9E5806F75653B0C870408E6A00E0642C30D7DA5D8A96371B56A` |

The artifact size increase is attributable to the newer Electron/Chromium runtime. Product name, executable name, app ID, shortcut behavior, output directory, and artifact naming remain unchanged.

## Rollback

Revert the Electron upgrade commits in reverse order and reinstall from the restored lockfile with `npm ci`. Rebuild and repackage before distribution. Do not delete or replace the per-user data directory: Electron 43 introduced no schema or data migration, so schema 6 data remains compatible with the prior Phase A runtime.

## Known limitations

- Live human installer-over-existing-installation testing remains required before release acceptance.
- The project still uses its pre-existing default Electron icon.
- The preserved `signAndEditExecutable: false` setting skips executable resource editing and code signing.
- An initial sandboxed launch could not persist the database outside the repository and exited; the approved unsandboxed Windows smoke test passed. This was an automation-environment restriction, not an application compatibility failure.

## Evidence

Evidence is stored under `docs/screenshots/v0.5.2-electron/`.
