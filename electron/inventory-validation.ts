import { INVENTORY_EDITABLE_FIELDS, INVENTORY_STATUSES, type InventoryInput } from '../shared/inventory.js';
import { MetroDomainError } from './errors.js';

const textLimits: Record<string, number> = {
  sku: 32, title: 200, brand: 100, category: 100, gender: 50, size: 50, color: 100,
  condition: 100, bin: 50, rack: 50, shelf: 50, drawer: 50, supplier: 150,
  purchaseDate: 10, listingDate: 10, soldDate: 10, ebayItemId: 100, status: 30, notes: 4000
};
const numericFields = new Set(['purchasePrice', 'listPrice', 'shippingCost', 'ebayFees', 'quantity']);
const dateFields = new Set(['purchaseDate', 'listingDate', 'soldDate']);
const allowedFields = new Set<string>(INVENTORY_EDITABLE_FIELDS);

function invalid(message: string, field?: string): never {
  throw new MetroDomainError('VALIDATION', message, { field });
}

export function validateInventoryId(value: unknown): number {
  if (!Number.isSafeInteger(value) || Number(value) <= 0) invalid('Inventory id must be a positive integer.', 'id');
  return Number(value);
}

export function validateInventoryInput(value: unknown): InventoryInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid('Inventory data must be an object.');
  const source = value as Record<string, unknown>;
  for (const key of Object.keys(source)) if (!allowedFields.has(key)) invalid(`Unknown inventory field: ${key}`, key);

  const output: Record<string, string | number | undefined> = {};
  for (const [key, raw] of Object.entries(source)) {
    if (raw === undefined) continue;
    if (numericFields.has(key)) {
      if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < 0) invalid(`${key} must be a non-negative number.`, key);
      if (key === 'quantity' && (!Number.isSafeInteger(raw) || raw > 1_000_000)) invalid('quantity must be a whole number no greater than 1,000,000.', key);
      output[key] = raw;
      continue;
    }
    if (typeof raw !== 'string') invalid(`${key} must be text.`, key);
    const text = raw.trim();
    if (text.length > textLimits[key]) invalid(`${key} cannot exceed ${textLimits[key]} characters.`, key);
    if (dateFields.has(key) && text && !/^\d{4}-\d{2}-\d{2}$/.test(text)) invalid(`${key} must use YYYY-MM-DD format.`, key);
    output[key] = text;
  }
  if (!String(output.title ?? '').trim()) invalid('Title is required.', 'title');
  const sku = String(output.sku ?? '');
  // Legacy MRR numeric SKUs remain editable; newly generated SKUs use the dated format.
  if (sku && !/^MRR-(?:\d{4}-\d{6}|\d+)$/.test(sku)) invalid('SKU must use MRR-YYYY-000000 format.', 'sku');
  if (output.status && !INVENTORY_STATUSES.includes(output.status as typeof INVENTORY_STATUSES[number])) invalid('Status is not supported.', 'status');
  return output as InventoryInput;
}
