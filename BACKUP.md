# Backup and Restore

Metro Command Center stores the database and managed photos under Electron's per-user `userData` directory, not beside the installed executable. On Windows this is normally beneath `%APPDATA%` in the folder assigned to Metro Command Center.

## Back up

1. Close Metro Command Center completely.
2. In File Explorer, enter `%APPDATA%` in the address bar.
3. Locate the Metro Command Center application-data folder.
4. Copy the entire folder to a dated backup location.
5. Confirm the copy contains `metro-os.sqlite` and, when photos exist, `inventory-photos`.

Copy the whole folder: the database stores managed photo paths, so preserving the database and `inventory-photos` together keeps references valid.

## Restore

1. Close Metro Command Center.
2. Make a safety copy of the current application-data folder.
3. Replace the current folder with the backed-up folder at the same path.
4. Start Metro Command Center and verify inventory, listing fields, primary photos, and gallery images.

Do not edit the SQLite database or rename files inside `inventory-photos`. The app creates database backup and temporary files during safe writes; those are recovery implementation details, not substitutes for an external backup.
