import { describe, expect, it } from 'vitest';
import { validateInventoryId, validateInventoryInput } from './inventory-validation.js';

describe('inventory IPC validation', () => {
  it('normalizes a valid payload', () => {
    expect(validateInventoryInput({ title: '  Denim jacket  ', status: 'Active', quantity: 2 }))
      .toEqual({ title: 'Denim jacket', status: 'Active', quantity: 2 });
  });

  it.each([
    [{ title: '' }, 'Title is required'],
    [{ title: 'Item', unknown: true }, 'Unknown inventory field'],
    [{ title: 'Item', purchasePrice: Number.NaN }, 'non-negative number'],
    [{ title: 'Item', status: 'Pending' }, 'not supported'],
    [{ title: 'Item', purchaseDate: '07/20/2026' }, 'YYYY-MM-DD']
  ])('rejects malformed payloads', (payload, message) => {
    expect(() => validateInventoryInput(payload)).toThrow(message);
  });

  it('rejects invalid record ids', () => {
    expect(() => validateInventoryId(-1)).toThrow('positive integer');
  });
});
