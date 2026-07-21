# Sprint 4 Analytics

The Analytics workspace derives operational metrics from persisted Metro Command Center records. Browser-only sample records are development fixtures; packaged production views query the database through typed Electron IPC and never fabricate sales.

## Definitions

- Inventory cost: recorded purchase prices.
- Estimated value: current listing prices, not realized revenue.
- Estimated profit: listing price minus cost, recorded marketplace fees, and seller-paid shipping.
- Realized gross profit: sale price minus purchase cost.
- Realized net profit: sale price minus purchase cost, marketplace fees, seller-paid shipping, and other recorded selling costs.
- Profit margin: realized net profit divided by realized revenue.
- Sell-through: sold records divided by all filtered records.
- Readiness: completed persisted listing checklist requirements.
- Inventory age: purchase date, falling back to record creation date; buckets are 0–30, 31–60, 61–90, 91–180, and over 180 days.

Revenue and realized profit return **Incomplete** whenever a sold record lacks a persisted sale price. Storage reports item counts, not capacity percentages, because no capacity field exists. No backup timestamp is shown because backup metadata is unavailable.

## Filters and exports

Date, status, category, brand, storage, and readiness filters update every section and persist in `sessionStorage` during the current app session. Category, brand, aging, and action CSV exports use proper quote escaping and date-stamped filenames. Packaged exports use Electron's native save dialog; renderer code cannot choose an arbitrary path.

## Schema version 5

Migration 5 adds nullable `sale_price` and `other_selling_costs`, plus non-destructive `sold_status_at` and listing `completed_at` timestamps. Existing inventory, listings, photos, and managed photo paths remain unchanged. Backfills use existing dates only.

## Limitations

- Sale price and other selling costs are not yet editable in the inventory form.
- Storage capacity is not modeled.
- Weekly activity uses persisted creation and completion timestamps only.
