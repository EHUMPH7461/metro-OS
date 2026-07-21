import type { IpcResult, InventoryItem } from './inventory.js';
import type { ListingRecord } from './listings.js';

export type AnalyticsRecord = InventoryItem & {
  salePrice?: number | null;
  otherSellingCosts?: number | null;
  soldStatusAt?: string;
  listingCompletedAt?: string;
  listing?: ListingRecord;
  photoCreatedAt?: string[];
};
export type DatePreset='today'|'7d'|'30d'|'month'|'year'|'all';
export type AnalyticsFilters={datePreset:DatePreset;status:string;category:string;brand:string;storage:string;readinessMin:number;readinessMax:number};
export type MetricValue={value:number|null;complete:boolean;reason?:string};
export type AnalyticsGroup={name:string;count:number;cost:number;value:number;profit:number;soldCount:number};
export type AgingGroup=AnalyticsGroup&{key:string};
export type AnalyticsWarning={kind:string;label:string;count:number;inventoryIds:number[]};
export type AnalyticsResult={
  filteredRecords:AnalyticsRecord[];
  summary:{total:number;active:number;draft:number;ready:number;needsPhoto:number;needsTitle:number;needsPrice:number;sold:number;cost:number;value:number;estimatedProfit:number;averageCost:number;averagePrice:number};
  productivity:{addedToday:number;addedWeek:number;listingsToday:number;listingsWeek:number;photosToday:number;photosWeek:number;averageReadiness:number;ready100:number;below50:number};
  sales:{revenueToday:MetricValue;revenueWeek:MetricValue;revenueMonth:MetricValue;grossProfit:MetricValue;netProfit:MetricValue;averageSellingPrice:MetricValue;averageProfit:MetricValue;profitMargin:MetricValue;sellThrough:MetricValue};
  aging:AgingGroup[];oldestUnsold?:AnalyticsRecord;averageAge:number;
  categories:AnalyticsGroup[];brands:AnalyticsGroup[];
  storage:{racks:AnalyticsGroup[];shelves:AnalyticsGroup[];bins:AnalyticsGroup[];unassigned:number;mostUsed:AnalyticsGroup[]};
  warnings:AnalyticsWarning[];weeklyActivity:Array<{label:string;added:number;listed:number;photos:number}>;
};
export type AnalyticsApi={snapshot:()=>Promise<IpcResult<AnalyticsRecord[]>>;exportCsv:(kind:string,csv:string)=>Promise<IpcResult<{saved:boolean;path?:string}>>};
