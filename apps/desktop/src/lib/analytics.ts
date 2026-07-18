import { getDatabase } from './db'

export interface Order {
  id: string
  inventoryId: string
  listingId: string | null
  ebayOrderId: string | null
  salePrice: number
  platformFees: number
  costOfGoods: number
  netProfit: number
  orderDate: Date
  status: 'pending' | 'shipped' | 'delivered' | 'returned'
}

export interface DailySummary {
  date: string
  revenue: number
  costOfGoodsSold: number
  fees: number
  netProfit: number
  unitsSold: number
  profitMargin: number
}

export const recordOrder = (order: Omit<Order, 'id' | 'netProfit'>): Order => {
  const db = getDatabase()
  const { v4: uuidv4 } = require('uuid')
  const id = uuidv4()
  const netProfit = order.salePrice - order.platformFees - order.costOfGoods

  const stmt = db.prepare(`
    INSERT INTO orders (id, inventory_id, listing_id, ebay_order_id, sale_price, platform_fees, cost_of_goods, order_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    id,
    order.inventoryId,
    order.listingId || null,
    order.ebayOrderId || null,
    order.salePrice,
    order.platformFees,
    order.costOfGoods,
    new Date().toISOString(),
    order.status || 'pending'
  )

  return {
    ...order,
    id,
    netProfit,
    orderDate: new Date(),
  }
}

export const getDailySummary = (date: string): DailySummary => {
  const db = getDatabase()
  const stmt = db.prepare(`
    SELECT
      DATE(order_date) as date,
      SUM(sale_price) as revenue,
      SUM(cost_of_goods) as costOfGoodsSold,
      SUM(platform_fees) as fees,
      SUM(sale_price - platform_fees - cost_of_goods) as netProfit,
      COUNT(*) as unitsSold
    FROM orders
    WHERE DATE(order_date) = ?
  `)

  const result = stmt.get(date) as any
  if (!result || result.revenue === null) {
    return {
      date,
      revenue: 0,
      costOfGoodsSold: 0,
      fees: 0,
      netProfit: 0,
      unitsSold: 0,
      profitMargin: 0,
    }
  }

  return {
    date,
    revenue: result.revenue,
    costOfGoodsSold: result.costOfGoodsSold,
    fees: result.fees,
    netProfit: result.netProfit,
    unitsSold: result.unitsSold,
    profitMargin: result.revenue > 0 ? (result.netProfit / result.revenue) * 100 : 0,
  }
}

export const getMonthlySummary = (year: number, month: number): DailySummary => {
  const db = getDatabase()
  const monthStr = `${year}-${String(month).padStart(2, '0')}`

  const stmt = db.prepare(`
    SELECT
      '${monthStr}' as date,
      SUM(sale_price) as revenue,
      SUM(cost_of_goods) as costOfGoodsSold,
      SUM(platform_fees) as fees,
      SUM(sale_price - platform_fees - cost_of_goods) as netProfit,
      COUNT(*) as unitsSold
    FROM orders
    WHERE strftime('%Y-%m', order_date) = ?
  `)

  const result = stmt.get(monthStr) as any
  if (!result || result.revenue === null) {
    return {
      date: monthStr,
      revenue: 0,
      costOfGoodsSold: 0,
      fees: 0,
      netProfit: 0,
      unitsSold: 0,
      profitMargin: 0,
    }
  }

  return {
    date: monthStr,
    revenue: result.revenue,
    costOfGoodsSold: result.costOfGoodsSold,
    fees: result.fees,
    netProfit: result.netProfit,
    unitsSold: result.unitsSold,
    profitMargin: result.revenue > 0 ? (result.netProfit / result.revenue) * 100 : 0,
  }
}
