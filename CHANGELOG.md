# Changelog

## [Unreleased]

### Added

- Local Photo Manager with multi-file import, drag and drop, previews, ordering, primary-photo selection, and removal.
- Version 3 sql.js photo metadata migration and managed Electron user-data storage.
- Secure, validated photo IPC APIs and browser-generated thumbnails without native dependencies.

All notable changes to Metro Command Center are documented here following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Sprint 1.5 runtime validation for every privileged inventory IPC input.
- Serializable validation, conflict, missing-record, persistence, and unexpected error responses.
- Dismissible renderer error banner with retry support and edit-draft preservation.
- Explicit sql.js schema versions and ordered migration tests.
- Recovery-tested temporary-file and backup database persistence.
- Restrictive packaged and development-aware Content Security Policy.

### Changed

- Split the Sprint 1 renderer into common components, dashboard and inventory features, domain logic, services, and types without redesigning the UI.
- Consolidated renderer and Electron inventory contracts in dependency-free `shared/inventory.ts`.

## Sprint 1

- Added seven dashboard KPIs, Recent Activity, Quick Actions, expanded inventory fields, search, status filtering, sortable columns, inline editing, SKU generation, profit/ROI calculations, and storage tracking.

## [0.1.2] - Preserved stable working version

- Preserved the Windows-launchable Electron, React, TypeScript, Vite, and sql.js application on `stable-working-v0.1.2`.

[Unreleased]: https://github.com/EHUMPH7461/metro-OS/compare/stable-working-v0.1.2...HEAD
[0.1.2]: https://github.com/EHUMPH7461/metro-OS/tree/stable-working-v0.1.2
