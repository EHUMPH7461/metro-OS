import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';

export type InventoryInput = {
  sku: string;
  title: string;
  category: string;
  brand: string;
  size: string;
  quantity: number;
  cost: number;
  listPrice: number;
  status: string;
};

type InventoryRow = InventoryInput & { id: number; createdAt: string };

const require = createRequire(import.meta.url);
let SQL: SqlJsStatic;
let db: Database;
let dbPath = '';

function saveDatabase() {
  const bytes = db.export();
  fs.writeFileSync(dbPath, Buffer.from(bytes));
}

function rowsFromQuery(sql: string, params: Record<string, unknown> = {}): InventoryRow[] {
  const statement = db.prepare(sql);
  statement.bind(params);
  const rows: InventoryRow[] = [];
  while (statement.step()) rows.push(statement.getAsObject() as unknown as InventoryRow);
  statement.free();
  return rows;
}

export async function initializeDatabase() {
  const packageDir = path.dirname(require.resolve('sql.js/dist/sql-wasm.js'));
  SQL = await initSqlJs({ locateFile: (file) => path.join(packageDir, file) });
  dbPath = path.join(app.getPath('userData'), 'metro-os.sqlite');
  db = fs.existsSync(dbPath) ? new SQL.Database(fs.readFileSync(dbPath)) : new SQL.Database();

  db.run(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      brand TEXT NOT NULL DEFAULT '',
      size TEXT NOT NULL DEFAULT '',
      quantity INTEGER NOT NULL DEFAULT 1,
      cost REAL NOT NULL DEFAULT 0,
      list_price REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Draft',
      created_at TEXT NOT NULL
    );
  `);

  const count = db.exec('SELECT COUNT(*) AS count FROM inventory')[0]?.values[0]?.[0] ?? 0;
  if (Number(count) === 0) {
    const now = new Date().toISOString();
    const rows: InventoryInput[] = [
      { sku: 'MRR-1001', title: "Levi's 501 Straight Leg Jeans", category: 'Jeans', brand: "Levi's", size: '36x32', quantity: 1, cost: 12, listPrice: 39.99, status: 'Active' },
      { sku: 'MRR-1002', title: 'Nike Air Max Running Shoes', category: 'Shoes', brand: 'Nike', size: '11', quantity: 1, cost: 18, listPrice: 64.99, status: 'Draft' },
      { sku: 'MRR-1003', title: 'The North Face Puffer Jacket', category: 'Jackets', brand: 'The North Face', size: 'XL', quantity: 1, cost: 25, listPrice: 89.99, status: 'Active' }
    ];
    for (const row of rows) {
      db.run(`INSERT INTO inventory
        (sku,title,category,brand,size,quantity,cost,list_price,status,created_at)
        VALUES (:sku,:title,:category,:brand,:size,:quantity,:cost,:listPrice,:status,:createdAt)`,
        { ':sku': row.sku, ':title': row.title, ':category': row.category, ':brand': row.brand, ':size': row.size, ':quantity': row.quantity, ':cost': row.cost, ':listPrice': row.listPrice, ':status': row.status, ':createdAt': now });
    }
    saveDatabase();
  }
}

export function listInventory() {
  return rowsFromQuery(`SELECT id, sku, title, category, brand, size, quantity, cost,
    list_price AS listPrice, status, created_at AS createdAt FROM inventory ORDER BY id DESC`);
}

export function createInventory(input: InventoryInput) {
  const createdAt = new Date().toISOString();
  db.run(`INSERT INTO inventory
    (sku,title,category,brand,size,quantity,cost,list_price,status,created_at)
    VALUES (:sku,:title,:category,:brand,:size,:quantity,:cost,:listPrice,:status,:createdAt)`,
    { ':sku': input.sku, ':title': input.title, ':category': input.category, ':brand': input.brand, ':size': input.size, ':quantity': input.quantity, ':cost': input.cost, ':listPrice': input.listPrice, ':status': input.status, ':createdAt': createdAt });
  const id = Number(db.exec('SELECT last_insert_rowid()')[0].values[0][0]);
  saveDatabase();
  return rowsFromQuery(`SELECT id, sku, title, category, brand, size, quantity, cost,
    list_price AS listPrice, status, created_at AS createdAt FROM inventory WHERE id = :id`, { ':id': id })[0];
}

export function updateInventory(id: number, input: InventoryInput) {
  db.run(`UPDATE inventory SET sku=:sku,title=:title,category=:category,brand=:brand,
    size=:size,quantity=:quantity,cost=:cost,list_price=:listPrice,status=:status WHERE id=:id`,
    { ':sku': input.sku, ':title': input.title, ':category': input.category, ':brand': input.brand, ':size': input.size, ':quantity': input.quantity, ':cost': input.cost, ':listPrice': input.listPrice, ':status': input.status, ':id': id });
  saveDatabase();
  return rowsFromQuery(`SELECT id, sku, title, category, brand, size, quantity, cost,
    list_price AS listPrice, status, created_at AS createdAt FROM inventory WHERE id = :id`, { ':id': id })[0];
}

export function deleteInventory(id: number) {
  db.run('DELETE FROM inventory WHERE id = :id', { ':id': id });
  const changed = db.getRowsModified() > 0;
  if (changed) saveDatabase();
  return changed;
}
