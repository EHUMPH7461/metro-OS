import { describe, expect, it } from 'vitest';
import { calculateItemFinancials, dashboardMetrics } from './inventory';
import type { InventoryItem } from './types/inventory';

const item = (overrides: Partial<InventoryItem> = {}): InventoryItem => ({
  id: 1, sku: 'MRR-2026-000001', title: 'Jacket', brand: 'Metro', category: 'Outerwear', gender: 'Unisex',
  size: 'M', color: 'Blue', condition: 'Excellent', purchasePrice: 20, listPrice: 60, shippingCost: 8,
  ebayFees: 9, profit: 23, roi: 115, quantity: 2, bin: 'B1', rack: 'R1', shelf: 'S1', drawer: '',
  supplier: 'Estate sale', purchaseDate: '2026-07-01', listingDate: '2026-07-10', soldDate: '', ebayItemId: '',
  status: 'Active', notes: '', createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z', ...overrides
});

describe('Metro Command Center inventory calculations', () => {
  it('recalculates gross profit, net profit, and ROI', () => {
    expect(calculateItemFinancials(item())).toEqual({ grossProfit: 40, netProfit: 23, roi: 115 });
  });

  it('builds dashboard KPIs from inventory', () => {
    const now = new Date('2026-07-20T12:00:00Z');
    const metrics = dashboardMetrics([item(), item({ id: 2, status: 'Sold', soldDate: '2026-07-20T10:00:00Z', quantity: 1 })], now);
    expect(metrics).toMatchObject({ totalInventory: 3, activeListings: 1, soldToday: 1, soldThisWeek: 1, inventoryCost: 60, inventoryValue: 180, estimatedProfit: 69 });
  });
});
