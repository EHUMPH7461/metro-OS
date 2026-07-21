import { describe, expect, it } from 'vitest';
import { InventoryServiceError, unwrap } from './inventoryService';

describe('inventory service errors', () => {
  it('returns successful IPC data', () => {
    expect(unwrap({ ok: true, data: 42 })).toBe(42);
  });

  it('converts structured IPC failures into readable renderer errors', () => {
    const result = { ok: false as const, error: { code: 'CONFLICT' as const, message: 'That SKU is already in use.', field: 'sku', retryable: false } };
    expect(() => unwrap(result)).toThrow(InventoryServiceError);
    expect(() => unwrap(result)).toThrow('That SKU is already in use.');
  });
});
