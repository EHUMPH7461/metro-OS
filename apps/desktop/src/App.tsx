import { useState } from 'react'
import Sidebar from './components/Sidebar'
import CommandCenter from './pages/CommandCenter'
import './App.css'

type Page = 'dashboard' | 'inventory' | 'listings' | 'analytics'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 overflow-auto">
        {currentPage === 'dashboard' && <CommandCenter />}
        {currentPage === 'inventory' && <div className="p-8"><h1 className="text-3xl font-bold">Inventory Management</h1></div>}
        {currentPage === 'listings' && <div className="p-8"><h1 className="text-3xl font-bold">Listings</h1></div>}
        {currentPage === 'analytics' && <div className="p-8"><h1 className="text-3xl font-bold">Analytics</h1></div>}
      </main>
    </div>
  )
}

export default App