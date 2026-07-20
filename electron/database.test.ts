import { describe, expect, it } from 'vitest';
import initSqlJs from 'sql.js';
import { calculateFinancials, nextSku } from './database.js';

describe('inventory domain', () => {
  it('generates the next unique yearly SKU', () => {
    expect(nextSku(['MRR-2026-000001', 'MRR-2026-000003'], 2026)).toBe('MRR-2026-000004');
  });

  it('calculates net profit and ROI', () => {
    expect(calculateFinancials({ title: 'Jacket', purchasePrice: 20, listPrice: 60, shippingCost: 8, ebayFees: 9 }))
      .toEqual({ profit: 23, roi: 115 });
  });

  it('migrates legacy inventory without losing rows', async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    db.run('CREATE TABLE inventory (id INTEGER PRIMARY KEY, sku TEXT UNIQUE, title TEXT, cost REAL, list_price REAL, created_at TEXT)');
    db.run("INSERT INTO inventory VALUES (1, 'MRR-1001', 'Legacy item', 12, 40, '2026-01-01')");
    db.run('ALTER TABLE inventory ADD COLUMN purchase_price REAL NOT NULL DEFAULT 0');
    db.run('ALTER TABLE inventory ADD COLUMN updated_at TEXT NOT NULL DEFAULT ""');
    db.run('UPDATE inventory SET purchase_price=cost, updated_at=created_at');
    expect(db.exec('SELECT sku, purchase_price, updated_at FROM inventory')[0].values[0])
      .toEqual(['MRR-1001', 12, '2026-01-01']);
  });
});
