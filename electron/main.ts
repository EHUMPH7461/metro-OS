import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInventory, deleteInventory, initializeDatabase, listInventory, updateInventory } from './database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 700,
    backgroundColor: '#f5f7fb',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) void win.loadURL(devUrl);
  else void win.loadFile(path.join(__dirname, '../dist/index.html'));
}

app.whenReady().then(() => {
  initializeDatabase();
  ipcMain.handle('inventory:list', () => listInventory());
  ipcMain.handle('inventory:create', (_event, input) => createInventory(input));
  ipcMain.handle('inventory:update', (_event, id, input) => updateInventory(id, input));
  ipcMain.handle('inventory:delete', (_event, id) => deleteInventory(id));
  createWindow();
  app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
