# Metro OS GitHub Setup

This folder is the professional source-of-truth version of Metro OS.

## Upload to the existing repository

Repository: `EHUMPH7461/metro-OS`

Upload all files and folders in this directory to the repository's `main` branch. Do not upload `node_modules`, `dist`, `dist-electron`, or `release`.

## Build on GitHub

1. Open the repository on GitHub.
2. Select **Actions**.
3. Select **Build Windows Release**.
4. Select **Run workflow**.
5. When the run finishes, open it and download the `Metro-OS-Windows-v0.1.4` artifact.

The artifact contains the Windows installer and portable `.exe`.

## Build locally

Double-click `BUILD_WINDOWS_APP.bat`. It performs a clean dependency install, runs checks, and builds both Windows targets.
