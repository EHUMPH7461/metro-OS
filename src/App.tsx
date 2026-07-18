import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Boxes, DollarSign, Home, ListChecks, PackagePlus, Search, ShoppingCart, Sparkles, Trash2 } from 'lucide-react';
import type { InventoryInput, InventoryItem } from './types/inventory';

const seed: InventoryItem[] = [
  { id: 1, sku: 'MRR-1001', title: "Levi's 501 Straight Leg Jeans", category: 'Jeans', brand: "Levi's", size: '36x32', quantity: 1, cost: 12, listPrice: 39.99, status: 'Active', createdAt: new Date().toISOString() },
  { id: 2, sku: 'MRR-1002', title: 'Nike Air Max Running Shoes', category: 'Shoes', brand: 'Nike', size: '11', quantity: 1, cost: 18, listPrice: 64.99, status: 'Draft', createdAt: new Date().toISOString() }
];

const blank: InventoryInput = { sku: '', title: '', category: 'Jeans', brand: '', size: '', quantity: 1, cost: 0, listPrice: 0, status: 'Draft' };

export default function App() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<InventoryInput>(blank);
  const [showForm, setShowForm] = useState(false);

  const refresh = async () => {
    const rows = window.metro ? await window.metro.inventory.list() : seed;
    setItems(rows);
  };
  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => items.filter((item) =>
    [item.sku, item.title, item.brand, item.category].join(' ').toLowerCase().includes(query.toLowerCase())), [items, query]);

  const value = items.reduce((sum, item) => sum + item.listPrice * item.quantity, 0);
  const profit = items.reduce((sum, item) => sum + (item.listPrice - item.cost) * item.quantity, 0);

  const save = async () => {
    if (!form.sku.trim() || !form.title.trim()) return;
    if (window.metro) await window.metro.inventory.create(form);
    else setItems((current) => [{ ...form, id: Date.now(), createdAt: new Date().toISOString() }, ...current]);
    setForm(blank); setShowForm(false); await refresh();
  };

  const remove = async (id: number) => {
    if (window.metro) await window.metro.inventory.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">M</div><div><strong>Metro OS</strong><span>Refined Racks</span></div></div>
      <nav>
        <a className="active"><Home size={18}/>Dashboard</a><a><Boxes size={18}/>Inventory</a><a><ListChecks size={18}/>Listings</a>
        <a><ShoppingCart size={18}/>Orders</a><a><DollarSign size={18}/>Financials</a><a><BarChart3 size={18}/>Reports</a><a><Sparkles size={18}/>AI Assistant</a>
      </nav>
      <div className="sidebar-foot">Sprint 1 · Desktop Foundation</div>
    </aside>
    <main>
      <header><div><p className="eyebrow">METRO REFINED RACKS</p><h1>Business Dashboard</h1><p>Manage inventory, listings, and profit from one workspace.</p></div>
        <button className="primary" onClick={() => setShowForm(true)}><PackagePlus size={18}/>Add Inventory</button></header>
      <section className="stats">
        <article><span>Total Units</span><strong>{items.reduce((s,i)=>s+i.quantity,0)}</strong><small>Across {items.length} SKUs</small></article>
        <article><span>Inventory Value</span><strong>${value.toFixed(2)}</strong><small>Current listing value</small></article>
        <article><span>Potential Profit</span><strong>${profit.toFixed(2)}</strong><small>Before fees and shipping</small></article>
        <article><span>Active Listings</span><strong>{items.filter(i=>i.status==='Active').length}</strong><small>Ready for buyers</small></article>
      </section>
      <section className="panel">
        <div className="panel-head"><div><h2>Inventory</h2><p>Track every item from sourcing to sale.</p></div><label className="search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search SKU, title, or brand"/></label></div>
        <div className="table-wrap"><table><thead><tr><th>SKU</th><th>Item</th><th>Category</th><th>Size</th><th>Qty</th><th>Cost</th><th>List Price</th><th>Status</th><th></th></tr></thead>
          <tbody>{filtered.map(item=><tr key={item.id}><td className="mono">{item.sku}</td><td><b>{item.title}</b><span>{item.brand}</span></td><td>{item.category}</td><td>{item.size}</td><td>{item.quantity}</td><td>${item.cost.toFixed(2)}</td><td>${item.listPrice.toFixed(2)}</td><td><em className={item.status.toLowerCase()}>{item.status}</em></td><td><button className="icon" onClick={()=>void remove(item.id)} aria-label="Delete"><Trash2 size={16}/></button></td></tr>)}</tbody></table></div>
      </section>
    </main>
    {showForm && <div className="modal-backdrop"><div className="modal"><div><h2>Add inventory item</h2><p>Create a new SKU for Metro Refined Racks.</p></div>
      <div className="form-grid">{(['sku','title','brand','category','size'] as const).map(key=><label key={key}>{key}<input value={String(form[key])} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>)}
      {(['quantity','cost','listPrice'] as const).map(key=><label key={key}>{key}<input type="number" value={form[key]} onChange={e=>setForm({...form,[key]:Number(e.target.value)})}/></label>)}
      <label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Draft</option><option>Active</option><option>Sold</option></select></label></div>
      <div className="modal-actions"><button onClick={()=>setShowForm(false)}>Cancel</button><button className="primary" onClick={()=>void save()}>Save Item</button></div></div></div>}
  </div>;
}
