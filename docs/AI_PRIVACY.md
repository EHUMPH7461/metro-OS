# AI Privacy

- The offline provider sends no data outside the device.
- External providers, when explicitly activated in a future release, receive only data required for the selected task.
- Photos are never uploaded automatically. Image analysis is disabled unless the provider advertises the capability and the user opts in and selects photos.
- The first external image upload must present a warning.
- API credentials remain in the main process.
- Generation history contains listing candidates and source metadata, not secrets or image binaries.
- Clearing AI history leaves inventory, listing, and photo records intact.
