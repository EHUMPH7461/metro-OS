# Metro OS Sprint 1.2

Windows desktop command center for Metro Refined Racks.

## What changed

Sprint 1.2 uses `sql.js` for local inventory storage. This avoids the native Node/Electron ABI mismatch that prevented the original Sprint 1 package from launching on Windows.

## Requirements

- Windows 10 or 11
- Node.js 22 LTS

## Start Metro OS

Open Command Prompt in this folder and run:

```cmd
npm install
npm run dev
```

The first command downloads the project dependencies. The second command builds the Electron process, starts Vite, and opens the Metro OS desktop window.

## Verification

```cmd
npm run typecheck
npm test
npm run build
```

Inventory is stored locally in the Metro OS application data folder as `metro-os.sqlite`.

## Sprint 2 Photo Manager

Open **Photo Manager** from the sidebar to import, preview, order, and choose a primary product photo for any inventory record. Photos remain local and work offline. See [Photo Manager documentation](docs/PHOTO_MANAGER.md) for storage, backup, and security details.

## Stable Working Version

1. Install Node.js 22 LTS.
2. Run `npm install`.
3. Double-click `START_METRO_OS.bat`.
