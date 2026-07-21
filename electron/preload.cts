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
  },
  listings:{queue:()=>ipcRenderer.invoke('listings:queue'),save:(inventoryId:number,input:unknown)=>ipcRenderer.invoke('listings:save',inventoryId,input)},
  analytics:{snapshot:()=>ipcRenderer.invoke('analytics:snapshot'),exportCsv:(kind:string,csv:string)=>ipcRenderer.invoke('analytics:export-csv',kind,csv)},
  ai:{info:()=>ipcRenderer.invoke('ai:info'),generate:(request:unknown,settings:unknown)=>ipcRenderer.invoke('ai:generate',request,settings),history:(inventoryId:number)=>ipcRenderer.invoke('ai:history',inventoryId),feedback:(sessionId:number,suggestionId:string,status:string,value:string)=>ipcRenderer.invoke('ai:feedback',sessionId,suggestionId,status,value),clearHistory:()=>ipcRenderer.invoke('ai:clear-history'),test:(settings:unknown)=>ipcRenderer.invoke('ai:test',settings)}
});
