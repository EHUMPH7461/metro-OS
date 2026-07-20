import type { IpcResult } from './inventory.js';

export const PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type PhotoMimeType = typeof PHOTO_MIME_TYPES[number];

export type InventoryPhoto = {
  id: number;
  inventoryId: number;
  fileName: string;
  originalFileName: string;
  mimeType: PhotoMimeType;
  fileSize: number;
  filePath: string;
  thumbnailPath: string;
  position: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  thumbnailUrl?: string;
};

export type PhotoImportInput = {
  inventoryId: number;
  originalFileName: string;
  mimeType: PhotoMimeType;
  fileSize: number;
  dataBase64: string;
  thumbnailBase64: string;
  fingerprint: string;
};

export type PhotoApi = {
  list: (inventoryId: number) => Promise<IpcResult<InventoryPhoto[]>>;
  import: (input: PhotoImportInput) => Promise<IpcResult<InventoryPhoto>>;
  reorder: (inventoryId: number, ids: number[]) => Promise<IpcResult<InventoryPhoto[]>>;
  setPrimary: (inventoryId: number, photoId: number) => Promise<IpcResult<InventoryPhoto[]>>;
  delete: (inventoryId: number, photoId: number) => Promise<IpcResult<InventoryPhoto[]>>;
};
