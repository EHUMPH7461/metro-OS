import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { managedPath, validatePhotoImport } from './photo-validation.js';

const valid = { inventoryId: 1, originalFileName: 'shirt.jpg', mimeType: 'image/jpeg', fileSize: 3, dataBase64: 'YWJj', thumbnailBase64: 'YWJj', fingerprint: 'abc' };
describe('photo validation', () => {
  it('accepts supported image input', () => expect(validatePhotoImport(valid).originalFileName).toBe('shirt.jpg'));
  it('rejects unsupported types', () => expect(() => validatePhotoImport({ ...valid, mimeType: 'image/svg+xml' })).toThrow(/JPEG/));
  it('rejects empty files', () => expect(() => validatePhotoImport({ ...valid, fileSize: 0 })).toThrow(/20 MB/));
  it('keeps managed paths inside an inventory directory', () => expect(managedPath('C:\\photos', 2, '..\\bad.jpg')).toBe(path.resolve('C:\\photos', '2', 'bad.jpg')));
});
