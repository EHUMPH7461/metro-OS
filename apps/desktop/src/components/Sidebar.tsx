import { BarChart3, Package, ShoppingCart, Home, Settings } from 'lucide-react'
import clsx from 'clsx'

type Page = 'dashboard' | 'inventory' | 'listings' | 'analytics'

interface SidebarProps {
  currentPage: Page
  onPageChange: (page: Page) => void
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Command Center', icon: Home },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'listings', label: 'Listings', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ] as const

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen shadow-lg">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Metro OS</h1>
        <p className="text-sm text-gray-400 mt-1">Resale Intelligence</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onPageChange(id)}
            className={clsx(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              currentPage === id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            )}
          >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  )
}