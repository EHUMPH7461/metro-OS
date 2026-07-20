import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';

export type InventoryInput = {
  sku?: string; title: string; brand?: string; category?: string; gender?: string; size?: string;
  color?: string; condition?: string; purchasePrice?: number; listPrice?: number; shippingCost?: number;
  ebayFees?: number; quantity?: number; bin?: string; rack?: string; shelf?: string; drawer?: string;
  supplier?: string; purchaseDate?: string; listingDate?: string; soldDate?: string; ebayItemId?: string;
  status?: string; notes?: string;
};

type InventoryRow = Record<string, unknown>;
const require = createRequire(import.meta.url);
let SQL: SqlJsStatic;
let db: Database;
let dbPath = '';

export function calculateFinancials(input: InventoryInput) {
  const purchasePrice = Number(input.purchasePrice ?? 0);
  const listPrice = Number(input.listPrice ?? 0);
  const shippingCost = Number(input.shippingCost ?? 0);
  const ebayFees = Number(input.ebayFees ?? 0);
  const profit = listPrice - purchasePrice - shippingCost - ebayFees;
  return { profit, roi: purchasePrice > 0 ? Math.round((profit / purchasePrice) * 10000) / 100 : 0 };
}

export function nextSku(existing: string[], year = new Date().getFullYear()) {
  const prefix = `MRR-${year}-`;
  const used = new Set(existing);
  const max = existing.reduce((value, sku) => {
    if (!sku.startsWith(prefix)) return value;
    const number = Number(sku.slice(prefix.length));
    return Number.isFinite(number) ? Math.max(value, number) : value;
  }, 0);
  let sequence = max + 1;
  let sku = `${prefix}${String(sequence).padStart(6, '0')}`;
  while (used.has(sku)) sku = `${prefix}${String(++sequence).padStart(6, '0')}`;
  return sku;
}

function saveDatabase() {
  fs.writeFileSync(dbPath, Buffer.from(db.export()));
}

function rowsFromQuery(sql: string, params: Record<string, unknown> = {}) {
  const statement = db.prepare(sql);
  statement.bind(params);
  const rows: InventoryRow[] = [];
  while (statement.step()) rows.push(statement.getAsObject());
  statement.free();
  return rows;
}

const columns: Record<string, string> = {
  gender: "TEXT NOT NULL DEFAULT ''", color: "TEXT NOT NULL DEFAULT ''", condition: "TEXT NOT NULL DEFAULT ''",
  purchase_price: 'REAL NOT NULL DEFAULT 0', shipping_cost: 'REAL NOT NULL DEFAULT 0', ebay_fees: 'REAL NOT NULL DEFAULT 0',
  profit: 'REAL NOT NULL DEFAULT 0', roi: 'REAL NOT NULL DEFAULT 0', bin: "TEXT NOT NULL DEFAULT ''",
  rack: "TEXT NOT NULL DEFAULT ''", shelf: "TEXT NOT NULL DEFAULT ''", drawer: "TEXT NOT NULL DEFAULT ''",
  supplier: "TEXT NOT NULL DEFAULT ''", purchase_date: "TEXT NOT NULL DEFAULT ''", listing_date: "TEXT NOT NULL DEFAULT ''",
  sold_date: "TEXT NOT NULL DEFAULT ''", ebay_item_id: "TEXT NOT NULL DEFAULT ''", notes: "TEXT NOT NULL DEFAULT ''",
  updated_at: "TEXT NOT NULL DEFAULT ''"
};

function migrateInventory() {
  const existing = new Set((db.exec('PRAGMA table_info(inventory)')[0]?.values ?? []).map((row) => String(row[1])));
  for (const [name, definition] of Object.entries(columns)) {
    if (!existing.has(name)) db.run(`ALTER TABLE inventory ADD COLUMN ${name} ${definition}`);
  }
  if (existing.has('cost')) db.run('UPDATE inventory SET purchase_price = cost WHERE purchase_price = 0');
  db.run("UPDATE inventory SET updated_at = created_at WHERE updated_at = ''");
  db.run(`UPDATE inventory SET profit = list_price - purchase_price - shipping_cost - ebay_fees,
    roi = CASE WHEN purchase_price > 0 THEN ((list_price - purchase_price - shipping_cost - ebay_fees) / purchase_price) * 100 ELSE 0 END`);
}

export async function initializeDatabase() {
  const packageDir = path.dirname(require.resolve('sql.js/dist/sql-wasm.js'));
  SQL = await initSqlJs({ locateFile: (file) => path.join(packageDir, file) });
  dbPath = path.join(app.getPath('userData'), 'metro-os.sqlite');
  db = fs.existsSync(dbPath) ? new SQL.Database(fs.readFileSync(dbPath)) : new SQL.Database();
  db.run(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT, sku TEXT NOT NULL UNIQUE, title TEXT NOT NULL,
    brand TEXT NOT NULL DEFAULT '', category TEXT NOT NULL DEFAULT '', gender TEXT NOT NULL DEFAULT '',
    size TEXT NOT NULL DEFAULT '', color TEXT NOT NULL DEFAULT '', condition TEXT NOT NULL DEFAULT '',
    purchase_price REAL NOT NULL DEFAULT 0, list_price REAL NOT NULL DEFAULT 0,
    shipping_cost REAL NOT NULL DEFAULT 0, ebay_fees REAL NOT NULL DEFAULT 0, profit REAL NOT NULL DEFAULT 0,
    roi REAL NOT NULL DEFAULT 0, quantity INTEGER NOT NULL DEFAULT 1, bin TEXT NOT NULL DEFAULT '',
    rack TEXT NOT NULL DEFAULT '', shelf TEXT NOT NULL DEFAULT '', drawer TEXT NOT NULL DEFAULT '',
    supplier TEXT NOT NULL DEFAULT '', purchase_date TEXT NOT NULL DEFAULT '', listing_date TEXT NOT NULL DEFAULT '',
    sold_date TEXT NOT NULL DEFAULT '', ebay_item_id TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'Draft',
    notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  )`);
  migrateInventory();
  const count = Number(db.exec('SELECT COUNT(*) FROM inventory')[0]?.values[0]?.[0] ?? 0);
  if (count === 0) {
    for (const row of [
      { title: "Levi's 501 Straight Leg Jeans", brand: "Levi's", category: 'Jeans', size: '36x32', purchasePrice: 12, listPrice: 39.99, bin: 'B-12', rack: 'R1', status: 'Active' },
      { title: 'Nike Air Max Running Shoes', brand: 'Nike', category: 'Shoes', size: '11', purchasePrice: 18, listPrice: 64.99, shelf: 'S2', status: 'Draft' }
    ]) createInventory(row);
  }
  saveDatabase();
}

const selectFields = `id, sku, title, brand, category, gender, size, color, condition,
  purchase_price AS purchasePrice, list_price AS listPrice, shipping_cost AS shippingCost,
  ebay_fees AS ebayFees, profit, roi, quantity, bin, rack, shelf, drawer, supplier,
  purchase_date AS purchaseDate, listing_date AS listingDate, sold_date AS soldDate,
  ebay_item_id AS ebayItemId, status, notes, created_at AS createdAt, updated_at AS updatedAt`;

export function listInventory() {
  return rowsFromQuery(`SELECT ${selectFields} FROM inventory ORDER BY id DESC`);
}

function normalized(input: InventoryInput, sku: string) {
  const financials = calculateFinancials(input);
  return { sku, title: input.title.trim(), brand: input.brand ?? '', category: input.category ?? '', gender: input.gender ?? '',
    size: input.size ?? '', color: input.color ?? '', condition: input.condition ?? '', purchasePrice: Number(input.purchasePrice ?? 0),
    listPrice: Number(input.listPrice ?? 0), shippingCost: Number(input.shippingCost ?? 0), ebayFees: Number(input.ebayFees ?? 0),
    ...financials, quantity: Number(input.quantity ?? 1), bin: input.bin ?? '', rack: input.rack ?? '', shelf: input.shelf ?? '',
    drawer: input.drawer ?? '', supplier: input.supplier ?? '', purchaseDate: input.purchaseDate ?? '', listingDate: input.listingDate ?? '',
    soldDate: input.soldDate ?? '', ebayItemId: input.ebayItemId ?? '', status: input.status ?? 'Draft', notes: input.notes ?? '' };
}

const writeFields = `sku=:sku,title=:title,brand=:brand,category=:category,gender=:gender,size=:size,color=:color,
  condition=:condition,purchase_price=:purchasePrice,list_price=:listPrice,shipping_cost=:shippingCost,
  ebay_fees=:ebayFees,profit=:profit,roi=:roi,quantity=:quantity,bin=:bin,rack=:rack,shelf=:shelf,
  drawer=:drawer,supplier=:supplier,purchase_date=:purchaseDate,listing_date=:listingDate,sold_date=:soldDate,
  ebay_item_id=:ebayItemId,status=:status,notes=:notes`;

function params(row: ReturnType<typeof normalized>) {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [`:${key}`, value]));
}

export function createInventory(input: InventoryInput) {
  const existing = listInventory().map((row) => String(row.sku));
  const sku = input.sku?.trim() || nextSku(existing);
  if (existing.includes(sku)) throw new Error(`SKU ${sku} already exists`);
  const row = normalized(input, sku);
  const now = new Date().toISOString();
  db.run(`INSERT INTO inventory (
    sku,title,brand,category,gender,size,color,condition,purchase_price,list_price,shipping_cost,ebay_fees,
    profit,roi,quantity,bin,rack,shelf,drawer,supplier,purchase_date,listing_date,sold_date,ebay_item_id,status,
    notes,created_at,updated_at
  ) VALUES (
    :sku,:title,:brand,:category,:gender,:size,:color,:condition,:purchasePrice,:listPrice,:shippingCost,:ebayFees,
    :profit,:roi,:quantity,:bin,:rack,:shelf,:drawer,:supplier,:purchaseDate,:listingDate,:soldDate,:ebayItemId,:status,
    :notes,:createdAt,:updatedAt
  )`, { ...params(row), ':createdAt': now, ':updatedAt': now });
  const id = Number(db.exec('SELECT last_insert_rowid()')[0].values[0][0]);
  saveDatabase();
  return rowsFromQuery(`SELECT ${selectFields} FROM inventory WHERE id=:id`, { ':id': id })[0];
}

export function updateInventory(id: number, input: InventoryInput) {
  const current = rowsFromQuery('SELECT sku FROM inventory WHERE id=:id', { ':id': id })[0];
  const row = normalized(input, input.sku?.trim() || String(current?.sku ?? ''));
  db.run(`UPDATE inventory SET ${writeFields}, updated_at=:updatedAt WHERE id=:id`, { ...params(row), ':updatedAt': new Date().toISOString(), ':id': id });
  saveDatabase();
  return rowsFromQuery(`SELECT ${selectFields} FROM inventory WHERE id=:id`, { ':id': id })[0];
}

export function deleteInventory(id: number) {
  db.run('DELETE FROM inventory WHERE id=:id', { ':id': id });
  const changed = db.getRowsModified() > 0;
  if (changed) saveDatabase();
  return changed;
}
