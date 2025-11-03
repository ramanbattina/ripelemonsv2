import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, ProductWithDetails } from '../lib/supabase'
import { Search,  Filter, X } from 'lucide-react'
import Navigation from '../components/Navigation'
import ProductCard from '../components/ProductCard'
import { useAuth } from '../contexts/AuthContext'

export default function HomePage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<ProductWithDetails[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductWithDetails[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [revenueRange, setRevenueRange] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchData()
  }, [user])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory, revenueRange])

  async function fetchData() {
    try {
      // Fetch all data in parallel
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*').order('date_added', { ascending: false }),
        supabase.from('categories').select('*')
      ])

      if (productsRes.error) throw productsRes.error
      if (categoriesRes.error) throw categoriesRes.error

      const productsData = productsRes.data || []
      
      // Fetch related data for all products
      const founderIds = [...new Set(productsData.map(p => p.founder_id))]
      const productIds = productsData.map(p => p.id)

      const [foundersRes, revenueRes, tiersRes] = await Promise.all([
        supabase.from('founders').select('*').in('id', founderIds),
        supabase.from('revenue_data').select('*').in('product_id', productIds),
        supabase.from('verification_tiers').select('*')
      ])

      const founders = foundersRes.data || []
      const revenueData = revenueRes.data || []
      const tiers = tiersRes.data || []

      // Combine data
      const productsWithDetails = productsData.map(product => {
        const founder = founders.find(f => f.id === product.founder_id)
        const revenue = revenueData
          .filter(r => r.product_id === product.id)
          .sort((a, b) => new Date(b.date_reported).getTime() - new Date(a.date_reported).getTime())[0]
        const category = categoriesRes.data?.find(c => c.id === product.category_id)
        const verification_tier = revenue ? tiers.find(t => t.id === revenue.verification_tier_id) : undefined

        return {
          ...product,
          founder,
          revenue,
          category,
          verification_tier
        }
      })

      // Filter products based on user status
      // Guests only see featured products, logged-in users see all
      const displayProducts = user 
        ? productsWithDetails 
        : productsWithDetails
          .filter(p => p.is_featured === true)
          .sort((a, b) => (a.featured_order || 0) - (b.featured_order || 0))
          .slice(0, 10)

      setProducts(displayProducts)
      setCategories(categoriesRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterProducts() {
    let filtered = [...products]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.founder?.name.toLowerCase().includes(term)
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === selectedCategory)
    }

    // Revenue range filter
    if (revenueRange !== 'all' && filtered.length > 0) {
      filtered = filtered.filter(p => {
        const mrr = p.revenue?.mrr || 0
        switch (revenueRange) {
          case 'under-1k':
            return mrr < 1000
          case '1k-10k':
            return mrr >= 1000 && mrr < 10000
          case '10k-50k':
            return mrr >= 10000 && mrr < 50000
          case '50k-100k':
            return mrr >= 50000 && mrr < 100000
          case 'over-100k':
            return mrr >= 100000
          default:
            return true
        }
      })
    }

    setFilteredProducts(filtered)
  }

  function clearFilters() {
    setSearchTerm('')
    setSelectedCategory(null)
    setRevenueRange('all')
  }

  const hasActiveFilters = searchTerm || selectedCategory || revenueRange !== 'all'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover <span className="text-green-600">Ripe</span> Digital Products
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore successful indie products with verified revenue data. Find inspiration from digital products making real money.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/pricing"
              className="px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Get Premium Access
            </Link>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 hover:border-green-600 transition-colors flex items-center gap-2"
            >
              <Filter size={20} />
              Filters
            </button>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-green-600">{products.length}+</div>
              <div className="text-gray-600 mt-1">Verified Products</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-green-600">$10M+</div>
              <div className="text-gray-600 mt-1">Total MRR</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-green-600">90%+</div>
              <div className="text-gray-600 mt-1">Verification Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      {showFilters && (
        <section className="py-8 px-4 bg-white border-y border-gray-200">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name, founder..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Revenue Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Revenue
                </label>
                <select
                  value={revenueRange}
                  onChange={(e) => setRevenueRange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Ranges</option>
                  <option value="under-1k">Under $1K</option>
                  <option value="1k-10k">$1K - $10K</option>
                  <option value="10k-50k">$10K - $50K</option>
                  <option value="50k-100k">$50K - $100K</option>
                  <option value="over-100k">Over $100K</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Showing {filteredProducts.length} of {products.length} products
                </span>
                <button
                  onClick={clearFilters}
                  className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No products found matching your filters.</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Unlock Premium Insights
          </h2>
          <p className="text-lg mb-8 text-green-100">
            Get full access to revenue data, advanced filters, and exclusive insights for just $49 one-time payment.
          </p>
          <Link
            to="/pricing"
            className="inline-block px-8 py-4 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
          >
            View Pricing Plans
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-2">RipeLemons - Discover profitable digital products</p>
          <p className="text-sm">Built for indie hackers by indie hackers</p>
        </div>
      </footer>
    </div>
  )
}
