import type { InventoryInput, InventoryItem, IpcResult, MetroError } from '../../shared/inventory';

export class InventoryServiceError extends Error {
  constructor(public readonly detail: MetroError) { super(detail.message); }
}

export function unwrap<T>(result: IpcResult<T>): T {
  if (!result.ok) throw new InventoryServiceError(result.error);
  return result.data;
}

export const inventoryService = {
  async list(): Promise<InventoryItem[]> { return window.metro ? unwrap(await window.metro.inventory.list()) : []; },
  async create(input: InventoryInput): Promise<InventoryItem> { if (!window.metro) throw new Error('Inventory storage is unavailable.'); return unwrap(await window.metro.inventory.create(input)); },
  async update(id: number, input: InventoryInput): Promise<InventoryItem> { if (!window.metro) throw new Error('Inventory storage is unavailable.'); return unwrap(await window.metro.inventory.update(id, input)); },
  async delete(id: number): Promise<boolean> { if (!window.metro) throw new Error('Inventory storage is unavailable.'); return unwrap(await window.metro.inventory.delete(id)); }
};

export const readableError = (error: unknown) => error instanceof Error ? error.message : 'Something unexpected happened. Please try again.';
