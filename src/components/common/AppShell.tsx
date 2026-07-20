import type { ReactNode } from 'react';
import { BarChart3, Boxes, DollarSign, Home, ListChecks, ShoppingCart, Sparkles } from 'lucide-react';

export function Sidebar() { return <aside className="sidebar"><div className="brand"><div className="brand-mark">M</div><div><strong>Metro Command Center</strong><span>Metro Refined Racks</span></div></div><nav><a className="active"><Home size={18}/>Dashboard</a><a><Boxes size={18}/>Inventory</a><a><ListChecks size={18}/>Listings</a><a><ShoppingCart size={18}/>Orders</a><a><DollarSign size={18}/>Financials</a><a><BarChart3 size={18}/>Reports</a><a><Sparkles size={18}/>AI Assistant</a></nav><div className="sidebar-foot">Sprint 1 · Inventory Operations</div></aside>; }
export function AppShell({ children }: { children: ReactNode }) { return <div className="app-shell"><Sidebar/><main>{children}</main></div>; }
