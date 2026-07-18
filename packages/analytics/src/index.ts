// Financial analytics and reporting functions

export interface DailySummary {
  date: Date
  revenue: number
  costOfGoodsSold: number
  fees: number
  netProfit: number
  unitsSold: number
  profitMargin: number
}

export interface MonthlySummary extends DailySummary {
  dailyAverage: number
}

/**
 * Calculate profit for an order
 */
export function calculateOrderProfit(
  salePrice: number,
  costOfGoods: number,
  platformFees: number,
  shippingCost: number
): number {
  return salePrice - costOfGoods - platformFees - shippingCost
}

/**
 * Calculate profit margin percentage
 */
export function calculateProfitMargin(profit: number, revenue: number): number {
  return revenue > 0 ? (profit / revenue) * 100 : 0
}

/**
 * Generate daily financial summary
 */
export function generateDailySummary(orders: any[]): DailySummary {
  const revenue = orders.reduce((sum, order) => sum + order.salePrice, 0)
  const cogs = orders.reduce((sum, order) => sum + order.costOfGoods, 0)
  const fees = orders.reduce((sum, order) => sum + order.platformFees, 0)
  const profit = revenue - cogs - fees

  return {
    date: new Date(),
    revenue,
    costOfGoodsSold: cogs,
    fees,
    netProfit: profit,
    unitsSold: orders.length,
    profitMargin: calculateProfitMargin(profit, revenue),
  }
}

/**
 * Generate monthly financial summary
 */
export function generateMonthlySummary(dailySummaries: DailySummary[]): MonthlySummary {
  const totalRevenue = dailySummaries.reduce((sum, day) => sum + day.revenue, 0)
  const totalCogs = dailySummaries.reduce((sum, day) => sum + day.costOfGoodsSold, 0)
  const totalFees = dailySummaries.reduce((sum, day) => sum + day.fees, 0)
  const totalProfit = dailySummaries.reduce((sum, day) => sum + day.netProfit, 0)
  const totalUnits = dailySummaries.reduce((sum, day) => sum + day.unitsSold, 0)

  return {
    date: new Date(),
    revenue: totalRevenue,
    costOfGoodsSold: totalCogs,
    fees: totalFees,
    netProfit: totalProfit,
    unitsSold: totalUnits,
    profitMargin: calculateProfitMargin(totalProfit, totalRevenue),
    dailyAverage: totalRevenue / dailySummaries.length,
  }
}
