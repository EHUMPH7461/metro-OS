import { DollarSign, Package, TrendingUp, ShoppingCart } from 'lucide-react'
import MetricCard from '../components/MetricCard'

export default function CommandCenter() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Command Center</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your business overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Today's Revenue"
          value="$1,245"
          icon={<DollarSign size={32} />}
          trend={{ value: 12, direction: 'up' }}
        />
        <MetricCard
          title="Inventory Items"
          value="342"
          icon={<Package size={32} />}
          trend={{ value: 5, direction: 'down' }}
        />
        <MetricCard
          title="Active Listings"
          value="128"
          icon={<ShoppingCart size={32} />}
          trend={{ value: 8, direction: 'up' }}
        />
        <MetricCard
          title="Profit Margin"
          value="42%"
          icon={<TrendingUp size={32} />}
          trend={{ value: 2, direction: 'up' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-900">Item #{i} sold</p>
                <p className="text-xs text-gray-600 mt-1">2 hours ago</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <input type="checkbox" className="w-5 h-5" />
              <p className="text-sm text-gray-900">Publish 5 new listings</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <input type="checkbox" className="w-5 h-5" />
              <p className="text-sm text-gray-900">Update slow-moving inventory</p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <input type="checkbox" className="w-5 h-5" />
              <p className="text-sm text-gray-900">Review order fulfillment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}