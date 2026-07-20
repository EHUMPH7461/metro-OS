import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowUpDown, BarChart3, Boxes, CircleDollarSign, DollarSign, Home, ListChecks, PackagePlus, Pencil, Search, ShoppingCart, Sparkles, Trash2, X } from 'lucide-react';
import { calculateItemFinancials, dashboardMetrics } from './inventory';
import type { InventoryInput, InventoryItem, InventoryStatus } from './types/inventory';

const today = () => new Date().toISOString().slice(0, 10);
const blank = (): InventoryInput => ({ sku: '', title: '', brand: '', category: '', gender: '', size: '', color: '', condition: '',
  purchasePrice: 0, listPrice: 0, shippingCost: 0, ebayFees: 0, quantity: 1, bin: '', rack: '', shelf: '', drawer: '',
  supplier: '', purchaseDate: today(), listingDate: '', soldDate: '', ebayItemId: '', status: 'Draft', notes: '' });

const fallback: InventoryItem[] = [
  { ...blank(), id: 1, sku: 'MRR-2026-000001', title: "Levi's 501 Jeans", brand: "Levi's", category: 'Jeans', size: '36x32', color: 'Blue', condition: 'Excellent', purchasePrice: 12, listPrice: 39.99, shippingCost: 7, ebayFees: 5.2, profit: 15.79, roi: 131.58, quantity: 1, bin: 'B-12', rack: 'R1', status: 'Active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const inputKeys: Array<{ key: keyof InventoryInput; label: string; type?: string }> = [
  { key: 'title', label: 'Title' }, { key: 'brand', label: 'Brand' }, { key: 'category', label: 'Category' },
  { key: 'gender', label: 'Gender' }, { key: 'size', label: 'Size' }, { key: 'color', label: 'Color' },
  { key: 'condition', label: 'Condition' }, { key: 'quantity', label: 'Quantity', type: 'number' },
  { key: 'purchasePrice', label: 'Purchase price', type: 'number' }, { key: 'listPrice', label: 'List price', type: 'number' },
  { key: 'shippingCost', label: 'Shipping cost', type: 'number' }, { key: 'ebayFees', label: 'eBay fees', type: 'number' },
  { key: 'bin', label: 'Bin' }, { key: 'rack', label: 'Rack' }, { key: 'shelf', label: 'Shelf' }, { key: 'drawer', label: 'Drawer' },
  { key: 'supplier', label: 'Supplier' }, { key: 'purchaseDate', label: 'Purchase date', type: 'date' },
  { key: 'listingDate', label: 'Listing date', type: 'date' }, { key: 'soldDate', label: 'Sold date', type: 'date' },
  { key: 'ebayItemId', label: 'eBay item ID' }
];

type SortKey = keyof InventoryItem;

export default function App() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [form, setForm] = useState<InventoryInput>(blank());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; direction: 1 | -1 }>({ key: 'updatedAt', direction: -1 });

  const refresh = async () => setItems(window.metro ? await window.metro.inventory.list() : fallback);
  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const searchable = [item.sku, item.title, item.brand, item.category, item.color, item.condition, item.bin, item.rack, item.shelf, item.drawer, item.supplier, item.ebayItemId, item.notes].join(' ').toLowerCase();
      return (!needle || searchable.includes(needle)) && (statusFilter === 'All' || item.status === statusFilter);
    }).sort((a, b) => String(a[sort.key] ?? '').localeCompare(String(b[sort.key] ?? ''), undefined, { numeric: true }) * sort.direction);
  }, [items, query, statusFilter, sort]);

  const metrics = useMemo(() => dashboardMetrics(items), [items]);
  const finances = calculateItemFinancials(form);
  const editFinances = editing ? calculateItemFinancials(editing) : null;
  const changeSort = (key: SortKey) => setSort((current) => ({ key, direction: current.key === key ? (current.direction === 1 ? -1 : 1) : 1 }));

  const save = async () => {
    if (!form.title.trim()) return;
    if (window.metro) await window.metro.inventory.create(form);
    else setItems((current) => [{ ...form, id: Date.now(), sku: `MRR-${new Date().getFullYear()}-${String(current.length + 1).padStart(6, '0')}`, profit: finances.netProfit, roi: finances.roi, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...current]);
    setForm(blank()); setShowForm(false); if (window.metro) await refresh();
  };

  const saveEdit = async () => {
    if (!editing) return;
    const input: InventoryInput = { ...editing };
    if (window.metro) await window.metro.inventory.update(editing.id, input);
    else setItems((current) => current.map((item) => item.id === editing.id ? { ...editing, profit: editFinances?.netProfit ?? 0, roi: editFinances?.roi ?? 0, updatedAt: new Date().toISOString() } : item));
    setEditing(null); if (window.metro) await refresh();
  };

  const remove = async (id: number) => {
    if (window.metro) await window.metro.inventory.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const cards = [
    ['Total Inventory', metrics.totalInventory, 'Units on hand'], ['Active Listings', metrics.activeListings, 'Live listings'],
    ['Sold Today', metrics.soldToday, 'Completed today'], ['Sold This Week', metrics.soldThisWeek, 'Last seven days'],
    ['Inventory Cost', money(metrics.inventoryCost), 'Capital invested'], ['Inventory Value', money(metrics.inventoryValue), 'Expected revenue'],
    ['Estimated Profit', money(metrics.estimatedProfit), 'After shipping and fees']
  ];

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark">M</div><div><strong>Metro Command Center</strong><span>Metro Refined Racks</span></div></div>
      <nav><a className="active"><Home size={18}/>Dashboard</a><a><Boxes size={18}/>Inventory</a><a><ListChecks size={18}/>Listings</a><a><ShoppingCart size={18}/>Orders</a><a><DollarSign size={18}/>Financials</a><a><BarChart3 size={18}/>Reports</a><a><Sparkles size={18}/>AI Assistant</a></nav>
      <div className="sidebar-foot">Sprint 1 · Inventory Operations</div></aside>
    <main><header><div><p className="eyebrow">METRO REFINED RACKS</p><h1>Command Center</h1><p>Inventory health, activity, and profit at a glance.</p></div><button className="primary" onClick={() => setShowForm(true)}><PackagePlus size={18}/>Add Inventory</button></header>
      <section className="stats">{cards.map(([label, value, detail]) => <article key={String(label)}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>)}</section>
      <section className="dashboard-row"><article className="panel activity-panel"><div className="section-title"><Activity size={18}/><div><h2>Recent Activity</h2><p>Latest inventory updates</p></div></div>
        <div className="activity-list">{items.slice().sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,5).map(item=><div key={item.id}><span className={`dot ${item.status.toLowerCase()}`}/><div><b>{item.title}</b><small>{item.sku} · {item.status} · {item.bin || item.rack || 'Unassigned storage'}</small></div><time>{new Date(item.updatedAt).toLocaleDateString()}</time></div>)}</div></article>
        <article className="panel quick-panel"><div className="section-title"><Sparkles size={18}/><div><h2>Quick Actions</h2><p>Common inventory workflows</p></div></div><div className="quick-grid"><button onClick={()=>setShowForm(true)}><PackagePlus/>Add inventory</button><button onClick={()=>setStatusFilter('Draft')}><ListChecks/>Review drafts</button><button onClick={()=>setStatusFilter('Sold')}><CircleDollarSign/>Review sales</button><button onClick={()=>{setStatusFilter('All');setQuery('')}}><Boxes/>View all stock</button></div></article></section>
      <section className="panel inventory-panel"><div className="panel-head"><div><h2>Inventory Workspace</h2><p>Search storage locations, filter status, sort columns, and edit records inline.</p></div><div className="inventory-tools"><label className="search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search item, SKU, bin, rack, shelf…"/></label><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>All</option><option>Draft</option><option>Active</option><option>Sold</option><option>Archived</option></select></div></div>
        <div className="table-wrap"><table><thead><tr>{([['sku','SKU'],['title','Item'],['status','Status'],['quantity','Qty'],['purchasePrice','Purchase'],['listPrice','List'],['profit','Net Profit'],['roi','ROI'],['bin','Bin'],['rack','Rack'],['shelf','Shelf'],['drawer','Drawer']] as Array<[SortKey,string]>).map(([key,label])=><th key={key}><button onClick={()=>changeSort(key)}>{label}<ArrowUpDown size={12}/></button></th>)}<th>Actions</th></tr></thead>
          <tbody>{filtered.map(item=>{const isEditing=editing?.id===item.id; return <tr key={item.id}>{isEditing && editing ? <>
            <td><input className="cell-input sku" value={editing.sku} onChange={e=>setEditing({...editing,sku:e.target.value})}/></td><td><div className="stacked-inputs"><input className="cell-input" value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})}/><input className="cell-input muted" value={editing.brand} onChange={e=>setEditing({...editing,brand:e.target.value})}/></div></td>
            <td><select className="cell-input" value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value as InventoryStatus})}><option>Draft</option><option>Active</option><option>Sold</option><option>Archived</option></select></td>
            {(['quantity','purchasePrice','listPrice'] as const).map(key=><td key={key}><input className="cell-input number" type="number" value={editing[key]} onChange={e=>setEditing({...editing,[key]:Number(e.target.value)})}/></td>)}
            <td>{money(editFinances?.netProfit ?? 0)}</td><td>{(editFinances?.roi ?? 0).toFixed(1)}%</td>
            {(['bin','rack','shelf','drawer'] as const).map(key=><td key={key}><input className="cell-input storage" value={editing[key]} onChange={e=>setEditing({...editing,[key]:e.target.value})}/></td>)}
            <td><div className="row-actions"><button className="save" onClick={()=>void saveEdit()}>Save</button><button className="icon" onClick={()=>setEditing(null)} aria-label="Cancel"><X size={16}/></button></div></td></> : <>
            <td className="mono">{item.sku}</td><td><b>{item.title}</b><span>{item.brand} · {item.category} · {item.size}</span></td><td><em className={item.status.toLowerCase()}>{item.status}</em></td><td>{item.quantity}</td><td>{money(item.purchasePrice)}</td><td>{money(item.listPrice)}</td><td className={item.profit>=0?'positive':'negative'}>{money(item.profit)}</td><td>{item.roi.toFixed(1)}%</td><td>{item.bin||'—'}</td><td>{item.rack||'—'}</td><td>{item.shelf||'—'}</td><td>{item.drawer||'—'}</td><td><div className="row-actions"><button className="icon" onClick={()=>setEditing({...item})} aria-label="Edit"><Pencil size={16}/></button><button className="icon danger" onClick={()=>void remove(item.id)} aria-label="Delete"><Trash2 size={16}/></button></div></td></>}</tr>})}</tbody></table></div>
      </section></main>
    {showForm && <div className="modal-backdrop"><div className="modal"><div className="modal-title"><div><h2>Add inventory item</h2><p>SKU is generated automatically if left blank.</p></div><button className="icon" onClick={()=>setShowForm(false)}><X/></button></div>
      <div className="form-grid"><label>SKU<input value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} placeholder={`MRR-${new Date().getFullYear()}-000001 (auto)`}/></label>{inputKeys.map(({key,label,type})=><label key={key}>{label}<input type={type??'text'} step={type==='number'?'0.01':undefined} value={String(form[key])} onChange={e=>setForm({...form,[key]:type==='number'?Number(e.target.value):e.target.value})}/></label>)}
        <label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value as InventoryStatus})}><option>Draft</option><option>Active</option><option>Sold</option><option>Archived</option></select></label><label className="wide">Notes<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label></div>
      <div className="profit-preview"><div><span>Gross Profit</span><strong>{money(finances.grossProfit)}</strong></div><div><span>Net Profit</span><strong>{money(finances.netProfit)}</strong></div><div><span>ROI</span><strong>{finances.roi.toFixed(1)}%</strong></div></div>
      <div className="modal-actions"><button onClick={()=>setShowForm(false)}>Cancel</button><button className="primary" onClick={()=>void save()}>Save Item</button></div></div></div>}
  </div>;
}
