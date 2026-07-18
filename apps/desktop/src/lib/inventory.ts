import { v4 as uuidv4 } from 'uuid'
import { getDatabase } from './db'
import type { InventoryItem } from '../../electron/types'

export const createInventoryItem = (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): InventoryItem => {
  const db = getDatabase()
  const id = uuidv4()
  const now = new Date().toISOString()

  const stmt = db.prepare(`
    INSERT INTO inventory (id, sku, brand, category, size, color, condition, purchase_price, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    id,
    item.sku,
    item.brand,
    item.category,
    item.size || null,
    item.color || null,
    item.condition,
    item.purchasePrice,
    item.status || 'unlisted',
    now,
    now
  )

  return {
    id,
    ...item,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  }
}

export const getInventoryItem = (id: string): InventoryItem | null => {
  const db = getDatabase()
  const stmt = db.prepare(`
    SELECT id, sku, brand, category, size, color, condition, purchase_price as purchasePrice, status, created_at as createdAt, updated_at as updatedAt
    FROM inventory
    WHERE id = ?
  `)

  const row = stmt.get(id) as any
  if (!row) return null

  return {
    ...row,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}

export const listInventoryItems = (limit: number = 100, offset: number = 0): InventoryItem[] => {
  const db = getDatabase()
  const stmt = db.prepare(`
    SELECT id, sku, brand, category, size, color, condition, purchase_price as purchasePrice, status, created_at as createdAt, updated_at as updatedAt
    FROM inventory
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `)

  const rows = stmt.all(limit, offset) as any[]
  return rows.map(row => ({
    ...row,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }))
}

export const updateInventoryItem = (id: string, updates: Partial<InventoryItem>): InventoryItem => {
  const db = getDatabase()
  const now = new Date().toISOString()
  const current = getInventoryItem(id)

  if (!current) throw new Error(`Inventory item ${id} not found`)

  const merged = { ...current, ...updates, updatedAt: new Date(now) }

  const stmt = db.prepare(`
    UPDATE inventory
    SET sku = ?, brand = ?, category = ?, size = ?, color = ?, condition = ?, purchase_price = ?, status = ?, updated_at = ?
    WHERE id = ?
  `)

  stmt.run(
    merged.sku,
    merged.brand,
    merged.category,
    merged.size || null,
    merged.color || null,
    merged.condition,
    merged.purchasePrice,
    merged.status,
    now,
    id
  )

  return merged
}

export const deleteInventoryItem = (id: string): void => {
  const db = getDatabase()
  const stmt = db.prepare('DELETE FROM inventory WHERE id = ?')
  stmt.run(id)
}

export const getInventoryStats = () => {
  const db = getDatabase()
  const stmt = db.prepare(`
    SELECT
      COUNT(*) as total_items,
      SUM(CASE WHEN status = 'unlisted' THEN 1 ELSE 0 END) as unlisted,
      SUM(CASE WHEN status = 'listed' THEN 1 ELSE 0 END) as listed,
      SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold,
      SUM(purchase_price) as total_investment
    FROM inventory
  `)

  return stmt.get() as any
}
