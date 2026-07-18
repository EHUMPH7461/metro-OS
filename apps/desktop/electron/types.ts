export interface IpcResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface InventoryItem {
  id: string
  sku: string
  brand: string
  category: string
  size: string
  color: string
  condition: 'new' | 'like_new' | 'good' | 'fair'
  purchasePrice: number
  status: 'unlisted' | 'listed' | 'sold' | 'archived'
  createdAt: Date
  updatedAt: Date
}
