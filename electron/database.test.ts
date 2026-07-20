import { describe, expect, it } from 'vitest';
import initSqlJs from 'sql.js';
import { calculateFinancials, INVENTORY_SCHEMA_VERSION, nextSku, persistDatabaseFile, runMigrations } from './database.js';

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
    runMigrations(db);
    expect(db.exec('SELECT sku, purchase_price, updated_at FROM inventory')[0].values[0])
      .toEqual(['MRR-1001', 12, '2026-01-01']);
    expect(db.exec('PRAGMA user_version')[0].values[0][0]).toBe(INVENTORY_SCHEMA_VERSION);
    expect(() => runMigrations(db)).not.toThrow();
  });

  it('restores the previous database when the atomic replacement fails', () => {
    const files = new Map<string, Uint8Array>([['metro.sqlite', new Uint8Array([1])]]);
    const adapter = {
      existsSync: (name: string) => files.has(name),
      writeFileSync: (name: string, value: Uint8Array) => { files.set(name, value); },
      rmSync: (name: string) => { files.delete(name); },
      renameSync: (from: string, to: string) => {
        if (from.endsWith('.tmp')) throw new Error('disk failure');
        const value = files.get(from); if (!value) throw new Error('missing'); files.set(to, value); files.delete(from);
      }
    };
    expect(() => persistDatabaseFile('metro.sqlite', new Uint8Array([2]), adapter)).toThrow('saved safely');
    expect([...files.get('metro.sqlite') ?? []]).toEqual([1]);
  });
});
