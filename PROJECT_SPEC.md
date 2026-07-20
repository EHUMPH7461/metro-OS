# Metro Command Center Project Specification

## Product vision

Metro Command Center is the Windows desktop operations system for Metro Refined Racks. It should turn inventory intake, storage, listing, sales, and profitability into one dependable workflow that is fast enough for daily use and clear enough to support growth. The operating goal is to help Metro Refined Racks consistently reach **10–20 eBay sales per day** without losing control of item identity, location, cost, or margin.

The application is local-first. Core inventory work must remain available without GitHub Actions, cloud services, or an eBay connection.

## Supported technology

The production application uses:

- Electron for the Windows desktop shell and privileged operations.
- React for the renderer UI.
- TypeScript across Electron, renderer, domain contracts, and tests.
- Vite for renderer development and production builds.
- Tailwind CSS, supplemented by application CSS, for the visual system.
- `sql.js` for local SQLite-compatible persistence without native binaries.
- Vitest for unit and component tests.
- Node.js 22 LTS for development and release validation.

Native Node dependencies must not be introduced without explicit approval. In particular, persistence must not regress to native SQLite bindings that require Electron ABI-specific compilation.

## Product principles

- Preserve a known-good Windows release on `stable-working-v0.1.2`.
- Keep data entry efficient, keyboard-friendly, and understandable.
- Calculate operational metrics from stored facts rather than duplicate manual fields where practical.
- Prefer reversible migrations and backward compatibility over destructive schema replacement.
- Make important states, failures, and pending work visible.

## Branch strategy

- `stable-working-v0.1.2` is the preserved, launch-tested baseline. It must not receive feature development or be rewritten.
- Feature work branches from an explicitly named, validated base branch and uses `feature/<short-description>`.
- Fixes use `fix/<short-description>` and documentation-only work uses `docs/<short-description>` or a specifically requested feature branch.
- Changes are committed in logical units. Feature branches are reviewed and validated before any merge.
- A stable or release branch is updated only through an intentional release decision with a recovery plan.

## UI standards

Metro Command Center uses a dark-first, professional operations aesthetic: a dark navigation shell, high-contrast work surfaces, restrained blue accents, clear status colors, and dense but readable data views. New screens must:

- support the desktop minimum window size of 1080 × 700;
- use consistent spacing, typography, controls, status badges, and focus states;
- maintain WCAG-conscious contrast and visible keyboard focus;
- avoid decorative motion that slows repetitive work;
- keep primary actions obvious and destructive actions visually distinct;
- handle loading, empty, error, and populated states.

## Inventory data requirements

Every inventory record supports the following fields:

| Field | Requirement |
| --- | --- |
| `id` | Database-generated integer identity |
| `sku` | Required, unique item identifier |
| `title` | Required inventory/listing title |
| `brand`, `category`, `gender`, `size`, `color`, `condition` | Item attributes |
| `purchasePrice`, `listPrice`, `shippingCost`, `ebayFees` | Non-negative monetary inputs |
| `profit`, `roi` | Calculated financial values |
| `quantity` | Integer quantity, normally at least one |
| `bin`, `rack`, `shelf`, `drawer` | Searchable storage coordinates |
| `supplier` | Purchase source |
| `purchaseDate`, `listingDate`, `soldDate` | Lifecycle dates |
| `ebayItemId` | External listing identifier when available |
| `status` | Controlled workflow status |
| `notes` | Operational notes |
| `createdAt`, `updatedAt` | System timestamps |

Inputs must be normalized and validated at the Electron boundary before persistence. Existing inventory must continue to load after migrations.

## Inventory workflow

The implemented statuses are:

- `Draft`: acquired or entered, not yet actively listed.
- `Active`: listed and available for sale.
- `Sold`: sale completed; `soldDate` should be recorded.
- `Archived`: retained for history but removed from the active workflow.

Status changes should eventually be modeled as explicit workflow actions with validation and activity history. Until then, all modules must use the shared `InventoryStatus` contract and must not create competing labels.

## Financial rules

- Gross profit = `listPrice - purchasePrice`.
- Net profit = `listPrice - purchasePrice - shippingCost - ebayFees`.
- ROI = `(netProfit / purchasePrice) × 100`, rounded to two decimal places.
- ROI is zero when purchase price is zero.
- Dashboard cost, value, and estimated profit multiply per-item values by quantity.

## Testing and release requirements

Before a feature or release commit is considered ready, run on Node.js 22 LTS:

```text
npm install
npm run typecheck
npm test
npm run build
```

All commands must pass. Database migrations and calculation changes require focused tests. User-facing changes require screenshots and documentation updates. A Windows release must also be launch-tested through `START_METRO_OS.bat` on a clean or representative Windows environment, with existing inventory preserved or backed up.

## Planned application modules

1. Command Center dashboard
2. Inventory workspace
3. Photo Manager
4. Listing workflow
5. Orders and fulfillment
6. Financials and profit reporting
7. Analytics and operational reports
8. eBay integration
9. CSV import/export
10. Backup, restore, and packaging tools
11. Settings and diagnostics

## Future AI modules

AI features are optional assistants, never prerequisites for inventory access. Planned capabilities include listing title and description drafting, item attribute suggestions, pricing recommendations, photo quality checks, duplicate detection, inventory aging insights, sell-through forecasting, and daily operational prioritization. AI output must be reviewable before persistence or external publication, identify uncertainty, avoid exposing secrets or unnecessary customer data, and fail safely when offline.
