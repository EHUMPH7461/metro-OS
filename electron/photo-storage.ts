import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { InventoryPhoto, PhotoImportInput } from '../shared/photos.js';
import { createPhoto, deletePhotoRecord, inventoryExists, listPhotos, photoById, photoFingerprintExists } from './database.js';
import { MetroDomainError } from './errors.js';
import { extensionFor, managedPath } from './photo-validation.js';

function photoRoot() { return path.join(app.getPath('userData'), 'inventory-photos'); }
function asDataUrl(filePath: string, mimeType: string) {
  try { return `data:${mimeType};base64,${fs.readFileSync(filePath).toString('base64')}`; }
  catch { return ''; }
}
function hydrated(photo: InventoryPhoto): InventoryPhoto {
  return { ...photo, imageUrl: asDataUrl(photo.filePath, photo.mimeType), thumbnailUrl: asDataUrl(photo.thumbnailPath, 'image/jpeg') };
}
export function listManagedPhotos(inventoryId: number) { return listPhotos(inventoryId).map(hydrated); }

export function importManagedPhoto(input: PhotoImportInput) {
  if (!inventoryExists(input.inventoryId)) throw new MetroDomainError('NOT_FOUND', 'Select an existing inventory item first.');
  if (photoFingerprintExists(input.inventoryId, input.fingerprint)) throw new MetroDomainError('CONFLICT', `${input.originalFileName} is already attached to this item.`);
  const directory = path.join(photoRoot(), String(input.inventoryId));
  fs.mkdirSync(directory, { recursive: true });
  const token = `${Date.now()}-${crypto.randomUUID()}`;
  const fileName = `${token}${extensionFor(input.mimeType)}`;
  const thumbnailName = `${token}-thumb.jpg`;
  const filePath = managedPath(photoRoot(), input.inventoryId, fileName);
  const thumbnailPath = managedPath(photoRoot(), input.inventoryId, thumbnailName);
  try {
    fs.writeFileSync(filePath, Buffer.from(input.dataBase64, 'base64'), { flag: 'wx' });
    fs.writeFileSync(thumbnailPath, Buffer.from(input.thumbnailBase64, 'base64'), { flag: 'wx' });
    return hydrated(createPhoto(input, fileName, filePath, thumbnailPath));
  } catch (error) {
    fs.rmSync(filePath, { force: true }); fs.rmSync(thumbnailPath, { force: true });
    if (error instanceof MetroDomainError) throw error;
    throw new MetroDomainError('PERSISTENCE', 'The photo could not be saved safely.', { retryable: true });
  }
}

export function deleteManagedPhoto(inventoryId: number, photoId: number) {
  const photo = photoById(inventoryId, photoId);
  if (!photo) throw new MetroDomainError('NOT_FOUND', 'Photo no longer exists.');
  try { fs.rmSync(managedPath(photoRoot(), inventoryId, photo.fileName)); fs.rmSync(managedPath(photoRoot(), inventoryId, path.basename(photo.thumbnailPath))); }
  catch { throw new MetroDomainError('PERSISTENCE', 'The photo file could not be removed. The record was kept.', { retryable: true }); }
  return deletePhotoRecord(inventoryId, photoId).map(hydrated);
}

export function deleteInventoryPhotoDirectory(inventoryId: number) {
  const target = path.resolve(photoRoot(), String(inventoryId));
  if (!target.startsWith(`${path.resolve(photoRoot())}${path.sep}`)) throw new MetroDomainError('VALIDATION', 'Unsafe inventory photo path.');
  try { fs.rmSync(target, { recursive: true, force: true }); }
  catch { throw new MetroDomainError('PERSISTENCE', 'Inventory photos could not be removed. The inventory record was kept.', { retryable: true }); }
}
