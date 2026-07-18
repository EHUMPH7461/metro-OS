// Database schema definitions using Drizzle ORM
// This is a placeholder - will be expanded with actual schema

export type InventoryItem = {
  id: string
  sku: string
  brand: string
  category: string
  size: string
  color: string
  condition: string
  purchasePrice: number
  status: 'unlisted' | 'listed' | 'sold' | 'archived'
  createdAt: Date
  updatedAt: Date
}

export type Listing = {
  id: string
  inventoryId: string
  title: string
  description: string
  startingPrice: number
  currentPrice: number
  status: 'draft' | 'active' | 'sold_out' | 'ended'
  ebayItemId?: string
  createdAt: Date
  publishedAt?: Date
}

export type Order = {
  id: string
  inventoryId: string
  listingId: string
  ebayOrderId: string
  salePrice: number
  platformFees: number
  costOfGoods: number
  netProfit: number
  orderDate: Date
  status: 'pending' | 'shipped' | 'delivered' | 'returned'
}
