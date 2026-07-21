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
    expect(db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='inventory_photos'")[0].values[0][0]).toBe('inventory_photos');
    expect(db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='listings'")[0].values[0][0]).toBe('listings');
    expect(() => runMigrations(db)).not.toThrow();
  });

  it('preserves photo records while adding the listing workspace', async()=>{const SQL=await initSqlJs();const db=new SQL.Database();db.run(`CREATE TABLE inventory(id INTEGER PRIMARY KEY,sku TEXT UNIQUE,title TEXT,cost REAL,list_price REAL,created_at TEXT);CREATE TABLE inventory_photos(id INTEGER PRIMARY KEY,inventory_id INTEGER,file_name TEXT,original_file_name TEXT,mime_type TEXT,file_size INTEGER,file_path TEXT,thumbnail_path TEXT,fingerprint TEXT,position INTEGER,is_primary INTEGER,created_at TEXT,updated_at TEXT);PRAGMA user_version=3;INSERT INTO inventory VALUES(1,'MRR-1','Coat',10,40,'2026-01-01');INSERT INTO inventory_photos VALUES(1,1,'a.jpg','a.jpg','image/jpeg',10,'a','b','hash',0,1,'now','now')`);runMigrations(db);expect(db.exec('SELECT inventory_id,file_name FROM inventory_photos')[0].values[0]).toEqual([1,'a.jpg']);expect(db.exec('SELECT name FROM sqlite_master WHERE name=\'listings\'')[0].values[0][0]).toBe('listings')});

  it('upgrades version 4 analytics fields without losing inventory, photos, or listings',async()=>{const SQL=await initSqlJs();const db=new SQL.Database();db.run(`CREATE TABLE inventory(id INTEGER PRIMARY KEY,sku TEXT,title TEXT,sold_date TEXT);CREATE TABLE inventory_photos(id INTEGER PRIMARY KEY,inventory_id INTEGER,file_name TEXT);CREATE TABLE listings(id INTEGER PRIMARY KEY,inventory_id INTEGER,status TEXT,updated_at TEXT);INSERT INTO inventory VALUES(1,'MRR-1','Coat','2026-07-01');INSERT INTO inventory_photos VALUES(7,1,'coat.jpg');INSERT INTO listings VALUES(9,1,'Listed','2026-07-02');PRAGMA user_version=4`);runMigrations(db);expect(db.exec('PRAGMA user_version')[0].values[0][0]).toBe(6);expect(db.exec('SELECT sku,sale_price,other_selling_costs,sold_status_at FROM inventory')[0].values[0]).toEqual(['MRR-1',null,null,'2026-07-01']);expect(db.exec('SELECT file_name FROM inventory_photos')[0].values[0][0]).toBe('coat.jpg');expect(db.exec('SELECT status,completed_at FROM listings')[0].values[0]).toEqual(['Listed','2026-07-02']);expect(()=>runMigrations(db)).not.toThrow()});

  it('upgrades version 5 with isolated AI history and preserves existing records',async()=>{const SQL=await initSqlJs();const db=new SQL.Database();db.run("CREATE TABLE inventory(id INTEGER PRIMARY KEY,sku TEXT,title TEXT);CREATE TABLE inventory_photos(id INTEGER PRIMARY KEY,inventory_id INTEGER,file_path TEXT);CREATE TABLE listings(id INTEGER PRIMARY KEY,inventory_id INTEGER,listing_title TEXT);INSERT INTO inventory VALUES(1,'M-1','Jacket');INSERT INTO inventory_photos VALUES(2,1,'photo.jpg');INSERT INTO listings VALUES(3,1,'Jacket');PRAGMA user_version=5");runMigrations(db);expect(db.exec('PRAGMA user_version')[0].values[0][0]).toBe(6);expect(db.exec("SELECT name FROM sqlite_master WHERE name='ai_generation_sessions'")[0].values[0][0]).toBe('ai_generation_sessions');expect(db.exec('SELECT sku FROM inventory')[0].values[0][0]).toBe('M-1');expect(db.exec('SELECT file_path FROM inventory_photos')[0].values[0][0]).toBe('photo.jpg');expect(()=>runMigrations(db)).not.toThrow()});

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
