# Changelog

All notable changes to Metro Command Center are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project intends to use semantic versioning when formal releases resume.

## [Unreleased]

### Added

- Project specification, architecture guidance, roadmap, and contribution workflow.
- Sprint 1 application screenshots under `docs/screenshots/sprint1/`.

## Sprint 1 — 2026-07-20

### Added

- Command Center dashboard with Total Inventory, Active Listings, Sold Today, Sold This Week, Inventory Cost, Inventory Value, and Estimated Profit KPIs.
- Recent Activity and Quick Actions dashboard sections.
- Expanded inventory records covering item attributes, costs, fees, calculated profit and ROI, quantity, storage coordinates, sourcing, lifecycle dates, eBay item ID, status, notes, and timestamps.
- Backward-compatible sql.js inventory migration.
- Instant search across inventory identity and storage fields.
- Status filtering, sortable columns, and inline editing.
- Unique yearly SKU generation using the `MRR-YYYY-NNNNNN` format.
- Gross profit, net profit, and ROI calculation support.
- Bin, rack, shelf, and drawer storage tracking.
- Focused renderer and database tests.

### Changed

- Inventory operations were expanded from the preserved Sprint 1.2 baseline into the first production Command Center workflow on a feature branch.

## [0.1.2] — Preserved stable working version

### Added

- Windows-launchable Electron, React, TypeScript, and Vite application.
- Local inventory persistence through `sql.js`.
- Working inventory dashboard and `START_METRO_OS.bat` launcher.

### Changed

- Replaced the prior native SQLite approach with `sql.js` to avoid Electron/Node ABI failures on the tested Windows computer.

### Notes

- The preserved release remains available on `stable-working-v0.1.2` and is intentionally not modified by feature development.

[Unreleased]: https://github.com/EHUMPH7461/metro-OS/compare/stable-working-v0.1.2...HEAD
[0.1.2]: https://github.com/EHUMPH7461/metro-OS/tree/stable-working-v0.1.2
