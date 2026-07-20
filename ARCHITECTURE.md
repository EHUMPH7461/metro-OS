# Metro Command Center Architecture

## Current production architecture

The runnable application is the **repository-root Electron/Vite project**. Root `package.json`, `electron/`, `src/`, `index.html`, and the root Vite/TypeScript/Tailwind configuration form the active build. The repository also contains `apps/desktop/`, `packages/*`, and `db/schema.ts`; these are scaffold or placeholder code and are not referenced by the root scripts. They must not be treated as the production implementation until a deliberate consolidation is designed and tested.

## Folder structure

```text
.
├── electron/
│   ├── main.ts              Electron lifecycle, window, and IPC handlers
│   ├── preload.ts           Narrow contextBridge API
│   ├── database.ts          sql.js initialization, migration, CRUD, persistence
│   ├── database.test.ts     Database/domain tests
│   └── tsconfig.json        Electron build configuration
├── src/
│   ├── App.tsx              Current dashboard, inventory UI, and interactions
│   ├── App.test.tsx         Renderer/component tests
│   ├── inventory.ts         Renderer financial and dashboard calculations
│   ├── main.tsx             React entry point
│   ├── styles.css           Tailwind directives and application styles
│   └── types/inventory.ts   Renderer inventory contracts and preload typing
├── docs/                    Roadmap, integration notes, and screenshots
├── apps/desktop/            Inactive earlier renderer scaffold
├── packages/                Inactive module placeholders (AI, analytics, etc.)
├── db/schema.ts             Inactive Drizzle schema prototype
├── dist/                    Generated renderer build
├── dist-electron/           Generated Electron build
├── vite.config.ts           Active renderer build configuration
├── vitest.config.ts         Active test discovery configuration
└── package.json             Active scripts and dependencies
```

Generated directories are build output, not source of truth.

## Process boundaries

### Electron main

`electron/main.ts` owns application lifecycle, BrowserWindow construction, database initialization, and privileged IPC handlers. It may use Node and filesystem APIs. It loads the Vite development URL when supplied and otherwise loads `dist/index.html`.

### Preload

`electron/preload.ts` is the only bridge from renderer code to privileged operations. It exposes `window.metro.inventory` through `contextBridge` while context isolation is enabled. It must stay small, declarative, and free of business UI logic.

### Renderer

`src/` runs as an unprivileged browser application. It renders React, holds transient UI state, performs instant client-side sorting/filtering, previews calculations, and calls the typed preload API for durable operations. Renderer code must not import Electron, Node filesystem modules, or database libraries.

## IPC rules

- Use explicit, namespaced channels such as `inventory:list` and `inventory:update`.
- Add every channel in main and preload together, then update the `Window.metro` TypeScript contract.
- Renderer callers send domain inputs, never SQL, file paths, or arbitrary method names.
- Main-process handlers validate IDs, strings, statuses, numeric bounds, and allowed fields before writing.
- Return serializable domain objects or structured errors.
- Do not expose `ipcRenderer`, filesystem access, shell execution, or generic invoke functions to the renderer.
- Prefer one handler per user intent; group multi-write operations in a database transaction when introduced.

The current handlers type create/update payloads as `unknown` in preload but trust them in main. Runtime validation at the handler boundary is required technical follow-up.

## React organization

`src/App.tsx` currently contains the dashboard, inventory table, add modal, filters, sorting, and inline editing in one component. Preserve its behavior while moving future work toward:

```text
src/
├── components/       Reusable presentation components
├── features/         Module-specific UI, hooks, and orchestration
├── pages/            Top-level screens
├── services/         Typed calls to window.metro
├── types/            Shared renderer contracts
└── domain/           Pure calculations and validation
```

Components should receive typed props, keep calculations in pure modules, and avoid duplicating database normalization rules. Split components when they have independent state, testing value, or reuse—not only to reduce line count.

## TypeScript domain contracts

`src/types/inventory.ts` is the current renderer contract. `InventoryItem` represents a persisted record, `InventoryInput` omits database/calculated fields, and `InventoryStatus` defines the allowed statuses. `electron/database.ts` currently duplicates an `InventoryInput` shape. A future shared, dependency-free contract package may remove this duplication, but it must be compatible with both Electron and renderer TypeScript builds and must not pull browser or Node runtime code across the boundary.

## Persistence and migrations

`electron/database.ts` initializes `sql.js`, storing the exported database at `app.getPath('userData')/metro-os.sqlite`. Although the filename uses `.sqlite`, persistence is an exported sql.js database byte array written after mutations.

The current migration strategy:

1. Open the existing byte file or create an in-memory database.
2. Create the current inventory table when absent.
3. Inspect columns with `PRAGMA table_info(inventory)`.
4. Add missing columns through idempotent `ALTER TABLE` statements.
5. Copy legacy `cost` into `purchase_price` where needed.
6. Backfill `updated_at`, profit, and ROI.
7. Export the database after migration and every successful mutation.

Future migrations must be ordered, idempotent, tested against representative legacy files, and non-destructive by default. Add an explicit schema-version mechanism before migrations require data transforms, table rebuilds, or multiple modules. Write through a temporary file and replace atomically when feasible; create backups before risky upgrades.

The inactive `db/schema.ts` uses Drizzle concepts and an older schema. It is not authoritative and must not drive migrations unless the application intentionally adopts and integrates it.

## Inventory calculations

The canonical rules are:

```text
grossProfit = listPrice - purchasePrice
netProfit   = listPrice - purchasePrice - shippingCost - ebayFees
roi         = purchasePrice > 0 ? (netProfit / purchasePrice) * 100 : 0
```

ROI is rounded to two decimals by application calculation code. The renderer recalculates previews immediately; the database layer recalculates persisted `profit` and `roi` and therefore remains authoritative. Dashboard totals multiply purchase price, list price, and profit by quantity. Financial changes require parity tests for renderer and persistence behavior.

## SKU generation

`nextSku()` uses `MRR-YYYY-NNNNNN`. It filters existing SKUs for the requested year, finds the highest numeric suffix, increments it, pads to six digits, and checks the full existing set before returning. Creation also rejects a duplicate and the database has a unique constraint. SKU allocation currently occurs immediately before insert in the single-process database flow; future concurrent import or background workflows must make allocation and insert atomic.

## State and data flow

```text
User action → React local state → window.metro preload API
            → named IPC handler → database normalization/calculation
            → sql.js mutation → exported database file
            → serialized InventoryItem → React refresh/render
```

Search, filters, sorting, modal visibility, and edit drafts are transient renderer state. Persisted records are reloaded after Electron-backed mutations. The browser-only fallback data in `App.tsx` supports renderer tests/demos and is not production persistence.

## Error handling

- Validate at the privileged boundary and reject invalid input with actionable messages.
- Catch IPC failures in the renderer and show a durable, user-readable error state.
- Never silently discard a failed database export.
- Include operation and safe record identifiers in diagnostic logs; exclude secrets and unnecessary customer data.
- Distinguish validation, conflict, persistence, integration, and unexpected errors.
- Do not show raw stack traces or filesystem locations in normal UI.
- External integrations must use bounded timeouts, retry only idempotent operations, and surface partial success.

The current renderer does not consistently present IPC errors, and synchronous database writes are not wrapped in recovery/atomic-replace behavior. These are known technical-debt items.

## Security requirements

- Keep `contextIsolation: true`, `nodeIntegration: false`, and `sandbox: true`.
- Maintain a minimal preload API and validate all IPC input in main.
- Do not load arbitrary remote content in the Electron window.
- Define a restrictive Content Security Policy before adding external resources.
- Store credentials outside the database and source tree using an approved secure mechanism.
- Never commit API keys, tokens, customer data, or production database files.
- Sanitize imported CSV/text and escape all rendered data through React.
- Require explicit user confirmation for destructive bulk actions, publication, and restore operations.
- Review dependencies for native binaries, install scripts, licensing, and vulnerabilities.

## Testing structure

- `src/**/*.test.ts(x)`: pure renderer calculations and component behavior.
- `electron/**/*.test.ts`: database calculations, SKU behavior, migration behavior, and CRUD rules.
- `vitest.config.ts`: excludes generated output and dependencies.
- Future feature tests should live beside the relevant feature or in the applicable process directory.
- Add fixture-driven migration tests before changing persistence, and Windows smoke tests before release.

Required validation remains `npm install`, `npm run typecheck`, `npm test`, and `npm run build` on Node.js 22 LTS.

## Performance guidelines

- Keep search/filter/sort responsive for normal inventory sizes; measure before adding complexity.
- Avoid unnecessary full-list reloads or React rerenders for each keystroke beyond local filtering.
- Debounce expensive integration queries, not simple in-memory search.
- Batch imports and database writes, using transactions where available.
- Avoid exporting the entire sql.js database more often than necessary during bulk operations.
- Paginate or virtualize tables when measured row counts make rendering slow.
- Keep IPC payloads bounded and return summaries rather than large binary assets.
- Store photos as managed files with metadata, not large blobs in the primary inventory table, unless profiling supports another design.

## Adding future modules

1. Define the domain contract and ownership boundary first.
2. Add schema changes through tested, versioned migrations.
3. Add explicit IPC handlers and a narrow preload surface only for privileged work.
4. Keep pure calculations outside React components and Electron lifecycle code.
5. Add feature UI under the active root `src/` architecture unless a separately approved consolidation replaces it.
6. Add unit, integration, migration, and user-flow tests proportional to risk.
7. Update product specification, roadmap, changelog, and screenshots.
8. Run all validation commands and Windows launch testing where applicable.
9. Do not activate placeholder packages merely because they exist; reconcile or remove competing contracts as part of an intentional architecture change.
