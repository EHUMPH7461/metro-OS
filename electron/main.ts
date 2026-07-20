import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInventory, deleteInventory, initializeDatabase, listInventory, reorderPhotos, setPrimaryPhoto, updateInventory } from './database.js';
import { asIpcResult } from './errors.js';
import { validateInventoryId, validateInventoryInput } from './inventory-validation.js';
import { deleteInventoryPhotoDirectory, deleteManagedPhoto, importManagedPhoto, listManagedPhotos } from './photo-storage.js';
import { validatePhotoImport, validatePositiveId } from './photo-validation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 700,
    backgroundColor: '#f5f7fb',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) void win.loadURL(devUrl);
  else void win.loadFile(path.join(__dirname, '../../dist/index.html'));
}

function configureContentSecurityPolicy() {
  const dev = Boolean(process.env.VITE_DEV_SERVER_URL);
  const policy = dev
    ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' http://localhost:5173 ws://localhost:5173; font-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"
    : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'";
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => callback({
    responseHeaders: { ...details.responseHeaders, 'Content-Security-Policy': [policy] }
  }));
}

app.whenReady().then(async () => {
  await initializeDatabase();
  configureContentSecurityPolicy();
  ipcMain.handle('inventory:list', () => asIpcResult(() => listInventory().map((item) => {
    const primary=listManagedPhotos(item.id)[0];
    return {...item,photoCount:item.photoCount??0,primaryThumbnailUrl:primary?.thumbnailUrl};
  })));
  ipcMain.handle('inventory:create', (_event, input) => asIpcResult(() => createInventory(validateInventoryInput(input))));
  ipcMain.handle('inventory:update', (_event, id, input) => asIpcResult(() => updateInventory(validateInventoryId(id), validateInventoryInput(input))));
  ipcMain.handle('inventory:delete', (_event, id) => asIpcResult(() => { const validId=validateInventoryId(id); deleteInventoryPhotoDirectory(validId); return deleteInventory(validId); }));
  ipcMain.handle('photos:list', (_event, inventoryId) => asIpcResult(() => listManagedPhotos(validatePositiveId(inventoryId, 'inventoryId'))));
  ipcMain.handle('photos:import', (_event, input) => asIpcResult(() => importManagedPhoto(validatePhotoImport(input))));
  ipcMain.handle('photos:reorder', (_event, inventoryId, ids) => asIpcResult(() => {
    const validInventoryId=validatePositiveId(inventoryId, 'inventoryId');
    if (!Array.isArray(ids)) throw new Error('Photo order must be an array.');
    return reorderPhotos(validInventoryId, ids.map((id) => validatePositiveId(id, 'photoId'))).map((photo) => ({...photo, ...listManagedPhotos(validInventoryId).find((item)=>item.id===photo.id)}));
  }));
  ipcMain.handle('photos:set-primary', (_event, inventoryId, photoId) => asIpcResult(() => { const validId=validatePositiveId(inventoryId,'inventoryId'); setPrimaryPhoto(validId,validatePositiveId(photoId,'photoId')); return listManagedPhotos(validId); }));
  ipcMain.handle('photos:delete', (_event, inventoryId, photoId) => asIpcResult(() => deleteManagedPhoto(validatePositiveId(inventoryId,'inventoryId'),validatePositiveId(photoId,'photoId'))));
  createWindow();
  app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
