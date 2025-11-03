import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase, RevenueData } from '../../lib/supabase'
import { Plus, Edit, Trash2, ArrowLeft, Save, X, DollarSign, Star } from 'lucide-react'
import { generateSlug, ensureUniqueSlug } from '../../lib/utils'

interface Product {
  id: number
  name: string
  url: string | null
  founder_id: number
  description: string | null
  category_id: number
  date_added: string
  slug: string | null
  is_featured: boolean
  featured_order: number | null
}

interface ProductWithRevenue extends Product {
  revenue?: RevenueData | null
}

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductWithRevenue[]>([])
  const [founders, setFounders] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingRevenueId, setEditingRevenueId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    founder_id: '',
    description: '',
    category_id: '',
    slug: '',
    is_featured: false,
    featured_order: null as number | null
  })
  const [revenueFormData, setRevenueFormData] = useState({
    mrr: '',
    arr: '',
    source_url: '',
    verification_tier_id: 1
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

      if (productsRes.error) throw productsRes.error
      if (foundersRes.error) throw foundersRes.error
      if (categoriesRes.error) throw categoriesRes.error

      const productsData = productsRes.data || []
      const productIds = productsData.map(p => p.id)

      // Fetch revenue data for all products
      const { data: revenueData, error: revenueError } = await supabase
        .from('revenue_data')
        .select('*')
        .in('product_id', productIds)

      if (revenueError) throw revenueError

      // Group revenue data by product_id and get the latest
      const revenueByProduct: Record<number, RevenueData> = {}
      if (revenueData) {
        revenueData.forEach((rev: RevenueData) => {
          if (!revenueByProduct[rev.product_id] || 
              new Date(rev.date_reported) > new Date(revenueByProduct[rev.product_id].date_reported)) {
            revenueByProduct[rev.product_id] = rev
          }
        })
      }

      // Combine products with their revenue data
      const productsWithRevenue: ProductWithRevenue[] = productsData.map(product => ({
        ...product,
        revenue: revenueByProduct[product.id] || null
      }))

      setProducts(productsWithRevenue)
      if (foundersRes.data) setFounders(foundersRes.data)
      if (categoriesRes.data) setCategories(categoriesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    try {
      // Check featured limit
      if (formData.is_featured) {
        const { count: featuredCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_featured', true)
        
        if (featuredCount && featuredCount >= 10) {
          alert('Maximum 10 featured products allowed. Please unfeature another product first.')
          return
        }
      }

      // Generate slug if not provided
      let slug = formData.slug || generateSlug(formData.name)
      
      // Ensure slug uniqueness
      const { data: existingProducts } = await supabase
        .from('products')
        .select('slug')
      
      const existingSlugs = existingProducts?.map(p => p.slug).filter(Boolean) || []
      slug = ensureUniqueSlug(slug, existingSlugs)

      const { error } = await supabase.from('products').insert({
        name: formData.name,
        url: formData.url || null,
        founder_id: parseInt(formData.founder_id),
        description: formData.description || null,
        category_id: parseInt(formData.category_id),
        slug: slug,
        is_featured: formData.is_featured,
        featured_order: formData.featured_order || null,
        date_added: new Date().toISOString()
      })

      if (error) throw error

      setShowAddForm(false)
      setFormData({ name: '', url: '', founder_id: '', description: '', category_id: '', slug: '', is_featured: false, featured_order: null })
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

      // Check featured limit if making product featured
      if (product.is_featured && !products.find(p => p.id === id)?.is_featured) {
        const { count: featuredCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_featured', true)
        
        if (featuredCount && featuredCount >= 10) {
          alert('Maximum 10 featured products allowed. Please unfeature another product first.')
          return
        }
      }

      // Generate slug if empty
      let slug = product.slug || generateSlug(product.name)
      if (!product.slug) {
        const { data: existingProducts } = await supabase
          .from('products')
          .select('slug')
        
        const existingSlugs = existingProducts?.map(p => p.slug).filter(Boolean) || []
        slug = ensureUniqueSlug(slug, existingSlugs)
      }

      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          url: product.url,
          founder_id: product.founder_id,
          description: product.description,
          category_id: product.category_id,
          slug: slug,
          is_featured: product.is_featured,
          featured_order: product.featured_order
        })
        .eq('id', id)

      if (error) throw error

      setEditingId(null)
      fetchData()
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
    setProducts(products.map(p => {
      if (p.id === id) {
        const updated = { ...p, [field]: value }
        // Auto-generate slug if name changes and slug is empty
        if (field === 'name' && !updated.slug) {
          updated.slug = generateSlug(updated.name)
        }
        return updated
      }
      return p
    }))
  }

  async function handleRevenueUpdate(productId: number) {
    try {
      const product = products.find(p => p.id === productId)
      if (!product) return

      const mrr = revenueFormData.mrr ? parseFloat(revenueFormData.mrr) : null
      const arr = revenueFormData.arr ? parseFloat(revenueFormData.arr) : null

      if (!product.revenue) {
        // Create new revenue data
        const { error } = await supabase.from('revenue_data').insert({
          product_id: productId,
          mrr: mrr,
          arr: arr,
          date_reported: new Date().toISOString(),
          verification_tier_id: revenueFormData.verification_tier_id,
          source_url: revenueFormData.source_url || null
        })

        if (error) throw error
      } else {
        // Update existing revenue data
        const { error } = await supabase
          .from('revenue_data')
          .update({
            mrr: mrr,
            arr: arr,
            date_reported: new Date().toISOString(),
            verification_tier_id: revenueFormData.verification_tier_id,
            source_url: revenueFormData.source_url || null
          })
          .eq('id', product.revenue.id)

        if (error) throw error
      }

      setEditingRevenueId(null)
      setRevenueFormData({ mrr: '', arr: '', source_url: '', verification_tier_id: 1 })
      fetchData()
      alert('Revenue data updated successfully!')
    } catch (error) {
      console.error('Error updating revenue:', error)
      alert('Failed to update revenue data')
    }
  }

  function formatRevenue(amount: number | null): string {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
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
              <input
                type="text"
                placeholder="Slug (auto-generated if empty)"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                onBlur={(e) => {
                  if (!e.target.value && formData.name) {
                    setFormData({ ...formData, slug: generateSlug(formData.name) })
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <div className="flex items-center gap-4 md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Product</span>
                  <Star size={16} className={formData.is_featured ? 'text-yellow-500' : 'text-gray-400'} />
                </label>
                {formData.is_featured && (
                  <input
                    type="number"
                    placeholder="Featured Order (1-10)"
                    min="1"
                    max="10"
                    value={formData.featured_order || ''}
                    onChange={(e) => setFormData({ ...formData, featured_order: e.target.value ? parseInt(e.target.value) : null })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 w-32"
                  />
                )}
              </div>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Founder</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MRR</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ARR</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Featured</th>
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
                    <td className="px-4 py-3 text-sm">
                      {editingId === product.id ? (
                        <input
                          type="text"
                          value={product.slug || ''}
                          onChange={(e) => updateProduct(product.id, 'slug', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm w-32"
                          placeholder="slug-revenue"
                        />
                      ) : (
                        <span className="text-gray-600 text-xs font-mono">{product.slug || 'No slug'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {founders.find(f => f.id === product.founder_id)?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {categories.find(c => c.id === product.category_id)?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingRevenueId === product.id ? (
                        <input
                          type="number"
                          placeholder="MRR"
                          value={revenueFormData.mrr}
                          onChange={(e) => setRevenueFormData({ ...revenueFormData, mrr: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded text-sm w-24"
                        />
                      ) : (
                        <span className="text-gray-900 font-medium">
                          {formatRevenue(product.revenue?.mrr || null)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingRevenueId === product.id ? (
                        <input
                          type="number"
                          placeholder="ARR"
                          value={revenueFormData.arr}
                          onChange={(e) => setRevenueFormData({ ...revenueFormData, arr: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded text-sm w-24"
                        />
                      ) : (
                        <span className="text-gray-900 font-medium">
                          {formatRevenue(product.revenue?.arr || null)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {editingId === product.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="checkbox"
                            checked={product.is_featured || false}
                            onChange={(e) => updateProduct(product.id, 'is_featured', e.target.checked)}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          {product.is_featured && (
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={product.featured_order || ''}
                              onChange={(e) => updateProduct(product.id, 'featured_order', e.target.value ? parseInt(e.target.value) : null)}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Order"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          {product.is_featured ? (
                            <div title={`Featured #${product.featured_order || ''}`}>
                              <Star className="text-yellow-500" size={20} />
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
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
                      ) : editingRevenueId === product.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRevenueUpdate(product.id)}
                            className="p-1 text-green-600 hover:text-green-700"
                            title="Save Revenue"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingRevenueId(null)
                              setRevenueFormData({ mrr: '', arr: '', source_url: '', verification_tier_id: 1 })
                            }}
                            className="p-1 text-gray-600 hover:text-gray-700"
                            title="Cancel"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingRevenueId(product.id)
                              setRevenueFormData({
                                mrr: product.revenue?.mrr?.toString() || '',
                                arr: product.revenue?.arr?.toString() || '',
                                source_url: product.revenue?.source_url || '',
                                verification_tier_id: product.revenue?.verification_tier_id || 1
                              })
                            }}
                            className="p-1 text-purple-600 hover:text-purple-700"
                            title="Edit Revenue (MRR/ARR)"
                          >
                            <DollarSign size={18} />
                          </button>
                          <button
                            onClick={() => setEditingId(product.id)}
                            className="p-1 text-blue-600 hover:text-blue-700"
                            title="Edit Product"
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
