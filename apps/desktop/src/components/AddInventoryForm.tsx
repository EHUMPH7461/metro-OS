import { FormEvent, useState } from 'react'

interface FormData {
  sku: string
  brand: string
  category: string
  size: string
  color: string
  condition: string
  purchasePrice: string
}

interface AddInventoryFormProps {
  onSubmit: (data: FormData) => void
}

export default function AddInventoryForm({ onSubmit }: AddInventoryFormProps) {
  const [formData, setFormData] = useState<FormData>({
    sku: '',
    brand: '',
    category: '',
    size: '',
    color: '',
    condition: 'good',
    purchasePrice: '',
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      sku: '',
      brand: '',
      category: '',
      size: '',
      color: '',
      condition: 'good',
      purchasePrice: '',
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">Add New Item</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="sku"
          placeholder="SKU"
          value={formData.sku}
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          name="brand"
          placeholder="Brand"
          value={formData.brand}
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          name="size"
          placeholder="Size"
          value={formData.size}
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          name="color"
          placeholder="Color"
          value={formData.color}
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <select
          name="condition"
          value={formData.condition}
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="new">New</option>
          <option value="like_new">Like New</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
        </select>
        <input
          type="number"
          name="purchasePrice"
          placeholder="Purchase Price"
          value={formData.purchasePrice}
          onChange={handleChange}
          step="0.01"
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Add Item
      </button>
    </form>
  )
}