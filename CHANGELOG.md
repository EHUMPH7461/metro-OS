# Changelog

## [0.5.0-rc.1] - 2026-07-21

- Prepared Windows RC1 identity and artifact naming for Metro Command Center.
- Corrected embedded Windows Product, Company, description, and file-version metadata while keeping code signing disabled.
- Removed development wording from release-facing AI, Analytics, version, and browser sample-data surfaces.
- Validated all 62 tests, schema 6 preservation, installer upgrade, installed/portable launch, and zero npm audit findings.
- Added RC1 documentation and screenshots. No feature or database migration was added.

## 0.5.2-electron-maintenance-candidate

- Upgraded the packaged Electron runtime from 33.4.11 to 43.2.0.
- Resolved the remaining Electron runtime audit entry; final `npm audit` reports zero vulnerabilities.
- Preserved schema version 6, existing inventory, photos, listings, AI history, user-data paths, security settings, and packaging identity.
- Validated all 62 tests, renderer and Electron builds, NSIS installer, portable artifact, unpacked build, browser workspaces, and automated packaged launches.

## 0.5.1-maintenance-candidate

- Updated Vitest from 2.1.9 to 4.1.10 and removed its vulnerable nested Vite/esbuild toolchain.
- Updated electron-builder from 25.1.8 to 26.15.3, resolving the vulnerable packaging chain and critical tar exposure.
- Updated PostCSS from 8.5.19 to 8.5.21 without changing Tailwind or Vite.
- Preserved application behavior, packaging identity, database schema version 6, offline AI behavior, and all 62 tests.
- Retained the known Electron 33.4.11 runtime advisory for a separately tested Phase B upgrade.

## 0.5.0-development

- Added secure provider-neutral AI IPC and deterministic offline generation.
- Added schema v6 AI sessions and feedback history without changing inventory or photo paths.
- Added ten user-triggered listing-assistance tasks, review controls, settings, stale detection, and safe batch analysis.
- Added versioned prompts, injection resistance, output policy checks, and 18 new automated tests.

## 0.4.1-development

- Made all nine Action Center checks accessible workflow links.
- Added weighted Inventory Health, severity labels, priority sorting, and qualified impact estimates.
- Added built-in Inventory and Listing Workspace queues with return-to-Analytics navigation.
- Expanded secure CSV export to item-level action-report rows.

All notable changes follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions.

## [Unreleased]

### Added

- Sprint 4 analytics for inventory, pipeline, productivity, aging, category, brand, storage, sales, and data quality.
- Session-scoped filters, secure CSV export, schema version 5, and dashboard business snapshot.

## [0.3.0-rc.1] - 2026-07-20

### Added

- Sprint 2 Photo Manager with local multi-file import, previews, ordering, primary-photo selection, removal, browser-generated thumbnails, and validated IPC.
- Sprint 3 Listing Workspace with searchable readiness queue, missing-requirement filters, listing preparation fields, photo context, validation, and workflow statuses.
- Version 3 photo metadata and version 4 listing migrations that preserve existing inventory and photo records.
- Windows NSIS installer and portable release-candidate packaging.
- Installation, user, backup, and release documentation.

### Changed

- Product identity updated to Metro Command Center `0.3.0-rc.1` for Metro Refined Racks.
- Installer shortcuts use the Metro Command Center product name and preserve per-user data during uninstall and upgrade.

## [0.1.2] - Preserved stable working version

- Preserved the Windows-launchable Electron, React, TypeScript, Vite, and sql.js application on `stable-working-v0.1.2`.

[Unreleased]: https://github.com/EHUMPH7461/metro-OS/compare/v0.3.0-rc.1...HEAD
[0.3.0-rc.1]: https://github.com/EHUMPH7461/metro-OS/compare/stable-working-v0.1.2...release/v0.3.0-rc1
[0.1.2]: https://github.com/EHUMPH7461/metro-OS/tree/stable-working-v0.1.2
