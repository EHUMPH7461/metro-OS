const { contextBridge, ipcRenderer } = require('electron') as typeof import('electron');

contextBridge.exposeInMainWorld('metro', {
  inventory: {
    list: () => ipcRenderer.invoke('inventory:list'),
    create: (input: unknown) => ipcRenderer.invoke('inventory:create', input),
    update: (id: number, input: unknown) => ipcRenderer.invoke('inventory:update', id, input),
    delete: (id: number) => ipcRenderer.invoke('inventory:delete', id)
  }
});
