import{useEffect,useMemo,useState}from'react';
import{AlertTriangle,BarChart3,Download,RefreshCw}from'lucide-react';
import type{AnalyticsFilters,AnalyticsGroup,AnalyticsRecord}from'../../../shared/analytics';
import{analytics,defaultAnalyticsFilters,toCsv}from'../../domain/analytics';
import type{ActionCard}from'../../domain/actionCenter';
import{analyticsService}from'../../services/analyticsService';
import{ActionCenter}from'./ActionCenter';

const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const Metric=({value,label,detail=''}:{value:string|number;label:string;detail?:string})=><article className="analytics-metric"><span>{label}</span><strong>{value}</strong>{detail&&<small>{detail}</small>}</article>;
function BarList({items,value}:{items:Array<{name:string;count:number;value?:number}>;value?:boolean}){const max=Math.max(1,...items.map(i=>value?(i.value??0):i.count));return <div className="bar-list">{items.slice(0,8).map(item=><div key={item.name}><label><span>{item.name}</span><b>{value?money(item.value??0):item.count}</b></label><div><i style={{width:((value?(item.value??0):item.count)/max*100)+'%'}}/></div></div>)}</div>}
function Table({title,rows,onExport}:{title:string;rows:AnalyticsGroup[];onExport:()=>void}){const[sort,setSort]=useState<keyof AnalyticsGroup>('value');const ordered=[...rows].sort((a,b)=>typeof a[sort]==='number'?Number(b[sort])-Number(a[sort]):String(a[sort]).localeCompare(String(b[sort])));return <section className="analytics-panel"><div className="analytics-title"><div><h2>{title}</h2><p>Click a column to sort.</p></div><button className="secondary" onClick={onExport}><Download size={15}/>CSV</button></div><div className="analytics-table"><table><thead><tr>{([['name','Name'],['count','Items'],['cost','Cost'],['value','Value'],['profit','Est. profit']]as Array<[keyof AnalyticsGroup,string]>).map(([key,label])=><th key={key}><button onClick={()=>setSort(key)}>{label}</button></th>)}</tr></thead><tbody>{ordered.map(row=><tr key={row.name}><td>{row.name}</td><td>{row.count}</td><td>{money(row.cost)}</td><td>{money(row.value)}</td><td>{money(row.profit)}</td></tr>)}</tbody></table></div></section>}
function navigateToAction(card:ActionCard){
 sessionStorage.setItem('metro-workflow',JSON.stringify({kind:card.kind,label:card.filterLabel,ids:card.inventoryIds,source:'analytics'}));
 const labels={photos:'Photo Manager',inventory:'Inventory',listings:'Listing Workspace'} as const;
 const button=[...document.querySelectorAll<HTMLButtonElement>('.sidebar nav button')].find(candidate=>candidate.textContent?.includes(labels[card.destination]));
 button?.click();setTimeout(()=>document.querySelector(card.destination==='inventory'?'.inventory-panel':card.destination==='photos'?'.photo-manager':'.listing-workspace')?.scrollIntoView({behavior:'smooth'}),0);
}
export function AnalyticsPage(){
 const[records,setRecords]=useState<AnalyticsRecord[]>([]);
 const[filters,setFilters]=useState<AnalyticsFilters>(()=>{try{return{...defaultAnalyticsFilters,...JSON.parse(sessionStorage.getItem('metro-analytics-filters')??'{}')}}catch{return defaultAnalyticsFilters}});
 const[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{analyticsService.snapshot().then(setRecords).catch(e=>setError(e instanceof Error?e.message:'Analytics could not be loaded.')).finally(()=>setLoading(false))},[]);
 useEffect(()=>sessionStorage.setItem('metro-analytics-filters',JSON.stringify(filters)),[filters]);
 const result=useMemo(()=>analytics(records,filters),[records,filters]);
 const categories=[...new Set(records.map(r=>r.category||'Uncategorized'))].sort(),brands=[...new Set(records.map(r=>r.brand||'Unbranded'))].sort(),storage=[...new Set(records.flatMap(r=>[r.rack&&'Rack '+r.rack,r.shelf&&'Shelf '+r.shelf,r.bin&&'Bin '+r.bin]).filter(Boolean)as string[])].sort();
 const exportGroups=(kind:string,rows:AnalyticsGroup[])=>void analyticsService.exportCsv(kind,toCsv(['Name','Items','Inventory cost','Estimated value','Estimated profit','Sold'],rows.map(r=>[r.name,r.count,r.cost,r.value,r.profit,r.soldCount])));
 if(loading)return <div className="analytics-state"><RefreshCw className="spin"/>Loading analytics…</div>;
 if(error)return <div className="analytics-state error"><AlertTriangle/>{error}</div>;
 return <section className="analytics-page">
  <header><div><p className="eyebrow">SPRINT 4.1</p><h1>Business Analytics</h1><p>Operational insight from persisted inventory, listings, photos, storage, and sales.</p></div><span className="version-pill">v0.4.1-development</span></header>
  <section className="analytics-filters" aria-label="Analytics filters">
   <label>Date<select value={filters.datePreset} onChange={e=>setFilters({...filters,datePreset:e.target.value as AnalyticsFilters['datePreset']})}><option value="today">Today</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="month">This month</option><option value="year">This year</option><option value="all">All time</option></select></label>
   <label>Status<select value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}>{['All','Draft','Active','Sold','Archived'].map(v=><option key={v}>{v}</option>)}</select></label>
   <label>Category<select value={filters.category} onChange={e=>setFilters({...filters,category:e.target.value})}><option>All</option>{categories.map(v=><option key={v}>{v}</option>)}</select></label>
   <label>Brand<select value={filters.brand} onChange={e=>setFilters({...filters,brand:e.target.value})}><option>All</option>{brands.map(v=><option key={v}>{v}</option>)}</select></label>
   <label>Storage<select value={filters.storage} onChange={e=>setFilters({...filters,storage:e.target.value})}><option>All</option>{storage.map(v=><option key={v}>{v}</option>)}</select></label>
   <label>Readiness ≥ {filters.readinessMin}%<input type="range" min="0" max="100" step="10" value={filters.readinessMin} onChange={e=>setFilters({...filters,readinessMin:Number(e.target.value)})}/></label>
   <button className="secondary" onClick={()=>setFilters(defaultAnalyticsFilters)}>Reset Filters</button>
  </section>
  {!result.filteredRecords.length?<div className="analytics-empty"><BarChart3/><h2>No analytics match these filters</h2><p>Reset filters or broaden the date and readiness range.</p></div>:<>
   <section className="analytics-section"><div className="analytics-heading"><h2>Executive Summary</h2><p>Expected value uses listing price; realized revenue requires persisted sale prices.</p></div><div className="analytics-metrics"><Metric value={result.summary.total} label="Total inventory"/><Metric value={result.summary.active} label="Active listings"/><Metric value={result.summary.ready} label="Ready to list"/><Metric value={money(result.summary.cost)} label="Inventory cost"/><Metric value={money(result.summary.value)} label="Estimated value"/><Metric value={money(result.summary.estimatedProfit)} label="Estimated gross profit"/><Metric value={result.summary.sold} label="Sold"/><Metric value={result.sales.revenueMonth.complete?money(result.sales.revenueMonth.value??0):'Incomplete'} label="Revenue this month" detail={result.sales.revenueMonth.reason}/></div></section>
   <section className="analytics-split"><article className="analytics-panel"><h2>Listing Pipeline</h2><BarList items={[{name:'Needs details',count:result.warnings.find(w=>w.kind==='category')?.count??0},{name:'Needs photos',count:result.summary.needsPhoto},{name:'Needs title',count:result.summary.needsTitle},{name:'Needs price',count:result.summary.needsPrice},{name:'In preparation',count:result.summary.draft},{name:'Ready to list',count:result.summary.ready},{name:'Active',count:result.summary.active},{name:'Sold',count:result.summary.sold}]}/></article><article className="analytics-panel"><h2>Productivity</h2><div className="mini-grid"><Metric value={result.productivity.addedToday} label="Added today"/><Metric value={result.productivity.addedWeek} label="Added this week"/><Metric value={result.productivity.listingsToday} label="Listings today"/><Metric value={result.productivity.listingsWeek} label="Listings this week"/><Metric value={result.productivity.photosWeek} label="Photos this week"/><Metric value={result.productivity.averageReadiness.toFixed(0)+'%'} label="Average readiness"/></div><h3>Weekly activity</h3><BarList items={result.weeklyActivity.map(d=>({name:d.label,count:d.added+d.listed+d.photos}))}/></article></section>
   <section className="analytics-panel"><div className="analytics-title"><div><h2>Inventory Aging</h2><p>Unsold item age uses purchase date, then created date.</p></div><button className="secondary" onClick={()=>exportGroups('aging',result.aging)}><Download size={15}/>CSV</button></div><div className="aging-grid">{result.aging.map(b=><article key={b.key}><strong>{b.count}</strong><span>{b.name}</span><small>{money(b.cost)} cost · {money(b.value)} value</small></article>)}</div></section>
   <Table title="Category Performance" rows={result.categories} onExport={()=>exportGroups('category',result.categories)}/>
   <Table title="Brand Performance" rows={result.brands} onExport={()=>exportGroups('brand',result.brands)}/>
   <section className="analytics-panel"><h2>Storage Overview</h2><p>Item counts only; no storage capacity model exists.</p><div className="storage-summary"><Metric value={result.storage.unassigned} label="Unassigned items"/><div><h3>Most-used locations</h3><BarList items={result.storage.mostUsed}/></div></div></section>
   <ActionCenter records={result.filteredRecords} onNavigate={navigateToAction}/>
  </>}
 </section>;
}
