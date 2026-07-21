# Metro Command Center Roadmap

## Sprint 1 - Completed

Dashboard KPIs, inventory expansion, search, filtering, inline editing, unique SKU generation, profit calculations, and storage tracking are complete.

## Sprint 1.5 - Architecture hardening

This sprint prepares the active application for later modules without changing Sprint 1 behavior.

Acceptance criteria:

- Renderer responsibilities are split into feature, component, service, domain, and type boundaries.
- Renderer and Electron share one dependency-free inventory contract.
- Privileged inputs are runtime validated and failures are readable and serializable.
- Schema changes are explicitly versioned, ordered, non-destructive, and migration-tested.
- Interrupted persistence preserves or restores the previous database.
- Packaged Electron uses a restrictive CSP while documented development exceptions support Vite.
- Existing Sprint 1 tests and user flows remain intact; required validation passes.

## Sprint 2 - Photo Manager (planned)

Attach, preview, reorder, rotate, remove, and select cover photos using managed local files and database metadata. Acceptance requires restart-safe metadata, clear missing-file handling, non-destructive removal policy, migration coverage, and Windows smoke tests.

## Sprint 3 - AI Listing Assistant (planned)

Generate editable titles, descriptions, item specifics, and pricing suggestions with explicit human approval. Acceptance requires protected credentials, source transparency, safe offline/error behavior, and no silent overwrites.

## Sprint 4 - Analytics (planned)

Add sales, margin, ROI, sell-through, aging, and trend views. Acceptance requires documented deterministic formulas, consistent filters, legacy/empty-state handling, and responsive measured performance.

## Sprint 5 - eBay workflow, portability, backups, and packaging (planned)

Add confirmed eBay publication/sync, CSV preview/import/export, verified backup/restore, and repeatable Windows packaging. Acceptance requires idempotent integrations, visible partial failures, duplicate protection, checksum-tested recovery, and clean-machine launch validation.

## Future ideas

Orders, shipping, returns, barcode labels, mobile intake, multi-location counting, repricing, supplier settlements, scheduled work queues, shared synchronization, and duplicate detection remain discovery items, not implemented features.
