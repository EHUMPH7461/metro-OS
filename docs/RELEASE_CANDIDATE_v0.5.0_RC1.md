# Metro Command Center v0.5.0 RC1

Status: release candidate prepared on `release/v0.5.0-rc1`; not merged or tagged.

## Candidate identity

- Product: Metro Command Center
- Company: Metro Refined Racks
- Application version: `0.5.0-rc.1`
- Electron: `43.2.0`
- Executable: `MetroCommandCenter.exe`
- App ID: `com.metrorefinedracks.metrocommandcenter`
- Database schema: `6`

The Windows executable reports Product `Metro Command Center`, Company `Metro Refined Racks`, description `Metro Command Center`, and file version `0.5.0-rc.1`.

## Scope

This candidate packages the validated v0.5 AI Listing Assistant, Action Center, Analytics, Listing Workspace, Photo Manager, and inventory workflows. Release preparation changed version and Windows metadata, removed development wording from release-facing UI, generated RC1 documentation/evidence, and rebuilt Windows artifacts. It adds no feature or database migration.

## Validation

| Check | Result |
|---|---|
| `npm ci` | Passed |
| Typecheck | Passed |
| Tests | 62/62 passed across 11 files |
| Renderer build | Passed; 1,601 modules |
| Electron build | Passed |
| NSIS installer | Passed |
| Portable build | Passed |
| Unpacked build | Passed |
| Silent installer upgrade | Passed; exit code 0 |
| Installed application launch | Passed; running after 10 seconds |
| Portable launch | Passed; running after 15 seconds |
| Browser regression | Passed; no console errors |
| `npm audit` | 0 vulnerabilities |

The final installer replaced the test installation at the existing per-user MetroCommandCenter location, preserved the Start Menu shortcut target, and launched successfully.

## Data preservation

After installer and portable smoke testing:

- Schema version: `6`
- Inventory records: `5`
- Listing records: `5`
- Photo records: `5`
- Managed photo files: `10`
- AI history remained present

No migration or database behavior change was added. User data remains in Electron's existing per-user application-data directory.

## Artifacts

| Artifact | Size | SHA-256 |
|---|---:|---|
| `release/MetroCommandCenter-0.5.0-rc.1-Setup.exe` | 105,257,197 bytes | `7AE5831130C3F819CD4AA402CC15D7389A5574D2199ECA2199F687AAC3C426DB` |
| `release/MetroCommandCenter-0.5.0-rc.1-Portable.exe` | 92,286,640 bytes | `DD9230B4C45A3EE23B06D1A303ABC60EFEBD5F331DEEEECA31E2BF50A107EE2D` |
| `release/win-unpacked/MetroCommandCenter.exe` | 225,614,336 bytes | `3A610EBADA5B8AE2D08BCB9C4DE02FEAB818B53B6C7CDB0028476C0C027C3DD9` |

## Release decision checklist

- Review this branch and its screenshots.
- Perform human interactive Windows acceptance of install, upgrade, navigation, persistence, and uninstall behavior.
- Confirm the unsigned/default-icon limitations are acceptable for RC testing.
- Do not create a final tag or merge until approval is recorded.

## Known limitations

- No approved Metro Command Center `.ico` asset exists in the repository, so electron-builder retains the default Electron icon. No branding was invented.
- Artifacts are unsigned. `signExecutable: false` preserves resource metadata while intentionally skipping code signing.
- Automated silent installer upgrade and process-level launch testing passed; final human interactive acceptance remains pending.

## Rollback

Reinstall the previously approved package or revert the RC preparation commits, restore the earlier lockfile/package version, run `npm ci`, and rebuild. Do not delete the per-user application-data directory; schema 6 remains compatible and should be preserved.
