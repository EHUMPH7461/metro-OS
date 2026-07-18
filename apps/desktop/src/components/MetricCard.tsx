import { ReactNode } from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: { value: number; direction: 'up' | 'down' }
}

export default function MetricCard({ title, value, icon, trend }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}% vs last week
            </p>
          )}
        </div>
        <div className="text-gray-400">
          {icon}
        </div>
      </div>
    </div>
  )
}