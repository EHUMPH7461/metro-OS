import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'

let db: Database.Database | null = null

const getDBPath = (): string => {
  const dataPath = path.join(app.getPath('userData'), 'data')
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true })
  }
  return path.join(dataPath, 'metro.db')
}

export const initializeDatabase = (): void => {
  if (db) return

  const dbPath = getDBPath()
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  createTables()
}

const createTables = (): void => {
  if (!db) throw new Error('Database not initialized')

  // Inventory table
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      sku TEXT NOT NULL UNIQUE,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      size TEXT,
      color TEXT,
      condition TEXT NOT NULL CHECK(condition IN ('new', 'like_new', 'good', 'fair')),
      purchase_price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'unlisted' CHECK(status IN ('unlisted', 'listed', 'sold', 'archived')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Listings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      inventory_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      starting_price REAL NOT NULL,
      current_price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'active', 'sold_out', 'ended')),
      ebay_item_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      published_at DATETIME,
      FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
    )
  `)

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      inventory_id TEXT NOT NULL,
      listing_id TEXT,
      ebay_order_id TEXT UNIQUE,
      sale_price REAL NOT NULL,
      platform_fees REAL DEFAULT 0,
      cost_of_goods REAL NOT NULL,
      net_profit REAL GENERATED ALWAYS AS (sale_price - platform_fees - cost_of_goods) STORED,
      order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'shipped', 'delivered', 'returned')),
      FOREIGN KEY (inventory_id) REFERENCES inventory(id),
      FOREIGN KEY (listing_id) REFERENCES listings(id)
    )
  `)

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
    CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
    CREATE INDEX IF NOT EXISTS idx_listings_inventory ON listings(inventory_id);
    CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
    CREATE INDEX IF NOT EXISTS idx_orders_inventory ON orders(inventory_id);
    CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
  `)
}

export const getDatabase = (): Database.Database => {
  if (!db) throw new Error('Database not initialized')
  return db
}

export const executeQuery = (query: string): any => {
  if (!db) throw new Error('Database not initialized')
  const stmt = db.prepare(query)
  return stmt.all()
}

export const closeDatabase = (): void => {
  if (db) {
    db.close()
    db = null
  }
}
