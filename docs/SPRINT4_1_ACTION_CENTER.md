# Sprint 4.1 — Interactive Action Center

Sprint 4.1 turns Analytics data-quality warnings into accessible workflow shortcuts. Each card reports its exact affected-record count and opens a filtered Inventory, Photo Manager, or Listing Workspace queue. A return banner preserves the route back to Analytics.

## Inventory Health

The 0–100 score uses nine real completeness checks. For each check, its weighted failure rate is affected records divided by filtered records:

    round(100 - 100 × sum(weight × failure rate) / sum(weights))

Weights are listing price 17, photos 15, readiness 13, cost 12, category 10, freshness 10, storage 8, title validity 8, and brand 7. Each distinct deficiency is counted once. Labels are Excellent (90–100), Good (75–89), Needs Attention (50–74), and Critical (0–49). Empty inventory displays “No inventory.”

## Severity and priority

Severity thresholds are Complete (0), Attention (1–3), Elevated (4–9), and Urgent (10+). Color is supplemented by text, icons, borders, and counts. Priority sorting places open issues first, then uses listing-blocking weight, affected count, and a fixed issue order. Category and Count sorts are also available.

## Business impact

Estimated value is persisted positive listing price. Estimated profit is listing price minus purchase cost, shipping cost, and eBay fees. Inventory cost tied up is persisted purchase cost. Incomplete records are excluded and show their qualified fraction or “Insufficient financial data.” Revenue and realized profit are never inferred.

## Navigation and saved workflows

| Action | Destination | Built-in workflow |
|---|---|---|
| Missing photos | Photo Manager | Needs Photos |
| Missing storage | Inventory | Needs Storage |
| Missing cost | Inventory | Missing Cost |
| Missing listing price | Listing Workspace | Needs Pricing |
| Missing category | Inventory | Needs Category |
| Missing brand | Inventory | Needs Brand |
| Titles over 80 characters | Listing Workspace | Title Errors |
| Listings below 50% readiness | Listing Workspace | Low Readiness |
| Inventory over 90 days old | Inventory | Stale Inventory |

Inventory also exposes Ready to List. Listing Workspace retains existing ad hoc filters. Active state is visible, resettable, and stored for the session. Built-ins are code-defined and cannot be deleted.

## Action report CSV

The existing secure Electron save-dialog IPC exports the current filtered Action Center state. Fields are issue type, severity, item identifier, SKU, title, status, readiness, estimated value, estimated profit, storage location, and record age. CSV escaping and date-stamped filenames are enforced. Empty export is disabled.

## Limitations and deferred work

- Bulk storage, category, and brand mutation is deferred because no transactional multi-record edit pattern exists. Sprint 4.1 provides filtered queues instead.
- Estimates can be partial and show the qualified record count.
- The Action Center operates on the active Analytics filter set.
- No database migration or native dependency was added.
