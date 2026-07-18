interface InventoryItem {
  id: string
  sku: string
  brand: string
  category: string
  size: string
  color: string
  condition: string
  status: string
}

interface InventoryTableProps {
  items: InventoryItem[]
}

export default function InventoryTable({ items }: InventoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">SKU</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Brand</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Size</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Color</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Condition</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">{item.sku}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{item.brand}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{item.category}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{item.size}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{item.color}</td>
              <td className="px-4 py-3 text-sm text-gray-900">{item.condition}</td>
              <td className="px-4 py-3 text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.status === 'listed'
                    ? 'bg-green-100 text-green-800'
                    : item.status === 'sold'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}