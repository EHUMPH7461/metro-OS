import type { AnalyticsRecord } from '../../shared/analytics';

export type ActionKind='photos'|'storage'|'cost'|'price'|'category'|'brand'|'title'|'readiness'|'stale';
export type ActionSeverity='complete'|'attention'|'elevated'|'urgent';
export type WorkflowDestination='photos'|'inventory'|'listings';
export type ActionSort='priority'|'category'|'count';
export type ActionImpact={value:number|null;profit:number|null;cost:number|null;qualified:number;total:number};
export type ActionCard={kind:ActionKind;label:string;count:number;inventoryIds:number[];severity:ActionSeverity;destination:WorkflowDestination;filterLabel:string;blockingWeight:number;impact:ActionImpact};
export type InventoryHealth={score:number|null;label:'No inventory'|'Excellent'|'Good'|'Needs Attention'|'Critical';affectedRecords:number;recommendation:string};

export const ACTION_ORDER:ActionKind[]=['price','photos','category','brand','title','readiness','storage','cost','stale'];
const weights:Record<ActionKind,number>={photos:15,storage:8,cost:12,price:17,category:10,brand:7,title:8,readiness:13,stale:10};
const destinations:Record<ActionKind,[WorkflowDestination,string]>={
  photos:['photos','Needs Photos'],storage:['inventory','Needs Storage'],cost:['inventory','Missing Cost'],
  price:['listings','Needs Pricing'],category:['inventory','Needs Category'],brand:['inventory','Needs Brand'],
  title:['listings','Title Errors'],readiness:['listings','Low Readiness'],stale:['inventory','Stale Inventory']
};
export const severityFor=(count:number):ActionSeverity=>count===0?'complete':count<=3?'attention':count<=9?'elevated':'urgent';
export const recordAge=(record:AnalyticsRecord,now=new Date())=>Math.max(0,Math.floor((now.getTime()-(Date.parse(record.purchaseDate||record.createdAt)||now.getTime()))/86400000));
export const recordReadiness=(record:AnalyticsRecord)=>{
  if(record.listing?.checklist){const checks=Object.entries(record.listing.checklist).filter(([key])=>key!=='readyToList').map(([,value])=>Boolean(value));return Math.round(checks.filter(Boolean).length/Math.max(1,checks.length)*100)}
  const checks=[(record.photoCount??0)>0,Boolean(record.title.trim()),record.listPrice>0,Boolean(record.brand&&record.category),Boolean(record.bin||record.rack||record.shelf||record.drawer)];
  return Math.round(checks.filter(Boolean).length/checks.length*100);
};
export function actionMatches(kind:ActionKind,r:AnalyticsRecord,now=new Date()){
  const tests:Record<ActionKind,boolean>={
    photos:(r.photoCount??0)===0,storage:!r.bin&&!r.rack&&!r.shelf&&!r.drawer,cost:r.purchasePrice<=0,
    price:r.listPrice<=0,category:!r.category.trim(),brand:!r.brand.trim(),
    title:(r.listing?.listingTitle??r.title).length>80,readiness:recordReadiness(r)<50,
    stale:r.status!=='Sold'&&r.status!=='Archived'&&recordAge(r,now)>90
  };return tests[kind];
}
const impactFor=(records:AnalyticsRecord[]):ActionImpact=>{
  const qualified=records.filter(r=>Number.isFinite(r.listPrice)&&r.listPrice>0&&Number.isFinite(r.purchasePrice));
  return {value:qualified.length?qualified.reduce((n,r)=>n+r.listPrice,0):null,profit:qualified.length?qualified.reduce((n,r)=>n+r.listPrice-r.purchasePrice-r.shippingCost-r.ebayFees,0):null,cost:qualified.length?qualified.reduce((n,r)=>n+r.purchasePrice,0):null,qualified:qualified.length,total:records.length};
};
export function buildActionCards(records:AnalyticsRecord[],now=new Date()):ActionCard[]{
  const labels:Record<ActionKind,string>={photos:'Missing photos',storage:'Missing storage',cost:'Missing cost',price:'Missing listing price',category:'Missing category',brand:'Missing brand',title:'Titles over 80 characters',readiness:'Listings below 50% readiness',stale:'Inventory over 90 days old'};
  return ACTION_ORDER.map(kind=>{const matches=records.filter(r=>actionMatches(kind,r,now));const [destination,filterLabel]=destinations[kind];return{kind,label:labels[kind],count:matches.length,inventoryIds:matches.map(r=>r.id),severity:severityFor(matches.length),destination,filterLabel,blockingWeight:weights[kind],impact:impactFor(matches)}})
}
export function inventoryHealth(records:AnalyticsRecord[],cards=buildActionCards(records)):InventoryHealth{
  if(!records.length)return{score:null,label:'No inventory',affectedRecords:0,recommendation:'Add inventory to begin measuring completeness.'};
  const totalWeight=Object.values(weights).reduce((a,b)=>a+b,0);
  const penalty=cards.reduce((sum,card)=>sum+card.blockingWeight*(card.count/records.length),0);
  const score=Math.max(0,Math.round(100-penalty/totalWeight*100));
  const label=score>=90?'Excellent':score>=75?'Good':score>=50?'Needs Attention':'Critical';
  const affected=new Set(cards.flatMap(card=>card.inventoryIds)).size;
  const next=sortActionCards(cards,'priority').find(card=>card.count>0);
  return{score,label,affectedRecords:affected,recommendation:next?'Start with '+next.label.toLowerCase()+'.':'All tracked checks are complete.'};
}
export function sortActionCards(cards:ActionCard[],sort:ActionSort){
  const copy=[...cards];if(sort==='category')return copy.sort((a,b)=>a.label.localeCompare(b.label));
  if(sort==='count')return copy.sort((a,b)=>b.count-a.count||ACTION_ORDER.indexOf(a.kind)-ACTION_ORDER.indexOf(b.kind));
  return copy.sort((a,b)=>(b.count>0?1:0)-(a.count>0?1:0)||b.blockingWeight-a.blockingWeight||b.count-a.count||ACTION_ORDER.indexOf(a.kind)-ACTION_ORDER.indexOf(b.kind));
}
export function actionReportCsv(cards:ActionCard[],records:AnalyticsRecord[],now=new Date()){
  const escape=(v:unknown)=>/[",\r\n]/.test(String(v??''))?'"'+String(v??'').replace(/"/g,'""')+'"':String(v??'');
  const rows=[['Issue type','Severity','Item identifier','SKU','Title','Status','Readiness','Estimated value','Estimated profit','Storage location','Record age']];
  for(const card of cards)for(const id of card.inventoryIds){const r=records.find(item=>item.id===id);if(!r)continue;const complete=Number.isFinite(r.listPrice)&&r.listPrice>0&&Number.isFinite(r.purchasePrice);rows.push([card.label,card.severity,String(r.id),r.sku,r.title,r.status,String(recordReadiness(r)),complete?String(r.listPrice):'Insufficient data',complete?String(r.listPrice-r.purchasePrice-r.shippingCost-r.ebayFees):'Insufficient data',[r.rack,r.shelf,r.bin,r.drawer].filter(Boolean).join(' / ')||'Unassigned',String(recordAge(r,now))])}
  return rows.map(row=>row.map(escape).join(',')).join('\r\n')+'\r\n';
}
