import{MetroDomainError}from'./errors.js';
const kinds=new Set(['category','brand','aging','actions']);
export function validateAnalyticsExport(kind:unknown,csv:unknown){if(typeof kind!=='string'||!kinds.has(kind))throw new MetroDomainError('VALIDATION','Unsupported analytics export.');if(typeof csv!=='string'||csv.length===0||csv.length>10_000_000)throw new MetroDomainError('VALIDATION','Analytics CSV content is invalid.');return{kind,csv,fileName:`metro-analytics-${kind}-${new Date().toISOString().slice(0,10)}.csv`}}
