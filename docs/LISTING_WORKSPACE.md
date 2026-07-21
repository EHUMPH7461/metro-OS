# Sprint 3 Listing Workspace

The Listing Workspace connects inventory and managed photos to a repeatable preparation queue. Listing records are stored in sql.js schema version 4 and reference inventory by ID. Inventory remains the source for SKU, acquisition cost, storage location, and original product attributes; listing fields are initialized from those values and then hold marketplace-specific preparation data.

## IPC contracts

- `listings:queue` returns inventory context, photo readiness, listing data, missing requirements, and readiness percentage.
- `listings:save` accepts a validated inventory ID and complete listing input. Text, numeric values, workflow status, checklist data, and the 80-character title limit are validated in Electron main.

The preload exposes only `listings.queue()` and `listings.save()`. Renderer Node access remains disabled and filesystem access remains confined to Electron main.

## Readiness

An item reaches 100% when it has a photo, a primary photo, a valid title, description, required item specifics, positive price, and configured shipping. **Ready to list** cannot be saved until all requirements pass. No live eBay publishing is performed.
