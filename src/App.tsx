import { useEffect, useMemo, useState } from 'react';
import { PackagePlus } from 'lucide-react';
import type { InventoryInput, InventoryItem } from '../shared/inventory';
import { AppShell } from './components/common/AppShell';
import { ErrorBanner } from './components/common/ErrorBanner';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { InventoryPage } from './features/inventory/InventoryPage';
import { InventoryModal } from './features/inventory/InventoryModal';
import { calculateItemFinancials } from './domain/inventory';
import { inventoryService, readableError } from './services/inventoryService';

const today=()=>new Date().toISOString().slice(0,10);
const blank=():InventoryInput=>({sku:'',title:'',brand:'',category:'',gender:'',size:'',color:'',condition:'',purchasePrice:0,listPrice:0,shippingCost:0,ebayFees:0,quantity:1,bin:'',rack:'',shelf:'',drawer:'',supplier:'',purchaseDate:today(),listingDate:'',soldDate:'',ebayItemId:'',status:'Draft',notes:''});
const editableInput=({id:_id,profit:_profit,roi:_roi,createdAt:_createdAt,updatedAt:_updatedAt,...input}:InventoryItem):InventoryInput=>input;
const fallback:InventoryItem[]=[{...blank(),id:1,sku:'MRR-2026-000001',title:"Levi's 501 Jeans",brand:"Levi's",category:'Jeans',size:'36x32',color:'Blue',condition:'Excellent',purchasePrice:12,listPrice:39.99,shippingCost:7,ebayFees:5.2,profit:15.79,roi:131.58,quantity:1,bin:'B-12',rack:'R1',status:'Active',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}];
type SortKey=keyof InventoryItem;

export default function App(){const[items,setItems]=useState<InventoryItem[]>([]);const[query,setQuery]=useState('');const[status,setStatus]=useState('All');const[form,setForm]=useState<InventoryInput>(blank());const[showForm,setShowForm]=useState(false);const[editing,setEditing]=useState<InventoryItem|null>(null);const[error,setError]=useState('');const[saving,setSaving]=useState(false);const[sort,setSort]=useState<{key:SortKey;direction:1|-1}>({key:'updatedAt',direction:-1});
const refresh=async()=>{try{setItems(window.metro?await inventoryService.list():fallback);setError('');}catch(e){setError(readableError(e));}};useEffect(()=>{void refresh();},[]);
const filtered=useMemo(()=>{const needle=query.trim().toLowerCase();return items.filter(item=>{const text=[item.sku,item.title,item.brand,item.category,item.color,item.condition,item.bin,item.rack,item.shelf,item.drawer,item.supplier,item.ebayItemId,item.notes].join(' ').toLowerCase();return(!needle||text.includes(needle))&&(status==='All'||item.status===status);}).sort((a,b)=>String(a[sort.key]??'').localeCompare(String(b[sort.key]??''),undefined,{numeric:true})*sort.direction);},[items,query,status,sort]);
const changeSort=(key:SortKey)=>setSort(current=>({key,direction:current.key===key?(current.direction===1?-1:1):1}));
const save=async()=>{if(!form.title.trim())return;setSaving(true);try{if(window.metro)await inventoryService.create(form);else{const f=calculateItemFinancials(form);setItems(current=>[{...form,id:Date.now(),sku:`MRR-${new Date().getFullYear()}-${String(current.length+1).padStart(6,'0')}`,profit:f.netProfit,roi:f.roi,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},...current]);}setForm(blank());setShowForm(false);if(window.metro)await refresh();setError('');}catch(e){setError(readableError(e));}finally{setSaving(false);}};
const saveEdit=async()=>{if(!editing)return;try{if(window.metro)await inventoryService.update(editing.id,editableInput(editing));else{const f=calculateItemFinancials(editing);setItems(current=>current.map(i=>i.id===editing.id?{...editing,profit:f.netProfit,roi:f.roi,updatedAt:new Date().toISOString()}:i));}if(window.metro)await refresh();setEditing(null);setError('');}catch(e){setError(readableError(e));}};
const remove=async(id:number)=>{try{if(window.metro)await inventoryService.delete(id);setItems(current=>current.filter(i=>i.id!==id));setError('');}catch(e){setError(readableError(e));}};
return <AppShell><header><div><p className="eyebrow">METRO REFINED RACKS</p><h1>Command Center</h1><p>Inventory health, activity, and profit at a glance.</p></div><button className="primary" onClick={()=>setShowForm(true)}><PackagePlus size={18}/>Add Inventory</button></header>{error&&<ErrorBanner message={error} onDismiss={()=>setError('')} onRetry={()=>void refresh()}/>}<DashboardPage items={items} onAdd={()=>setShowForm(true)} onStatus={setStatus} onAll={()=>{setStatus('All');setQuery('');}}/><InventoryPage items={filtered} query={query} status={status} editing={editing} sort={sort} onQuery={setQuery} onStatus={setStatus} onSort={changeSort} onEdit={item=>setEditing({...item})} onCancel={()=>setEditing(null)} onSave={()=>void saveEdit()} onDelete={id=>void remove(id)} onChange={setEditing}/>{showForm&&<InventoryModal form={form} onChange={setForm} onClose={()=>setShowForm(false)} onSave={()=>void save()} saving={saving}/>}</AppShell>;}
