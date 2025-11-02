import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Plus, Edit, Trash2, ArrowLeft, Save, X } from 'lucide-react'

interface Product {
  id: number
  name: string
  url: string | null
  founder_id: number
  description: string | null
  category_id: number
  date_added: string
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [founders, setFounders] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    founder_id: '',
    description: '',
    category_id: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [productsRes, foundersRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').order('date_added', { ascending: false }),
        supabase.from('founders').select('*'),
        supabase.from('categories').select('*')
      ])

      if (productsRes.data) setProducts(productsRes.data)
      if (foundersRes.data) setFounders(foundersRes.data)
      if (categoriesRes.data) setCategories(categoriesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    try {
      const { error } = await supabase.from('products').insert({
        name: formData.name,
        url: formData.url || null,
        founder_id: parseInt(formData.founder_id),
        description: formData.description || null,
        category_id: parseInt(formData.category_id),
        date_added: new Date().toISOString()
      })

      if (error) throw error

      setShowAddForm(false)
      setFormData({ name: '', url: '', founder_id: '', description: '', category_id: '' })
      fetchData()
      alert('Product added successfully!')
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Failed to add product')
    }
  }

  async function handleUpdate(id: number) {
    try {
      const product = products.find(p => p.id === id)
      if (!product) return

      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          url: product.url,
          founder_id: product.founder_id,
          description: product.description,
          category_id: product.category_id
        })
        .eq('id', id)

      if (error) throw error

      setEditingId(null)
      alert('Product updated successfully!')
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Failed to update product')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase.from('products').delete().eq('id', id)

      if (error) throw error

      fetchData()
      alert('Product deleted successfully!')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  function updateProduct(id: number, field: string, value: any) {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft size={20} />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <input
                type="url"
                placeholder="Product URL"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <select
                value={formData.founder_id}
                onChange={(e) => setFormData({ ...formData, founder_id: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Founder</option>
                {founders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 md:col-span-2"
                rows={2}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Save size={18} />
                Save
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Founder</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {editingId === product.id ? (
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{product.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {founders.find(f => f.id === product.founder_id)?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {categories.find(c => c.id === product.category_id)?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {product.url && (
                        <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                          Visit
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingId === product.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUpdate(product.id)}
                            className="p-1 text-green-600 hover:text-green-700"
                            title="Save"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-gray-600 hover:text-gray-700"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingId(product.id)}
                            className="p-1 text-blue-600 hover:text-blue-700"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1 text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
