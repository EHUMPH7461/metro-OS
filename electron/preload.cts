const { contextBridge, ipcRenderer } = require('electron') as typeof import('electron');

contextBridge.exposeInMainWorld('metro', {
  inventory: {
    list: () => ipcRenderer.invoke('inventory:list'),
    create: (input: unknown) => ipcRenderer.invoke('inventory:create', input),
    update: (id: number, input: unknown) => ipcRenderer.invoke('inventory:update', id, input),
    delete: (id: number) => ipcRenderer.invoke('inventory:delete', id)
  },
  photos: {
    list: (inventoryId: number) => ipcRenderer.invoke('photos:list', inventoryId),
    import: (input: unknown) => ipcRenderer.invoke('photos:import', input),
    reorder: (inventoryId: number, ids: number[]) => ipcRenderer.invoke('photos:reorder', inventoryId, ids),
    setPrimary: (inventoryId: number, photoId: number) => ipcRenderer.invoke('photos:set-primary', inventoryId, photoId),
    delete: (inventoryId: number, photoId: number) => ipcRenderer.invoke('photos:delete', inventoryId, photoId)
  }
});
