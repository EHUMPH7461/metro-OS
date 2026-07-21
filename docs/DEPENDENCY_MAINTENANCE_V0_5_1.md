# v0.5.1 Dependency Maintenance Candidate

Status: maintenance candidate; not released or merged.

## Scope

Phase A updates only Vitest, electron-builder, and PostCSS. Electron is deliberately excluded for a separately tested Phase B runtime migration. No application feature, database migration, production AI provider, auto-update behavior, or code-signing behavior is introduced.

## Baseline

- Base branch: `feature/v0.5.0-ai-listing-assistant`
- Base commit: `7d7143d227d99e645b680e72f82fa8f7999746bd`
- Node: `v22.23.1`
- npm: `10.9.8`
- Lockfile version: `3`
- Application version: `0.5.0-development`
- Database schema: `6`
- Typecheck: passed
- Tests: 62 passed across 11 files
- Renderer build: passed; 1,601 modules transformed
- Electron TypeScript build: passed
- Audit: 15 vulnerable package entries (3 moderate, 10 high, 2 critical)

### Baseline dependency versions

| Package | Declared | Installed |
|---|---:|---:|
| Vitest | `^2.1.8` | `2.1.9` |
| electron-builder | `^25.1.8` | `25.1.8` |
| PostCSS | `^8.4.49` | `8.5.19` |
| tar | transitive | `6.2.1` |
| Vite | `^6.0.5` | `6.4.3` |
| vite-node | transitive | `2.1.9` |
| nested esbuild | transitive | `0.21.5` |

### Existing package output

- Installer: `release/MetroCommandCenter-0.3.0-rc.1-Setup.exe` (87,386,250 bytes)
- Portable: `release/MetroCommandCenter-0.3.0-rc.1-Portable.exe` (76,998,880 bytes)
- Unpacked executable: `release/win-unpacked/MetroCommandCenter.exe` (188,784,128 bytes)

These files predate this maintenance branch and are recorded only as the baseline. Final Phase A artifacts and checksums are recorded below after packaging.

## Validation record

| Stage | Typecheck | Tests | Renderer/Electron build | Audit result |
|---|---|---|---|---|
| Baseline | Passed | 62/62, 11 files | Passed | 15: 3 moderate, 10 high, 2 critical |
| Vitest 4.1.10 | Passed | 62/62, 11 files | Passed | 10: 9 high, 1 critical |
| electron-builder 26.15.3 | Passed | 62/62, 11 files | Passed | 1 high |
| PostCSS 8.5.21 | Passed | 62/62, 11 files | Passed | 1 high |
| Final clean `npm ci` | Passed | 62/62, 11 files | Passed | 1 high |

The final verbose test run specifically confirmed database migrations through schema version 6, v5-to-v6 record preservation, photo/listing preservation, atomic database recovery, deterministic offline AI generation, prompt-injection handling, cancellation, AI domain sanitation and confirmation, Action Center navigation mappings, analytics, CSV escaping, inventory validation, and photo validation. No paid API was called and no production network provider was activated.

Browser smoke checks covered Dashboard, Inventory, filtered action handling, and AI Assistant. The AI Assistant showed the deterministic review-first workspace without automatic generation. The packaged executable remained running after eight seconds in the automated launch smoke test. This is not a claim of human interactive Windows acceptance.

## Security comparison

| Severity | Vulnerable package/group | Previous | New | Role | Status | Explanation |
|---|---|---:|---:|---|---|---|
| Critical | Vitest | 2.1.9 | 4.1.10 | Direct test | Resolved | Upgrade removes the vulnerable UI-server range. |
| High/moderate | Nested Vite, vite-node, esbuild, @vitest/mocker | Vite 5.4.21; vite-node 2.1.9; esbuild 0.21.5; mocker 2.1.9 | Deduplicated to Vite 6.4.3/esbuild 0.25.12; mocker 4.1.10 | Transitive test | Resolved | Resolved through Vitest; no independent pins. |
| Critical/high | tar and electron-builder chain | tar 6.2.1; builder 25.1.8 | tar 7.5.20; builder 26.15.3 | Direct/transitive build | Resolved | Supported builder tree supplies app-builder-lib 26.15.3, @electron/rebuild 4.2.0, node-gyp 12.4.0, and tar 7.5.20. |
| High | Electron | 33.4.11 | 33.4.11 | Direct packaged runtime | Remaining | Explicitly excluded from Phase A; upgrade requires Phase B compatibility work. |

### Remaining packaged-runtime findings

`npm audit` reports one high-severity package entry for Electron `33.4.11`, aggregating current Electron advisories. This affects the packaged runtime and must not be dismissed. Phase B should target a supported secure Electron major and repeat IPC, CSP, renderer, database, packaging, upgrade-install, and live Windows tests.

### Remaining build findings

None reported by `npm audit`.

### Remaining development/test findings

None reported by `npm audit`.

## Compatibility and packaging changes

- No Vitest configuration, tests, snapshots, assertions, setup files, globals, mocks, fake timers, or coverage settings required changes.
- No electron-builder configuration required changes. Product name, app ID, executable name, targets, artifact templates, output directory, ASAR, file inclusion, shortcuts, installer mode, portable behavior, uninstall data preservation, and signing settings remain unchanged.
- No PostCSS, Tailwind, or Vite configuration changed. The production CSS artifact remained `27.87 kB` (`6.66 kB` gzip) with the same content-derived filename as baseline.
- No native application dependency, auto-update behavior, code signing, database migration, or product behavior was added.
- User data remains under Electron's `app.getPath('userData')`; the database is `metro-os.sqlite` and managed photos remain under `inventory-photos` in that directory.

## Final artifacts

| Artifact | Size | SHA-256 |
|---|---:|---|
| `release/MetroCommandCenter-0.5.0-development-Setup.exe` | 85,796,204 bytes | `4D3FD5D1F2B51CBC40B62B6A8C2E24D7A6A01710CFC6D74F35D74B98AFFEE2E9` |
| `release/MetroCommandCenter-0.5.0-development-Portable.exe` | 75,169,194 bytes | `BC451060433823FC6208E275DE4203E36273B95029783257E6B9F64038ECA0EA` |
| `release/win-unpacked/MetroCommandCenter.exe` | 188,784,128 bytes | `744C4211171A94D4DC300282B2D894702F26BAE8FB9E1353181CF1703D70EDD2` |

- Packaged Electron: `33.4.11`
- Packaged application: `0.5.0-development`
- Database schema: `6`
- No `rc.1` naming was introduced.
- Existing app ID remains `com.metrorefinedracks.metrocommandcenter`, avoiding a duplicate Windows identity.

## Evidence

- `docs/screenshots/v0.5.1-security-maintenance/application-launch.png`
- `docs/screenshots/v0.5.1-security-maintenance/dashboard-regression.png`
- `docs/screenshots/v0.5.1-security-maintenance/action-center-regression.png`
- `docs/screenshots/v0.5.1-security-maintenance/ai-assistant-regression.png`
- `docs/screenshots/v0.5.1-security-maintenance/packaged-app-about-or-version.png`
- `docs/screenshots/v0.5.1-security-maintenance/audit-before-summary.md`
- `docs/screenshots/v0.5.1-security-maintenance/audit-after-summary.md`

## Rollback

Revert the Phase A commits individually in reverse order. Reinstall from the restored lockfile using the repository's clean-install command, then rebuild and repackage. Do not delete or replace the user's application-data directory or inventory database during rollback.

## Known limitations

- Electron runtime security findings remain intentionally deferred to Phase B.
- Live interactive Windows acceptance testing requires a human and is not claimed by automated smoke tests.
- Packaging continues to use the default Electron icon because no application icon is configured.
- The preserved `signAndEditExecutable: false` setting skips executable resource editing as well as code signing under electron-builder 26.15.3.
- The first final portable rerun encountered a transient lock from an earlier smoke-test process; a clean retry completed successfully without source changes.
