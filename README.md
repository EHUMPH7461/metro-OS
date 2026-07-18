# Metro OS

**Metro OS** is a desktop operating system for managing and growing the **Metro Refined Racks eBay clothing resale business**.

Built with Electron, React, TypeScript, and SQLite.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Windows 10+ (or macOS/Linux for development)

### Installation

```bash
# Clone the repository
git clone https://github.com/EHUMPH7461/metro-OS.git
cd metro-OS

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Development

```bash
# Start the development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Features (Sprint 1)

- ✅ Electron desktop application
- ✅ React + TypeScript interface
- ✅ Command Center dashboard
- ✅ Inventory management (add, edit, delete, search)
- ✅ SQLite database with Drizzle ORM
- ✅ Sidebar navigation
- ✅ Professional UI with Tailwind CSS
- ✅ Unit tests with Vitest
- ✅ Type-safe development

## Planned Features

- 🔄 eBay API integration (listings, orders, inventory sync)
- 🤖 AI Assistant with OpenAI integration
- 📊 Advanced financial reports and analytics
- 📈 Inventory forecasting
- 🏷️ Barcode and label support
- 📱 Mobile companion app

## Project Structure

```
metro-OS/
├── apps/desktop/          # Electron app & React UI
├── packages/database/     # SQLite + Drizzle ORM
├── packages/ui/           # Shared UI components
├── packages/ai/           # AI integration (OpenAI)
├── packages/ebay/         # eBay API client (placeholder)
├── packages/analytics/    # Business analytics engine
├── docs/                  # Architecture & guides
└── tests/                 # Integration tests
```

## Documentation

- [Architecture](./docs/architecture.md)
- [Database Schema](./docs/database-schema.md)
- [Development Roadmap](./docs/development-roadmap.md)
- [eBay Integration Guide](./docs/ebay-integration.md)

## Development

This is a monorepo using Turbo and npm workspaces.

```bash
# Install all dependencies
npm install

# Run dev mode for all packages
npm run dev

# Run tests
npm run test

# Build all packages
npm run build
```

## License

Private - Metro Refined Racks

## Support

For issues or questions, please open a GitHub issue.
