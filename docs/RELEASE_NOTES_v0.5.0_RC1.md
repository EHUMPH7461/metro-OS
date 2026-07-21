# Metro Command Center v0.5.0 RC1 Release Notes

Metro Command Center v0.5.0 RC1 is a Windows testing candidate for Metro Refined Racks. It combines the existing inventory, photo, listing, analytics, Action Center, and offline AI-assisted listing workflows in a security-maintained Electron 43 package.

## Highlights

- Provider-neutral AI Listing Assistant with deterministic offline generation, explicit review and acceptance, history, settings, and safe batch analysis.
- Interactive Action Center with health scoring, prioritized repair queues, workflow navigation, impact estimates, and CSV reporting.
- Business Analytics covering inventory, pipeline, productivity, aging, category, brand, storage, sales, and data quality.
- Photo Manager, Listing Workspace, inventory editing, SKU generation, pricing calculations, filters, and persistence.
- Electron `43.2.0`, Vitest `4.1.10`, electron-builder `26.15.3`, PostCSS `8.5.21`, and zero current npm audit findings.

## Data and privacy

- Existing schema version 6 is unchanged.
- Inventory, listings, photos, managed photo files, and AI history are preserved during upgrade testing.
- The default AI provider is local and offline.
- Production OpenAI access is not activated; credentials remain main-process-only and photos are never uploaded automatically.

## Windows package names

- `MetroCommandCenter-0.5.0-rc.1-Setup.exe`
- `MetroCommandCenter-0.5.0-rc.1-Portable.exe`
- `MetroCommandCenter.exe` in `release/win-unpacked/`

## RC limitations

- This is not a final release and has not been tagged.
- Packages are unsigned.
- No approved Windows icon exists in the repository, so the default Electron icon remains.
- Automated upgrade and launch tests passed; human interactive Windows acceptance is still required.

See [RELEASE_CANDIDATE_v0.5.0_RC1.md](RELEASE_CANDIDATE_v0.5.0_RC1.md) for hashes, validation evidence, rollback, and the go/no-go checklist.
