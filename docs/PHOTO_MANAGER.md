# Sprint 2 Photo Manager

Metro OS stores original product photos and 320×320 JPEG thumbnails under Electron's `userData/inventory-photos/<inventory-id>` directory. The sql.js database stores metadata only. Imported files are copied into this managed directory, so moving or deleting the source file does not affect Metro OS.

## Workflow

1. Open **Photo Manager** from the sidebar.
2. Select an inventory item.
3. Drag JPEG, PNG, or WebP files onto the import area, or choose multiple files.
4. Preview photos, change their order, select a primary photo, or remove photos.

The first imported photo becomes primary. Removing it promotes the next photo. Duplicate content is detected per inventory item with a SHA-256 fingerprint. Files must be non-empty and no larger than 20 MB.

## Architecture and security

The renderer reads user-selected files and produces thumbnails with Canvas. It sends validated base64 payloads to the preload's narrow `photos` API. Electron main validates identifiers, MIME type, size, filename, and managed paths before writing files. The renderer does not receive unrestricted Node or filesystem access; context isolation stays enabled and Node integration stays disabled.

Database schema version 3 adds `inventory_photos`, an inventory-position index, a per-item fingerprint constraint, and a partial unique index that permits at most one primary photo per item. The migration is transactional and idempotent for existing databases.

## Backups and limitations

A complete backup must include both `metro-os.sqlite` and the `inventory-photos` directory. Missing files display a safe empty image rather than crashing the application. This release does not crop, rotate, color-correct, upload, or synchronize photos with eBay.
