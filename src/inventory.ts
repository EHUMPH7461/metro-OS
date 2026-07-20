import type { InventoryInput, InventoryItem } from './types/inventory';

type FinancialSource = Pick<InventoryInput, 'purchasePrice' | 'listPrice' | 'shippingCost' | 'ebayFees'>;

export function calculateItemFinancials(item: FinancialSource) {
  const grossProfit = item.listPrice - item.purchasePrice;
  const netProfit = grossProfit - item.shippingCost - item.ebayFees;
  return { grossProfit, netProfit, roi: item.purchasePrice > 0 ? Math.round((netProfit / item.purchasePrice) * 10000) / 100 : 0 };
}

export function dashboardMetrics(items: InventoryItem[], now = new Date()) {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfToday - 6 * 24 * 60 * 60 * 1000;
  const soldAt = (item: InventoryItem) => item.soldDate ? new Date(item.soldDate).getTime() : 0;
  return {
    totalInventory: items.reduce((sum, item) => sum + item.quantity, 0),
    activeListings: items.filter((item) => item.status === 'Active').length,
    soldToday: items.filter((item) => item.status === 'Sold' && soldAt(item) >= startOfToday).length,
    soldThisWeek: items.filter((item) => item.status === 'Sold' && soldAt(item) >= startOfWeek).length,
    inventoryCost: items.reduce((sum, item) => sum + item.purchasePrice * item.quantity, 0),
    inventoryValue: items.reduce((sum, item) => sum + item.listPrice * item.quantity, 0),
    estimatedProfit: items.reduce((sum, item) => sum + item.profit * item.quantity, 0)
  };
}
