# Install Metro Command Center v0.3.0 RC1

## Requirements

- Windows 10 or Windows 11, 64-bit
- A user account allowed to install desktop applications

## Installer

1. Back up existing Metro Command Center data as described in [BACKUP.md](BACKUP.md).
2. Close any running Metro Command Center window.
3. Run `MetroCommandCenter-0.3.0-rc.1-Setup.exe`.
4. Choose the installation directory when prompted.
5. Leave the Desktop and Start Menu shortcuts enabled.
6. Start **Metro Command Center** and complete the smoke-test checklist in the release notes.

Windows may show a SmartScreen warning because the RC1 executable is not code-signed. Verify the filename and source before selecting **Run anyway**.

## Portable build

Run `MetroCommandCenter-0.3.0-rc.1-Portable.exe`. The executable is portable, but user data intentionally remains in the normal per-user application-data directory so upgrades preserve the database and managed photos.

## Upgrades and uninstalling

Install RC1 over the previous version. Database migrations run automatically on startup. The uninstaller is configured to preserve application data; use the backup guide before manually deleting it.
