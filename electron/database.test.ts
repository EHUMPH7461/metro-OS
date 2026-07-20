import { describe, expect, it } from 'vitest';
import initSqlJs from 'sql.js';

describe('inventory SQL bindings', () => {
  it('inserts a seeded item with explicit named parameters', async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    db.run(`CREATE TABLE inventory (
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
    )`);
    const row = { sku: 'MRR-TEST', title: 'Test Item', category: 'Jeans', brand: 'Test', size: 'M', quantity: 1, cost: 10, listPrice: 20, status: 'Draft' };
    db.run(`INSERT INTO inventory
      (sku,title,category,brand,size,quantity,cost,list_price,status,created_at)
      VALUES (:sku,:title,:category,:brand,:size,:quantity,:cost,:listPrice,:status,:createdAt)`, {
      ':sku': row.sku, ':title': row.title, ':category': row.category, ':brand': row.brand,
      ':size': row.size, ':quantity': row.quantity, ':cost': row.cost,
      ':listPrice': row.listPrice, ':status': row.status, ':createdAt': new Date().toISOString()
    });
    const result = db.exec('SELECT sku, title FROM inventory');
    expect(result[0].values[0]).toEqual(['MRR-TEST', 'Test Item']);
  });
});
