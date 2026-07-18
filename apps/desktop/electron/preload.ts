import { contextBridge, ipcRenderer } from 'electron'

interface DatabaseAPI {
  initialize: () => Promise<{ success: boolean; error?: string }>
  query: (query: string) => Promise<{ success: boolean; data?: any; error?: string }>
}

interface InventoryAPI {
  create: (item: any) => Promise<{ success: boolean; data?: any; error?: string }>
  read: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>
  list: () => Promise<{ success: boolean; data?: any[]; error?: string }>
  update: (id: string, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>
  delete: (id: string) => Promise<{ success: boolean; error?: string }>
}

interface ElectronAPI {
  db: DatabaseAPI
  inventory: InventoryAPI
}

const electronAPI: ElectronAPI = {
  db: {
    initialize: () => ipcRenderer.invoke('db:initialize'),
    query: (query: string) => ipcRenderer.invoke('db:query', query),
  },
  inventory: {
    create: (item: any) => ipcRenderer.invoke('inventory:create', item),
    read: (id: string) => ipcRenderer.invoke('inventory:read', id),
    list: () => ipcRenderer.invoke('inventory:list'),
    update: (id: string, updates: any) => ipcRenderer.invoke('inventory:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('inventory:delete', id),
  },
}

contextBridge.exposeInMainWorld('electron', electronAPI)

declare global {
  interface Window {
    electron: ElectronAPI
  }
}
