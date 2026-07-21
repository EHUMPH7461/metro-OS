export type { InventoryInput, InventoryItem, InventoryStatus, IpcResult, MetroError } from '../../shared/inventory';
export type { InventoryPhoto, PhotoImportInput, PhotoApi } from '../../shared/photos';
import type { InventoryInput, InventoryItem, IpcResult } from '../../shared/inventory';

declare global {
  interface Window {
    metro?: {
      inventory: {
        list: () => Promise<IpcResult<InventoryItem[]>>;
        create: (input: InventoryInput) => Promise<IpcResult<InventoryItem>>;
        update: (id: number, input: InventoryInput) => Promise<IpcResult<InventoryItem>>;
        delete: (id: number) => Promise<IpcResult<boolean>>;
      };
      photos: import('../../shared/photos').PhotoApi;
      listings: import('../../shared/listings').ListingApi;
      analytics: import('../../shared/analytics').AnalyticsApi;
      ai: import('../../shared/ai').AIApi;
    };
  }
}
