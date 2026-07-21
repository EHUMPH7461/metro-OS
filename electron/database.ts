import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import type { InventoryInput, InventoryItem } from '../shared/inventory.js';
import type { InventoryPhoto, PhotoImportInput } from '../shared/photos.js';
import type { AIHistory, AIResponse, AITask } from '../shared/ai.js';
import type { ListingChecklist,ListingInput,ListingRecord } from '../shared/listings.js';
import type { AnalyticsRecord } from '../shared/analytics.js';
import { MetroDomainError } from './errors.js';

type InventoryRow = Record<string, unknown>;
type PersistenceFiles = {
  writeFileSync(path: string, data: Uint8Array): void;
  existsSync(path: string): boolean;
  renameSync(from: string, to: string): void;
  rmSync(path: string, options: { force: boolean }): void;
};
const require = createRequire(import.meta.url);
export const INVENTORY_SCHEMA_VERSION = 6;
let SQL: SqlJsStatic;
let db: Database;
let dbPath = '';

export function calculateFinancials(input: Partial<InventoryInput>) {
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

export function persistDatabaseFile(target: string, bytes: Uint8Array, files: PersistenceFiles = fs) {
  const temporary = `${target}.tmp`;
  const backup = `${target}.bak`;
  let previousMoved = false;
  try {
    files.rmSync(temporary, { force: true });
    files.rmSync(backup, { force: true });
    files.writeFileSync(temporary, Buffer.from(bytes));
    if (files.existsSync(target)) {
      files.renameSync(target, backup);
      previousMoved = true;
    }
    files.renameSync(temporary, target);
    files.rmSync(backup, { force: true });
  } catch (error) {
    try {
      files.rmSync(temporary, { force: true });
      if (previousMoved && !files.existsSync(target) && files.existsSync(backup)) files.renameSync(backup, target);
    } catch (restoreError) {
      console.error('Database restore failed', restoreError);
    }
    throw new MetroDomainError('PERSISTENCE', 'Inventory changes could not be saved safely.', { retryable: true });
  }
}

function saveDatabase() {
  try {
    persistDatabaseFile(dbPath, db.export());
  } catch (error) {
    if (fs.existsSync(dbPath)) db = new SQL.Database(fs.readFileSync(dbPath));
    throw error;
  }
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

function addInventoryColumns(database: Database) {
  const existing = new Set((database.exec('PRAGMA table_info(inventory)')[0]?.values ?? []).map((row) => String(row[1])));
  for (const [name, definition] of Object.entries(columns)) {
    if (!existing.has(name)) database.run(`ALTER TABLE inventory ADD COLUMN ${name} ${definition}`);
  }
  if (existing.has('cost')) database.run('UPDATE inventory SET purchase_price = cost WHERE purchase_price = 0');
  database.run("UPDATE inventory SET updated_at = created_at WHERE updated_at = ''");
}

function recalculateInventory(database: Database) {
  database.run(`UPDATE inventory SET profit = list_price - purchase_price - shipping_cost - ebay_fees,
    roi = CASE WHEN purchase_price > 0 THEN ((list_price - purchase_price - shipping_cost - ebay_fees) / purchase_price) * 100 ELSE 0 END`);
}

function addPhotoMetadata(database: Database) {
  database.run(`CREATE TABLE IF NOT EXISTS inventory_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inventory_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    original_file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    thumbnail_path TEXT NOT NULL,
    fingerprint TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    is_primary INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(inventory_id, fingerprint)
  )`);
  database.run('CREATE INDEX IF NOT EXISTS idx_inventory_photos_inventory ON inventory_photos(inventory_id, position)');
  database.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_inventory_photos_primary ON inventory_photos(inventory_id) WHERE is_primary = 1');
}

function addListingWorkspace(database:Database){database.run(`CREATE TABLE IF NOT EXISTS listings(
 id INTEGER PRIMARY KEY AUTOINCREMENT,inventory_id INTEGER NOT NULL UNIQUE,listing_title TEXT NOT NULL DEFAULT '',description TEXT NOT NULL DEFAULT '',category TEXT NOT NULL DEFAULT '',condition TEXT NOT NULL DEFAULT '',brand TEXT NOT NULL DEFAULT '',department TEXT NOT NULL DEFAULT '',size TEXT NOT NULL DEFAULT '',color TEXT NOT NULL DEFAULT '',material TEXT NOT NULL DEFAULT '',style TEXT NOT NULL DEFAULT '',type TEXT NOT NULL DEFAULT '',model TEXT NOT NULL DEFAULT '',mpn TEXT NOT NULL DEFAULT '',upc TEXT NOT NULL DEFAULT '',country_of_manufacture TEXT NOT NULL DEFAULT '',list_price REAL NOT NULL DEFAULT 0,minimum_offer REAL NOT NULL DEFAULT 0,shipping_service TEXT NOT NULL DEFAULT '',shipping_charge REAL NOT NULL DEFAULT 0,handling_time INTEGER NOT NULL DEFAULT 0,return_policy TEXT NOT NULL DEFAULT '',ebay_item_id TEXT NOT NULL DEFAULT '',listing_url TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'Purchased',internal_notes TEXT NOT NULL DEFAULT '',checklist_json TEXT NOT NULL DEFAULT '{}',created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`);database.run('CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status)');}

function addAnalyticsFields(database:Database){const inventory=new Set((database.exec('PRAGMA table_info(inventory)')[0]?.values??[]).map(row=>String(row[1])));if(!inventory.has('sale_price'))database.run('ALTER TABLE inventory ADD COLUMN sale_price REAL');if(!inventory.has('other_selling_costs'))database.run('ALTER TABLE inventory ADD COLUMN other_selling_costs REAL');if(!inventory.has('sold_status_at'))database.run("ALTER TABLE inventory ADD COLUMN sold_status_at TEXT NOT NULL DEFAULT ''");const listings=new Set((database.exec('PRAGMA table_info(listings)')[0]?.values??[]).map(row=>String(row[1])));if(!listings.has('completed_at'))database.run("ALTER TABLE listings ADD COLUMN completed_at TEXT NOT NULL DEFAULT ''");if(inventory.has('sold_date'))database.run("UPDATE inventory SET sold_status_at=sold_date WHERE sold_status_at='' AND sold_date<>''");if(listings.has('updated_at')&&listings.has('status'))database.run("UPDATE listings SET completed_at=updated_at WHERE completed_at='' AND status IN ('Ready','Listed','Sold','Packed','Shipped','Delivered')");}

function addAIHistory(database:Database){database.run("CREATE TABLE IF NOT EXISTS ai_generation_sessions(id INTEGER PRIMARY KEY AUTOINCREMENT,inventory_id INTEGER NOT NULL,task TEXT NOT NULL,provider TEXT NOT NULL,model TEXT NOT NULL,generated_at TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'Draft',source_hash TEXT NOT NULL,response_json TEXT NOT NULL,error_summary TEXT NOT NULL DEFAULT '',usage_json TEXT NOT NULL DEFAULT '{}',FOREIGN KEY(inventory_id) REFERENCES inventory(id) ON DELETE CASCADE)");database.run("CREATE INDEX IF NOT EXISTS idx_ai_sessions_inventory ON ai_generation_sessions(inventory_id,generated_at DESC)");database.run("CREATE TABLE IF NOT EXISTS ai_feedback_events(id INTEGER PRIMARY KEY AUTOINCREMENT,session_id INTEGER NOT NULL,suggestion_id TEXT NOT NULL,status TEXT NOT NULL,value TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,FOREIGN KEY(session_id) REFERENCES ai_generation_sessions(id) ON DELETE CASCADE)")}

const migrations = [addInventoryColumns, recalculateInventory, addPhotoMetadata,addListingWorkspace,addAnalyticsFields,addAIHistory];

export function runMigrations(database: Database) {
  const current = Number(database.exec('PRAGMA user_version')[0]?.values[0]?.[0] ?? 0);
  if (current > INVENTORY_SCHEMA_VERSION) throw new MetroDomainError('UNEXPECTED', 'This database was created by a newer Metro OS version.');
  for (let version = current + 1; version <= INVENTORY_SCHEMA_VERSION; version += 1) {
    database.run('BEGIN');
    try {
      migrations[version - 1](database);
      database.run(`PRAGMA user_version = ${version}`);
      database.run('COMMIT');
    } catch (error) {
      database.run('ROLLBACK');
      throw new MetroDomainError('UNEXPECTED', `Database migration ${version} failed.`);
    }
  }
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
  addPhotoMetadata(db);
  addListingWorkspace(db);
  runMigrations(db);
  const count = Number(db.exec('SELECT COUNT(*) FROM inventory')[0]?.values[0]?.[0] ?? 0);
  if (count === 0) {
    const seed = (overrides: Partial<InventoryInput>): InventoryInput => ({ sku: '', title: '', brand: '', category: '', gender: '', size: '', color: '', condition: '', purchasePrice: 0, listPrice: 0, shippingCost: 0, ebayFees: 0, quantity: 1, bin: '', rack: '', shelf: '', drawer: '', supplier: '', purchaseDate: '', listingDate: '', soldDate: '', ebayItemId: '', status: 'Draft', notes: '', ...overrides });
    for (const row of [
      seed({ title: "Levi's 501 Straight Leg Jeans", brand: "Levi's", category: 'Jeans', size: '36x32', purchasePrice: 12, listPrice: 39.99, bin: 'B-12', rack: 'R1', status: 'Active' }),
      seed({ title: 'Nike Air Max Running Shoes', brand: 'Nike', category: 'Shoes', size: '11', purchasePrice: 18, listPrice: 64.99, shelf: 'S2' })
    ]) createInventory(row);
  }
  saveDatabase();
}

const selectFields = `i.id, i.sku, i.title, i.brand, i.category, i.gender, i.size, i.color, i.condition,
  i.purchase_price AS purchasePrice, i.list_price AS listPrice, i.shipping_cost AS shippingCost,
  i.ebay_fees AS ebayFees, i.profit, i.roi, i.quantity, i.bin, i.rack, i.shelf, i.drawer, i.supplier,
  i.purchase_date AS purchaseDate, i.listing_date AS listingDate, i.sold_date AS soldDate,
  i.ebay_item_id AS ebayItemId, i.status, i.notes, i.created_at AS createdAt, i.updated_at AS updatedAt,
  (SELECT COUNT(*) FROM inventory_photos p WHERE p.inventory_id=i.id) AS photoCount`;

export function listInventory() {
  return rowsFromQuery(`SELECT ${selectFields} FROM inventory i ORDER BY i.id DESC`) as unknown as InventoryItem[];
}

export function listAnalyticsRecords():AnalyticsRecord[]{return listInventory().map(item=>{const listing=getListing(item.id);const financial=rowsFromQuery('SELECT sale_price AS salePrice,other_selling_costs AS otherSellingCosts,sold_status_at AS soldStatusAt FROM inventory WHERE id=:id',{':id':item.id})[0]??{};const listingTime=rowsFromQuery('SELECT completed_at AS listingCompletedAt FROM listings WHERE inventory_id=:id',{':id':item.id})[0]??{};const photos=rowsFromQuery('SELECT created_at AS createdAt FROM inventory_photos WHERE inventory_id=:id',{':id':item.id});return{...item,...financial,...listingTime,listing,photoCreatedAt:photos.map(photo=>String(photo.createdAt??'')).filter(Boolean)} as AnalyticsRecord})}
export function saveAIHistory(inventoryId:number,task:AITask,response:AIResponse){db.run("INSERT INTO ai_generation_sessions(inventory_id,task,provider,model,generated_at,status,source_hash,response_json,usage_json) VALUES(:inventoryId,:task,:provider,:model,:generatedAt,'Draft',:sourceHash,:response,:usage)",{':inventoryId':inventoryId,':task':task,':provider':response.provider,':model':response.model,':generatedAt':response.generatedAt,':sourceHash':response.sourceHash,':response':JSON.stringify(response),':usage':JSON.stringify(response.usage??{})});const id=Number(db.exec('SELECT last_insert_rowid()')[0].values[0][0]);saveDatabase();return{id,...response}}
export function listAIHistory(inventoryId:number):AIHistory[]{return rowsFromQuery('SELECT id,inventory_id AS inventoryId,task,provider,model,generated_at AS generatedAt,status,source_hash AS sourceHash,response_json AS response,error_summary AS errorSummary FROM ai_generation_sessions WHERE inventory_id=:inventoryId ORDER BY generated_at DESC',{':inventoryId':inventoryId}).map(row=>({...row,id:Number(row.id),inventoryId:Number(row.inventoryId),response:JSON.parse(String(row.response))})) as AIHistory[]}
export function saveAIFeedback(sessionId:number,suggestionId:string,status:string,value:string){db.run('INSERT INTO ai_feedback_events(session_id,suggestion_id,status,value,created_at) VALUES(:sessionId,:suggestionId,:status,:value,:now)',{':sessionId':sessionId,':suggestionId':suggestionId.slice(0,100),':status':status.slice(0,20),':value':value.slice(0,10000),':now':new Date().toISOString()});db.run('UPDATE ai_generation_sessions SET status=:status WHERE id=:id',{':status':status,':id':sessionId});saveDatabase();return true}
export function clearAIHistory(){db.run('DELETE FROM ai_feedback_events');db.run('DELETE FROM ai_generation_sessions');saveDatabase();return true}

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
  const existing = listInventory().map((row) => row.sku);
  const sku = input.sku?.trim() || nextSku(existing);
  if (existing.includes(sku)) throw new MetroDomainError('CONFLICT', `SKU ${sku} already exists.`, { field: 'sku' });
  const row = normalized(input, sku);
  const now = new Date().toISOString();
  db.run(`INSERT INTO inventory (sku,title,brand,category,gender,size,color,condition,purchase_price,list_price,shipping_cost,ebay_fees,
    profit,roi,quantity,bin,rack,shelf,drawer,supplier,purchase_date,listing_date,sold_date,ebay_item_id,status,notes,created_at,updated_at)
    VALUES (:sku,:title,:brand,:category,:gender,:size,:color,:condition,:purchasePrice,:listPrice,:shippingCost,:ebayFees,
    :profit,:roi,:quantity,:bin,:rack,:shelf,:drawer,:supplier,:purchaseDate,:listingDate,:soldDate,:ebayItemId,:status,:notes,:createdAt,:updatedAt)`,
  { ...params(row), ':createdAt': now, ':updatedAt': now });
  const id = Number(db.exec('SELECT last_insert_rowid()')[0].values[0][0]);
  saveDatabase();
  return rowsFromQuery(`SELECT ${selectFields} FROM inventory i WHERE i.id=:id`, { ':id': id })[0] as unknown as InventoryItem;
}

export function updateInventory(id: number, input: InventoryInput) {
  const current = rowsFromQuery('SELECT sku FROM inventory WHERE id=:id', { ':id': id })[0];
  if (!current) throw new MetroDomainError('NOT_FOUND', 'Inventory record no longer exists.');
  const row = normalized(input, input.sku?.trim() || String(current.sku));
  const duplicate = rowsFromQuery('SELECT id FROM inventory WHERE sku=:sku AND id<>:id', { ':sku': row.sku, ':id': id })[0];
  if (duplicate) throw new MetroDomainError('CONFLICT', `SKU ${row.sku} already exists.`, { field: 'sku' });
  db.run(`UPDATE inventory SET ${writeFields}, updated_at=:updatedAt WHERE id=:id`, { ...params(row), ':updatedAt': new Date().toISOString(), ':id': id });
  saveDatabase();
  return rowsFromQuery(`SELECT ${selectFields} FROM inventory i WHERE i.id=:id`, { ':id': id })[0] as unknown as InventoryItem;
}

export function deleteInventory(id: number) {
  db.run('DELETE FROM listings WHERE inventory_id=:id', { ':id': id });
  db.run('DELETE FROM inventory_photos WHERE inventory_id=:id', { ':id': id });
  db.run('DELETE FROM inventory WHERE id=:id', { ':id': id });
  if (db.getRowsModified() === 0) throw new MetroDomainError('NOT_FOUND', 'Inventory record no longer exists.');
  saveDatabase();
  return true;
}

const emptyChecklist:ListingChecklist={photosComplete:false,primaryPhotoSelected:false,titleComplete:false,descriptionComplete:false,itemSpecificsComplete:false,pricingComplete:false,shippingComplete:false,readyToList:false};
const listingFields=`id,inventory_id AS inventoryId,listing_title AS listingTitle,description,category,condition,brand,department,size,color,material,style,type,model,mpn,upc,country_of_manufacture AS countryOfManufacture,list_price AS listPrice,minimum_offer AS minimumOffer,shipping_service AS shippingService,shipping_charge AS shippingCharge,handling_time AS handlingTime,return_policy AS returnPolicy,ebay_item_id AS ebayItemId,listing_url AS listingUrl,status,internal_notes AS internalNotes,checklist_json AS checklistJson,created_at AS createdAt,updated_at AS updatedAt`;
function listingFromRow(row:InventoryRow):ListingRecord{let checklist=emptyChecklist;try{checklist={...emptyChecklist,...JSON.parse(String(row.checklistJson??'{}'))};}catch{}const{checklistJson:_discard,...rest}=row;return{...rest,checklist} as unknown as ListingRecord;}
export function getListing(inventoryId:number){const existing=rowsFromQuery(`SELECT ${listingFields} FROM listings WHERE inventory_id=:inventoryId`,{':inventoryId':inventoryId})[0];if(existing)return listingFromRow(existing);const item=rowsFromQuery('SELECT * FROM inventory WHERE id=:id',{':id':inventoryId})[0];if(!item)throw new MetroDomainError('NOT_FOUND','Inventory record no longer exists.');const now=new Date().toISOString();db.run(`INSERT INTO listings(inventory_id,listing_title,category,condition,brand,department,size,color,list_price,ebay_item_id,created_at,updated_at) VALUES(:id,:title,:category,:condition,:brand,:department,:size,:color,:price,:ebayItemId,:now,:now)`,{':id':inventoryId,':title':item.title,':category':item.category,':condition':item.condition,':brand':item.brand,':department':item.gender,':size':item.size,':color':item.color,':price':item.list_price,':ebayItemId':item.ebay_item_id,':now':now});saveDatabase();return getListing(inventoryId);}
export function saveListing(inventoryId:number,input:ListingInput){getListing(inventoryId);if(input.listingTitle.length>80)throw new MetroDomainError('VALIDATION','Listing titles cannot exceed 80 characters.',{field:'listingTitle'});if(input.checklist.readyToList&&input.listingTitle.trim().length===0)throw new MetroDomainError('VALIDATION','A valid title is required before Ready to List.');const now=new Date().toISOString();db.run(`UPDATE listings SET listing_title=:listingTitle,description=:description,category=:category,condition=:condition,brand=:brand,department=:department,size=:size,color=:color,material=:material,style=:style,type=:type,model=:model,mpn=:mpn,upc=:upc,country_of_manufacture=:countryOfManufacture,list_price=:listPrice,minimum_offer=:minimumOffer,shipping_service=:shippingService,shipping_charge=:shippingCharge,handling_time=:handlingTime,return_policy=:returnPolicy,ebay_item_id=:ebayItemId,listing_url=:listingUrl,status=:status,internal_notes=:internalNotes,checklist_json=:checklist,updated_at=:now WHERE inventory_id=:inventoryId`,{...Object.fromEntries(Object.entries(input).filter(([key])=>key!=='checklist').map(([key,value])=>[`:${key}`,value])),':checklist':JSON.stringify(input.checklist),':now':now,':inventoryId':inventoryId});saveDatabase();return getListing(inventoryId);}
export function listListingInventory(){return listInventory().map(item=>({item,listing:getListing(item.id)}));}

const photoFields = `id, inventory_id AS inventoryId, file_name AS fileName, original_file_name AS originalFileName,
  mime_type AS mimeType, file_size AS fileSize, file_path AS filePath, thumbnail_path AS thumbnailPath,
  position, is_primary AS isPrimary, created_at AS createdAt, updated_at AS updatedAt`;

export function inventoryExists(id: number) {
  return Boolean(rowsFromQuery('SELECT id FROM inventory WHERE id=:id', { ':id': id })[0]);
}

export function listPhotos(inventoryId: number) {
  return rowsFromQuery(`SELECT ${photoFields} FROM inventory_photos WHERE inventory_id=:inventoryId ORDER BY is_primary DESC, position, id`, { ':inventoryId': inventoryId })
    .map((row) => ({ ...row, isPrimary: Boolean(row.isPrimary) })) as unknown as InventoryPhoto[];
}

export function photoFingerprintExists(inventoryId: number, fingerprint: string) {
  return Boolean(rowsFromQuery('SELECT id FROM inventory_photos WHERE inventory_id=:inventoryId AND fingerprint=:fingerprint', { ':inventoryId': inventoryId, ':fingerprint': fingerprint })[0]);
}

export function createPhoto(input: PhotoImportInput, fileName: string, filePath: string, thumbnailPath: string) {
  const current = listPhotos(input.inventoryId);
  const now = new Date().toISOString();
  db.run(`INSERT INTO inventory_photos (inventory_id,file_name,original_file_name,mime_type,file_size,file_path,thumbnail_path,fingerprint,position,is_primary,created_at,updated_at)
    VALUES (:inventoryId,:fileName,:originalFileName,:mimeType,:fileSize,:filePath,:thumbnailPath,:fingerprint,:position,:isPrimary,:createdAt,:updatedAt)`, {
      ':inventoryId': input.inventoryId, ':fileName': fileName, ':originalFileName': input.originalFileName, ':mimeType': input.mimeType,
      ':fileSize': input.fileSize, ':filePath': filePath, ':thumbnailPath': thumbnailPath, ':fingerprint': input.fingerprint,
      ':position': current.length, ':isPrimary': current.length === 0 ? 1 : 0, ':createdAt': now, ':updatedAt': now
    });
  saveDatabase();
  return listPhotos(input.inventoryId).find((photo) => photo.fileName === fileName)!;
}

export function reorderPhotos(inventoryId: number, ids: number[]) {
  const current = listPhotos(inventoryId);
  if (ids.length !== current.length || new Set(ids).size !== ids.length || ids.some((id) => !current.some((photo) => photo.id === id))) throw new MetroDomainError('VALIDATION', 'Photo order is invalid.');
  db.run('BEGIN');
  try {
    ids.forEach((id, position) => db.run('UPDATE inventory_photos SET position=:position,updated_at=:updatedAt WHERE id=:id AND inventory_id=:inventoryId', { ':position': position, ':updatedAt': new Date().toISOString(), ':id': id, ':inventoryId': inventoryId }));
    db.run('COMMIT'); saveDatabase(); return listPhotos(inventoryId);
  } catch (error) { db.run('ROLLBACK'); throw error; }
}

export function setPrimaryPhoto(inventoryId: number, photoId: number) {
  if (!listPhotos(inventoryId).some((photo) => photo.id === photoId)) throw new MetroDomainError('NOT_FOUND', 'Photo no longer exists.');
  db.run('BEGIN');
  try {
    db.run('UPDATE inventory_photos SET is_primary=0 WHERE inventory_id=:inventoryId', { ':inventoryId': inventoryId });
    db.run('UPDATE inventory_photos SET is_primary=1,updated_at=:updatedAt WHERE inventory_id=:inventoryId AND id=:id', { ':updatedAt': new Date().toISOString(), ':inventoryId': inventoryId, ':id': photoId });
    db.run('COMMIT'); saveDatabase(); return listPhotos(inventoryId);
  } catch (error) { db.run('ROLLBACK'); throw error; }
}

export function photoById(inventoryId: number, photoId: number) { return listPhotos(inventoryId).find((photo) => photo.id === photoId); }

export function deletePhotoRecord(inventoryId: number, photoId: number) {
  const photo = photoById(inventoryId, photoId);
  if (!photo) throw new MetroDomainError('NOT_FOUND', 'Photo no longer exists.');
  db.run('DELETE FROM inventory_photos WHERE id=:id AND inventory_id=:inventoryId', { ':id': photoId, ':inventoryId': inventoryId });
  const remaining = listPhotos(inventoryId);
  if (photo.isPrimary && remaining[0]) db.run('UPDATE inventory_photos SET is_primary=1 WHERE id=:id', { ':id': remaining[0].id });
  saveDatabase(); return listPhotos(inventoryId);
}
