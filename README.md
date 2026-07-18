# Metro OS

Metro OS is a Windows-first desktop operations system for **Metro Refined Racks**, built to manage eBay inventory, listings, orders, financials, reports, and future AI-assisted workflows.

## Sprint 1 foundation

- Electron desktop shell with a secure preload bridge
- React + TypeScript + Vite renderer
- Tailwind-powered dashboard styling
- Local SQLite database
- Drizzle schema for inventory
- Inventory create, list, search, and delete workflows
- Seed inventory for first launch
- Vitest test harness
- GitHub Actions CI

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm run typecheck
npm test
npm run build
```

## Current status

Sprint 1 establishes the desktop architecture and inventory workflow. It does **not** yet include eBay OAuth, live listing synchronization, order imports, or a verified Windows installer.

## Planned sprints

1. Desktop foundation and inventory
2. eBay authentication and synchronization
3. AI listing and pricing tools
4. Financial analytics and reporting
