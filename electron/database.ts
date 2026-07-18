import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'node:path';

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

let db: Database.Database;

export function initializeDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'metro-os.sqlite');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`
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

  const count = db.prepare('SELECT COUNT(*) as count FROM inventory').get() as { count: number };
  if (count.count === 0) {
    const insert = db.prepare(`INSERT INTO inventory
      (sku,title,category,brand,size,quantity,cost,list_price,status,created_at)
      VALUES (@sku,@title,@category,@brand,@size,@quantity,@cost,@listPrice,@status,@createdAt)`);
    const now = new Date().toISOString();
    const rows = [
      { sku: 'MRR-1001', title: "Levi's 501 Straight Leg Jeans", category: 'Jeans', brand: "Levi's", size: '36x32', quantity: 1, cost: 12, listPrice: 39.99, status: 'Active', createdAt: now },
      { sku: 'MRR-1002', title: 'Nike Air Max Running Shoes', category: 'Shoes', brand: 'Nike', size: '11', quantity: 1, cost: 18, listPrice: 64.99, status: 'Draft', createdAt: now },
      { sku: 'MRR-1003', title: 'The North Face Puffer Jacket', category: 'Jackets', brand: 'The North Face', size: 'XL', quantity: 1, cost: 25, listPrice: 89.99, status: 'Active', createdAt: now }
    ];
    const seed = db.transaction(() => rows.forEach((row) => insert.run(row)));
    seed();
  }
}

export function listInventory() {
  return db.prepare(`SELECT id, sku, title, category, brand, size, quantity, cost,
    list_price as listPrice, status, created_at as createdAt FROM inventory ORDER BY id DESC`).all();
}

export function createInventory(input: InventoryInput) {
  const result = db.prepare(`INSERT INTO inventory
    (sku,title,category,brand,size,quantity,cost,list_price,status,created_at)
    VALUES (@sku,@title,@category,@brand,@size,@quantity,@cost,@listPrice,@status,@createdAt)`)
    .run({ ...input, createdAt: new Date().toISOString() });
  return db.prepare('SELECT * FROM inventory WHERE id = ?').get(result.lastInsertRowid);
}

export function updateInventory(id: number, input: InventoryInput) {
  db.prepare(`UPDATE inventory SET sku=@sku,title=@title,category=@category,brand=@brand,
    size=@size,quantity=@quantity,cost=@cost,list_price=@listPrice,status=@status WHERE id=@id`)
    .run({ ...input, id });
  return db.prepare('SELECT * FROM inventory WHERE id = ?').get(id);
}

export function deleteInventory(id: number) {
  return db.prepare('DELETE FROM inventory WHERE id = ?').run(id).changes > 0;
}
