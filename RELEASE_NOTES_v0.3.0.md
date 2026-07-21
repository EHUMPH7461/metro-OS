# Metro Command Center v0.3.0 RC1 Release Notes

Version `0.3.0-rc.1` delivers Sprint 2 photo preparation and Sprint 3 listing preparation on the validated Sprint 1.5 desktop architecture.

## Highlights

- Manage listing photos locally without native dependencies or cloud access.
- Prepare listings from a searchable queue and see exactly which requirements remain.
- Preserve existing inventory and photo records through automatic schema migrations.
- Install with Desktop and Start Menu shortcuts, or use the portable executable.

## Data and upgrades

The SQLite database and managed photo library live in Electron's per-user application-data directory. They are outside the installation directory and are not removed by the configured uninstaller. RC1 runs ordered migrations at startup and refuses a database created by a newer schema version.

## Known limitations

- RC1 is not code-signed, so Windows SmartScreen may warn during installation.
- RC1 uses Electron's default application icon and disables executable resource signing/editing to support packaging without Windows symlink privileges.
- Listing preparation is local; publishing directly to eBay is not part of RC1.
- A live interactive Windows installation/upgrade test is required before final approval and before creating any final `v0.3.0` tag.

## Manual Windows smoke-test checklist

- [ ] Verify installer filename and launch the NSIS installer.
- [ ] Confirm product, company, version, executable, install directory choice, Desktop shortcut, and Start Menu shortcut.
- [ ] Launch from the installer, Desktop shortcut, and Start Menu.
- [ ] Confirm the dashboard and seeded/existing inventory render without errors.
- [ ] Add and edit an inventory item; restart and confirm it persists.
- [ ] Import JPEG, PNG, and WebP photos; verify preview, thumbnail, ordering, primary selection, and removal.
- [ ] Restart and confirm photo references remain valid.
- [ ] Complete listing fields; confirm warnings, readiness percentage, queue filters, save, and Ready to List behavior.
- [ ] Install RC1 over a copy of an earlier user-data profile; verify inventory, photos, listings, and automatic database migration.
- [ ] Uninstall and confirm user data remains; reinstall and confirm it is recovered.
- [ ] Launch the portable executable and verify it uses the preserved per-user data.
- [ ] Confirm no final `v0.3.0` tag is created until this checklist passes and approval is explicit.
