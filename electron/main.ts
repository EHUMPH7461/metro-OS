import { app, BrowserWindow, dialog, ipcMain, session } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clearAIHistory, createInventory, deleteInventory, initializeDatabase, listAIHistory, listAnalyticsRecords, listInventory, listListingInventory, reorderPhotos, saveAIFeedback, saveAIHistory, saveListing, setPrimaryPhoto, updateInventory } from './database.js';
import { asIpcResult } from './errors.js';
import { validateInventoryId, validateInventoryInput } from './inventory-validation.js';
import { deleteInventoryPhotoDirectory, deleteManagedPhoto, importManagedPhoto, listManagedPhotos } from './photo-storage.js';
import { validatePhotoImport, validatePositiveId } from './photo-validation.js';
import { validateListingInput } from './listing-validation.js';
import { validateAnalyticsExport } from './analytics-export.js';
import{generateWithRetry,LocalAIProvider,providerInfo}from'./ai-provider.js';
import type{AIRequest,AISettings}from'../shared/ai.js';

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
  ipcMain.handle('listings:queue',()=>asIpcResult(()=>listListingInventory().map(({item,listing})=>{const photos=listManagedPhotos(item.id);const validTitle=listing.listingTitle.trim().length>0&&listing.listingTitle.length<=80;const checks=[photos.length>0,Boolean(photos.find(photo=>photo.isPrimary)),validTitle,Boolean(listing.description.trim()),Boolean(listing.brand&&listing.category&&listing.condition&&listing.size&&listing.color),listing.listPrice>0,Boolean(listing.shippingService&&listing.handlingTime>0)];const labels=['photos','primary photo','valid title','description','item specifics','pricing','shipping'];return{inventoryId:item.id,sku:item.sku,title:item.title,brand:item.brand,category:item.category,condition:item.condition,size:item.size,color:item.color,purchasePrice:item.purchasePrice,listPrice:item.listPrice,bin:item.bin,rack:item.rack,shelf:item.shelf,drawer:item.drawer,photoCount:photos.length,primaryPhotoUrl:photos.find(photo=>photo.isPrimary)?.imageUrl,listing,readiness:Math.round(checks.filter(Boolean).length/checks.length*100),missing:labels.filter((_,index)=>!checks[index])};})));
  ipcMain.handle('listings:save',(_event,inventoryId,input)=>asIpcResult(()=>saveListing(validatePositiveId(inventoryId,'inventoryId'),validateListingInput(input))));
  ipcMain.handle('analytics:snapshot',()=>asIpcResult(()=>listAnalyticsRecords()));
  ipcMain.handle('analytics:export-csv',async(_event,kind,csv)=>{try{const valid=validateAnalyticsExport(kind,csv);const result=await dialog.showSaveDialog({title:'Export analytics CSV',defaultPath:valid.fileName,filters:[{name:'CSV files',extensions:['csv']}]});if(result.canceled||!result.filePath)return{ok:true,data:{saved:false}};fs.writeFileSync(result.filePath,valid.csv,'utf8');return{ok:true,data:{saved:true,path:result.filePath}}}catch(error){return asIpcResult(()=>{throw error})}});
  ipcMain.handle('ai:info',()=>asIpcResult(()=>providerInfo()));
  ipcMain.handle('ai:generate',(_event,request:AIRequest,settings:AISettings)=>asIpcResult(async()=>{if(!request||!Number.isInteger(request.inventoryId)||request.inventoryId<=0)throw new Error('A valid inventory item is required.');if(settings.provider!=='local')throw new Error('Selected provider is not configured. Use the local offline provider or configure credentials in the main-process environment.');const response=await generateWithRetry(request,{...settings,timeoutMs:Math.min(120000,Math.max(1000,settings.timeoutMs))},undefined,1);const saved=saveAIHistory(request.inventoryId,request.task,response);return{...response,sessionId:saved.id}}));
  ipcMain.handle('ai:history',(_event,inventoryId)=>asIpcResult(()=>listAIHistory(validatePositiveId(inventoryId,'inventoryId'))));
  ipcMain.handle('ai:feedback',(_event,sessionId,suggestionId,status,value)=>asIpcResult(()=>saveAIFeedback(validatePositiveId(sessionId,'sessionId'),String(suggestionId),String(status),String(value))));
  ipcMain.handle('ai:clear-history',()=>asIpcResult(()=>clearAIHistory()));
  ipcMain.handle('ai:test',(_event,settings:AISettings)=>asIpcResult(()=>settings.provider==='local'?new LocalAIProvider().test():{ok:Boolean(process.env.OPENAI_API_KEY),message:process.env.OPENAI_API_KEY?'Credentials detected; adapter activation remains explicit.':'No provider credentials are configured.'}));
  createWindow();
  app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
