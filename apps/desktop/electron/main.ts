import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import isDev from 'electron-is-dev'

let mainWindow: BrowserWindow | null = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      sandbox: true,
    },
  })

  const startUrl = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`

  mainWindow.loadURL(startUrl)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// IPC Handlers for database operations
ipcMain.handle('db:initialize', async () => {
  try {
    const { initializeDatabase } = await import('../src/lib/db')
    await initializeDatabase()
    return { success: true }
  } catch (error) {
    console.error('Failed to initialize database:', error)
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('db:query', async (event, query: string) => {
  try {
    const { executeQuery } = await import('../src/lib/db')
    const result = await executeQuery(query)
    return { success: true, data: result }
  } catch (error) {
    console.error('Database query failed:', error)
    return { success: false, error: (error as Error).message }
  }
})

// Inventory CRUD handlers
ipcMain.handle('inventory:create', async (event, item) => {
  try {
    const { createInventoryItem } = await import('../src/lib/inventory')
    const result = await createInventoryItem(item)
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to create inventory item:', error)
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('inventory:read', async (event, id: string) => {
  try {
    const { getInventoryItem } = await import('../src/lib/inventory')
    const result = await getInventoryItem(id)
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to read inventory item:', error)
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('inventory:list', async () => {
  try {
    const { listInventoryItems } = await import('../src/lib/inventory')
    const result = await listInventoryItems()
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to list inventory items:', error)
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('inventory:update', async (event, id: string, updates: any) => {
  try {
    const { updateInventoryItem } = await import('../src/lib/inventory')
    const result = await updateInventoryItem(id, updates)
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to update inventory item:', error)
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('inventory:delete', async (event, id: string) => {
  try {
    const { deleteInventoryItem } = await import('../src/lib/inventory')
    await deleteInventoryItem(id)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete inventory item:', error)
    return { success: false, error: (error as Error).message }
  }
})
