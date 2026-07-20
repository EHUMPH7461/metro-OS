# Metro OS Sprint 1.1

Windows desktop command center for Metro Refined Racks.

## What changed

Sprint 1.1 replaces the native `better-sqlite3` addon with `sql.js`. This removes the Node/Electron ABI mismatch that prevented the original Sprint 1 package from launching on Windows.

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

## Professional Windows releases

Metro OS includes a Windows GitHub Actions workflow at `.github/workflows/windows-release.yml`. Run it manually from the Actions tab to create downloadable installer and portable application artifacts on a real Windows runner.

For a local Windows build, double-click `BUILD_WINDOWS_APP.bat`. The script performs a clean install before compiling, preventing stale or incomplete `node_modules` folders from causing missing `tsc` errors.
