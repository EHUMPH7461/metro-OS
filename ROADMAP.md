# Metro Command Center Roadmap

This roadmap sequences production capabilities while preserving the launch-tested `stable-working-v0.1.2` baseline. Sprint numbering describes product scope, not an automatic release commitment.

## Sprint 1 — Command Center and inventory foundation (completed)

Delivered:

- Seven dashboard KPI cards.
- Recent Activity and Quick Actions.
- Expanded backward-compatible inventory schema.
- Instant inventory search and status filtering.
- Sortable columns and inline editing.
- Unique `MRR-YYYY-NNNNNN` SKU generation.
- Gross profit, net profit, and ROI calculations.
- Searchable bin, rack, shelf, and drawer tracking.
- Renderer and database tests plus application screenshots.

Acceptance criteria:

- Existing inventory loads after migration.
- All required inventory fields can be persisted.
- Generated SKUs do not duplicate existing SKUs.
- Financial values update immediately and persist consistently.
- Search includes item identity and all storage coordinates.
- `npm install`, typecheck, tests, and production build pass.

## Sprint 2 — Photo Manager

Scope:

- Attach multiple photos to an inventory item.
- Import, reorder, rotate, remove, and preview photos.
- Track cover photo and photo readiness.
- Store managed files locally with database metadata and recovery-safe paths.
- Show missing-photo and upload-readiness states.

Acceptance criteria:

- A user can add, reorder, rotate, select a cover, and remove photos without corrupting the inventory record.
- Supported formats, file-size limits, and errors are clear.
- Photo metadata survives restart and missing files are reported safely.
- Removing an item or photo follows an explicit recoverable policy.
- Existing databases migrate without losing inventory.
- Automated tests cover metadata, file failure, and primary user flows; required validation and Windows smoke tests pass.

## Sprint 3 — AI Listing Assistant

Scope:

- Draft eBay-ready titles and descriptions from inventory attributes.
- Suggest item specifics and pricing ranges.
- Review photo readiness and identify missing information.
- Preserve human review and approval before saving or publishing.
- Provide offline and unavailable-service behavior.

Acceptance criteria:

- AI suggestions never overwrite source inventory facts without confirmation.
- Generated content shows its source inputs and can be edited or rejected.
- Secrets remain outside the repository and renderer.
- Timeouts, usage errors, and unavailable service states do not block inventory work.
- Representative outputs and safety boundaries are tested; required validation passes.

## Sprint 4 — Analytics

Scope:

- Sales, margin, ROI, sell-through, and inventory-aging views.
- Trends by brand, category, supplier, status, and date range.
- Operational alerts for stale listings and low-margin inventory.
- Clear metric definitions and exportable summaries.

Acceptance criteria:

- Every displayed metric has a documented formula and deterministic tests.
- Date and status filters produce consistent dashboard and report totals.
- Empty, partial, and legacy data are handled without misleading results.
- Normal inventory volumes remain responsive.
- Required validation and visual regression review pass.

## Sprint 5 — eBay workflow, data portability, backups, and packaging

Scope:

- Assisted eBay listing publication and status synchronization.
- CSV inventory import and export with preview, validation, and error reporting.
- Local backup, restore, and migration recovery workflows.
- Repeatable Windows packaging and installer/release documentation.

Acceptance criteria:

- External publication requires a final user confirmation and records the result.
- Synchronization is idempotent and exposes partial failures.
- CSV import previews changes, rejects or reports invalid rows, and does not create duplicate SKUs.
- Export includes the documented inventory contract.
- Backup and restore are checksum-verified and tested with representative legacy data.
- A clean Windows machine can install, launch, retain data, and uninstall without undocumented manual fixes.
- Required validation, integration tests, backup/restore tests, and Windows release smoke tests pass.

## Future release ideas

- Orders, shipping, returns, and customer-service workflows.
- Barcode/label printing and mobile-friendly intake.
- Multi-location storage and cycle counting.
- Inventory aging automation and repricing recommendations.
- Consignor and supplier settlement reporting.
- Scheduled reports and daily work queues.
- Role-based access and shared synchronization if the product moves beyond one local operator.
- Duplicate-photo and duplicate-item detection.
- Marketplace expansion after the eBay workflow is stable.

Future ideas require their own discovery, privacy review, architecture decision, and measurable acceptance criteria before entering a sprint.
