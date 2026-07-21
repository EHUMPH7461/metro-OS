import{useMemo,useState}from'react';
import{AlertTriangle,CheckCircle2,Download,HeartPulse}from'lucide-react';
import type{AnalyticsRecord}from'../../../shared/analytics';
import{actionReportCsv,buildActionCards,inventoryHealth,sortActionCards,type ActionCard,type ActionSort}from'../../domain/actionCenter';
import{analyticsService}from'../../services/analyticsService';

const money=(value:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value);
export type ActionNavigate=(card:ActionCard)=>void;
export function ActionCenter({records,onNavigate}:{records:AnalyticsRecord[];onNavigate:ActionNavigate}){
 const[sort,setSort]=useState<ActionSort>(()=>(sessionStorage.getItem('metro-action-sort')as ActionSort)||'priority');
 const cards=useMemo(()=>sortActionCards(buildActionCards(records),sort),[records,sort]);
 const health=useMemo(()=>inventoryHealth(records,cards),[records,cards]);
 const open=cards.reduce((n,c)=>n+c.count,0);
 const top=cards.find(c=>c.count>0);
 const waiting=cards.filter(c=>['photos','price','readiness','stale'].includes(c.kind)&&c.impact.value!==null);
 const uniqueWaiting=new Set(waiting.flatMap(c=>c.inventoryIds));
 const waitingValue=records.filter(r=>uniqueWaiting.has(r.id)&&r.listPrice>0).reduce((n,r)=>n+r.listPrice,0);
 const changeSort=(value:ActionSort)=>{setSort(value);sessionStorage.setItem('metro-action-sort',value)};
 const exportReport=()=>void analyticsService.exportCsv('actions',actionReportCsv(cards,records));
 return <section className="analytics-panel action-center" aria-labelledby="action-center-title">
  <div className="analytics-title action-title"><div><p className="eyebrow">WORKFLOW HUB</p><h2 id="action-center-title">Data Quality &amp; Action Center</h2><p>Prioritized, real-data checks that open directly into a repair queue.</p></div><div className="action-tools"><label>Sort<select aria-label="Sort action cards" value={sort} onChange={e=>changeSort(e.target.value as ActionSort)}><option value="priority">Priority</option><option value="category">Category</option><option value="count">Count</option></select></label><button className="secondary" onClick={exportReport} disabled={!open}><Download size={15}/>Export action report</button></div></div>
  <div className="action-summary">
   <article className="health-score"><HeartPulse/><div><span>Inventory Health</span><strong>{health.score===null?'—':health.score}</strong><b>{health.label}</b></div><div className="health-track" role="progressbar" aria-label="Inventory Health score" aria-valuemin={0} aria-valuemax={100} aria-valuenow={health.score??0}><i style={{width:(health.score??0)+'%'}}/></div><small title="Weighted completeness across photos, storage, cost, pricing, category, brand, title validity, readiness, and freshness.">{health.recommendation}</small></article>
   <article><span>Total open issues</span><strong>{open}</strong><small>Issue instances</small></article>
   <article><span>Records requiring attention</span><strong>{health.affectedRecords}</strong><small>Unique inventory records</small></article>
   <article><span>Estimated value waiting</span><strong>{uniqueWaiting.size?money(waitingValue):'—'}</strong><small>{uniqueWaiting.size?'Qualified persisted prices':'Insufficient data'}</small></article>
   <article><span>Highest priority</span><strong className="summary-text">{top?.label??'None'}</strong><small>{top?top.count+' affected':'All tracked checks complete'}</small></article>
  </div>
  <div className="warning-grid action-grid">{cards.map(card=><button key={card.kind} className={'action-card '+card.severity} onClick={()=>onNavigate(card)} aria-label={card.label+': '+card.count+' affected. '+(card.count?'Review items':'Complete')}>
   <span className="action-status">{card.count?<AlertTriangle/>:<CheckCircle2/>}{card.severity}</span><strong className="action-count">{card.count}</strong><span className="action-label">{card.label}</span>
   <small>{card.impact.total===0?'No affected records':card.impact.qualified===card.impact.total&&card.impact.value!==null?'Est. value '+money(card.impact.value):card.impact.qualified?'Est. value '+money(card.impact.value??0)+' · '+card.impact.qualified+'/'+card.impact.total+' qualified':'Insufficient financial data'}</small>
   <b className="fix-label">{card.count?'Fix now':'Complete'}</b>
  </button>)}</div>
  <p className="action-note">Health is a deterministic weighted completeness score. Estimates exclude records without persisted prices and costs.</p>
 </section>
}
