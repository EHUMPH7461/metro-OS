# Metro Command Center Architecture

## v0.5 AI boundary

The renderer sends typed task requests through a narrow preload bridge. Provider selection, environment credentials, retries, persistence, and external-network capability remain in the Electron main process. The provider interface is vendor-neutral. SQLite schema v6 stores generation sessions and feedback events; secrets and image binaries are excluded.

## Sprint 4 analytics boundary

Electron returns fixed typed analytics records; the renderer never submits SQL. Pure calculations live in `src/domain/analytics.ts`. CSV is validated in Electron and written only after a native save-dialog selection. Additive schema version 5 retains all v0.3.0 rows and photo paths.

## Active application

The repository-root Electron/Vite project is the only active application. Root `package.json`, `electron/`, `shared/`, `src/`, and the root build configuration are authoritative. `apps/desktop/`, `packages/*`, and `db/schema.ts` remain inactive scaffolding and must not be imported or activated without an approved consolidation plan.

## Source organization

```text
electron/                 Privileged lifecycle, IPC validation, sql.js, persistence
shared/inventory.ts       Dependency-free cross-process contracts and constants
src/App.tsx               Application orchestration and transient state
src/components/common/    App shell, sidebar, reusable error presentation
src/features/dashboard/   Dashboard page, KPI cards, activity, quick actions
src/features/inventory/   Workspace, toolbar, table, rows, cells, modal, filters
src/domain/               Pure calculations
src/services/             Typed preload calls and structured error conversion
src/types/                Renderer/global bridge declarations
```

`dist/` and `dist-electron/` are generated output, not source.

## Process and security boundaries

- Electron main owns lifecycle, the `BrowserWindow`, database access, filesystem writes, and IPC handlers.
- Preload exposes only named `window.metro.inventory` methods through `contextBridge`.
- The renderer is an unprivileged React application and must not import Electron, Node, or sql.js.
- Keep `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true`.
- Main validates every privileged input, including IDs, editable field names, SKU, statuses, lengths, numeric bounds, and dates. Renderer input is never trusted.
- IPC returns serializable `IpcResult<T>` values. UI messages omit stack traces, SQL, database paths, and filesystem details.
- The packaged CSP permits only local application resources. Development additionally permits Vite's localhost HTTP/WebSocket connection and `unsafe-eval` for tooling; those exceptions are not present in packaged builds.

## Inventory data flow

```text
React draft -> typed service -> preload channel -> runtime validation -> database operation
            <- IpcResult<T>  <- serialized result/error <- safe sql.js persistence
```

Search, filtering, sorting, modal state, and edit drafts stay in the renderer. Create and update failures retain the applicable draft and display a dismissible, retryable error banner. The database remains authoritative for persisted profit and ROI.

## Contracts and calculations

`shared/inventory.ts` is dependency-free and owns the persisted/input types, allowed statuses, editable fields, and structured error contract. It must not import React, Electron, Node, sql.js, or browser APIs.

Canonical calculations are:

```text
grossProfit = listPrice - purchasePrice
netProfit   = listPrice - purchasePrice - shippingCost - ebayFees
roi         = purchasePrice > 0 ? (netProfit / purchasePrice) * 100 : 0
```

SKUs use `MRR-YYYY-NNNNNN`. The generator increments the highest sequence for the year and checks the complete existing set; the database unique constraint is the final conflict guard. Legacy numeric `MRR-*` SKUs remain editable for compatibility.

## Database migrations and persistence

The sql.js byte export is stored under Electron's `userData` directory. `PRAGMA user_version` records the explicit schema version. Ordered migrations run transactionally, are safe to re-run after their version is recorded, preserve legacy rows, and never destructively remove data.

Persistence writes exported bytes to a temporary file, moves the previous database to a backup, and then renames the temporary file into place. If replacement fails, Metro OS restores the prior file and reloads it into memory. Persistence failures are returned as safe, retryable structured errors.

Future schema work must add an ordered migration and a representative legacy fixture test. Photo metadata should reference managed files rather than storing large image blobs in the inventory table.

## Testing and future modules

- `src/**/*.test.ts(x)` covers renderer calculations and service/error behavior.
- `electron/**/*.test.ts` covers validation, SKU/financial rules, migrations, and persistence recovery.
- Required validation is `npm install`, `npm run typecheck`, `npm test`, and `npm run build` on Node.js 22 LTS.

New modules belong under the active root architecture. Define a dependency-free contract, schema migration, narrow IPC surface, renderer service, feature UI, and proportional tests. Do not activate placeholder packages merely because matching names exist.

## Current technical debt

- Inventory list refreshes reload the full dataset after mutations; pagination or targeted updates may be needed at measured scale.
- sql.js exports the full database per write, so bulk imports will need transaction-aware batching.
- CSP development exceptions should be rechecked when Vite/Electron versions change.
- Automated end-to-end Electron tests and packaged Windows smoke tests are still future work.
