import path from 'node:path';
import { PHOTO_MIME_TYPES, type PhotoImportInput, type PhotoMimeType } from '../shared/photos.js';
import { MetroDomainError } from './errors.js';

const MAX_PHOTO_BYTES = 20 * 1024 * 1024;
const extensions: Record<PhotoMimeType, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

export function validatePositiveId(value: unknown, field = 'id') {
  if (!Number.isSafeInteger(value) || Number(value) <= 0) throw new MetroDomainError('VALIDATION', `A valid ${field} is required.`, { field });
  return Number(value);
}

function cleanBase64(value: unknown, field: string) {
  if (typeof value !== 'string' || !value || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) throw new MetroDomainError('VALIDATION', `Invalid ${field}.`, { field });
  return value;
}

export function validatePhotoImport(value: unknown): PhotoImportInput {
  if (!value || typeof value !== 'object') throw new MetroDomainError('VALIDATION', 'Photo details are required.');
  const input = value as Record<string, unknown>;
  const inventoryId = validatePositiveId(input.inventoryId, 'inventoryId');
  if (typeof input.originalFileName !== 'string' || !input.originalFileName.trim()) throw new MetroDomainError('VALIDATION', 'The photo filename is required.', { field: 'originalFileName' });
  const mimeType = input.mimeType as PhotoMimeType;
  if (!PHOTO_MIME_TYPES.includes(mimeType)) throw new MetroDomainError('VALIDATION', 'Only JPEG, PNG, and WebP photos are supported.', { field: 'mimeType' });
  const fileSize = Number(input.fileSize);
  if (!Number.isSafeInteger(fileSize) || fileSize <= 0 || fileSize > MAX_PHOTO_BYTES) throw new MetroDomainError('VALIDATION', 'Photos must be between 1 byte and 20 MB.', { field: 'fileSize' });
  const originalFileName = path.basename(input.originalFileName.trim()).slice(0, 180);
  return { inventoryId, originalFileName, mimeType, fileSize, dataBase64: cleanBase64(input.dataBase64, 'photo data'), thumbnailBase64: cleanBase64(input.thumbnailBase64, 'thumbnail data'), fingerprint: typeof input.fingerprint === 'string' ? input.fingerprint.slice(0, 128) : '' };
}

export function extensionFor(mimeType: PhotoMimeType) { return extensions[mimeType]; }

export function managedPath(root: string, inventoryId: number, fileName: string) {
  const inventoryRoot = path.resolve(root, String(validatePositiveId(inventoryId, 'inventoryId')));
  const resolved = path.resolve(inventoryRoot, path.basename(fileName));
  if (!resolved.startsWith(`${inventoryRoot}${path.sep}`)) throw new MetroDomainError('VALIDATION', 'Unsafe photo path.');
  return resolved;
}
