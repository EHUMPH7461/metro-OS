export const INVENTORY_STATUSES = ['Draft', 'Active', 'Sold', 'Archived'] as const;
export type InventoryStatus = typeof INVENTORY_STATUSES[number];

export type InventoryItem = {
  id: number; sku: string; title: string; brand: string; category: string; gender: string; size: string;
  color: string; condition: string; purchasePrice: number; listPrice: number; shippingCost: number;
  ebayFees: number; profit: number; roi: number; quantity: number; bin: string; rack: string; shelf: string;
  drawer: string; supplier: string; purchaseDate: string; listingDate: string; soldDate: string;
  ebayItemId: string; status: InventoryStatus; notes: string; createdAt: string; updatedAt: string;
};

export type InventoryInput = Omit<InventoryItem, 'id' | 'profit' | 'roi' | 'createdAt' | 'updatedAt'>;
export type InventoryEditableField = keyof InventoryInput;
export const INVENTORY_EDITABLE_FIELDS = [
  'sku', 'title', 'brand', 'category', 'gender', 'size', 'color', 'condition', 'purchasePrice',
  'listPrice', 'shippingCost', 'ebayFees', 'quantity', 'bin', 'rack', 'shelf', 'drawer', 'supplier',
  'purchaseDate', 'listingDate', 'soldDate', 'ebayItemId', 'status', 'notes'
] as const satisfies readonly InventoryEditableField[];

export type MetroErrorCode = 'VALIDATION' | 'CONFLICT' | 'NOT_FOUND' | 'PERSISTENCE' | 'UNEXPECTED';
export type MetroError = { code: MetroErrorCode; message: string; field?: string; retryable: boolean };
export type IpcResult<T> = { ok: true; data: T } | { ok: false; error: MetroError };
