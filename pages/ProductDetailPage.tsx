import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase, ProductWithDetails } from '../lib/supabase'
import Navigation from '../components/Navigation'
import { DollarSign, TrendingUp, ExternalLink, Award, User, Calendar, ArrowLeft, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile, checkViewLimit, incrementViewCount } = useAuth()
  const [product, setProduct] = useState<ProductWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewLimitReached, setViewLimitReached] = useState(false)

  useEffect(() => {
    if (id) {
      checkAndFetchProduct(parseInt(id))
    }
  }, [id, user, profile])

  async function checkAndFetchProduct(productId: number) {
    try {
      // Check view limit for free users
      if (profile && profile.subscription_status === 'free') {
        const canView = await checkViewLimit()
        if (!canView) {
          setViewLimitReached(true)
          setLoading(false)
          return
        }
        // Increment view count
        await incrementViewCount()
      }

      await fetchProduct(productId)
    } catch (error) {
      console.error('Error checking view limit:', error)
      await fetchProduct(productId)
    }
  }

  async function fetchProduct(productId: number) {
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle()

      if (productError) throw productError
      if (!productData) {
        navigate('/')
        return
      }

      const [founderRes, revenueRes, categoryRes] = await Promise.all([
        supabase.from('founders').select('*').eq('id', productData.founder_id).maybeSingle(),
        supabase.from('revenue_data').select('*').eq('product_id', productId),
        supabase.from('categories').select('*').eq('id', productData.category_id).maybeSingle()
      ])

      const revenueData = revenueRes.data || []
      const latestRevenue = revenueData.sort((a, b) => 
        new Date(b.date_reported).getTime() - new Date(a.date_reported).getTime()
      )[0]

      let verificationTier = undefined
      if (latestRevenue) {
        const { data: tierData } = await supabase
          .from('verification_tiers')
          .select('*')
          .eq('id', latestRevenue.verification_tier_id)
          .maybeSingle()
        verificationTier = tierData || undefined
      }

      setProduct({
        ...productData,
        founder: founderRes.data || undefined,
        revenue: latestRevenue,
        category: categoryRes.data || undefined,
        verification_tier: verificationTier
      })
    } catch (error) {
      console.error('Error fetching product:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  function formatRevenue(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  function getVerificationBadge() {
    const tier = product?.verification_tier?.tier_name || ''
    const confidence = product?.verification_tier?.confidence_level || ''
    
    if (tier.includes('Tier 1')) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg">
          <Award size={20} />
          <div>
            <div className="font-bold">Verified</div>
            <div className="text-xs">{confidence} confidence</div>
          </div>
        </div>
      )
    } else if (tier.includes('Tier 2')) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg">
          <Award size={20} />
          <div>
            <div className="font-bold">Founder Reported</div>
            <div className="text-xs">{confidence} confidence</div>
          </div>
        </div>
      )
    } else if (tier.includes('Tier 3')) {
      return (
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg">
          <Award size={20} />
          <div>
            <div className="font-bold">Community Reported</div>
            <div className="text-xs">{confidence} confidence</div>
          </div>
        </div>
      )
    }
    return null
  }

  const isPremiumUser = profile && profile.subscription_status !== 'free'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    )
  }

  // View limit reached for free users
  if (viewLimitReached) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <div className="mb-6">
                <AlertCircle className="text-amber-500 mx-auto" size={64} />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Monthly View Limit Reached
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                You've reached your limit of {profile?.monthly_view_limit} product views this month as a free user.
                Upgrade to Premium for unlimited access!
              </p>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Premium Benefits:</h3>
                <ul className="text-left text-gray-700 space-y-2">
                  <li className="flex items-center gap-2">
                    <Lock size={16} className="text-green-600" />
                    Unlimited product views
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock size={16} className="text-green-600" />
                    Advanced filters and search
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock size={16} className="text-green-600" />
                    Detailed founder profiles
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock size={16} className="text-green-600" />
                    API access for data export
                  </li>
                </ul>
              </div>
              <div className="flex gap-4 justify-center">
                <Link
                  to="/pricing"
                  className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Upgrade to Premium
                </Link>
                <Link
                  to="/"
                  className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* View Counter for Free Users */}
            {profile && profile.subscription_status === 'free' && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>
                    You have {Math.max(0, profile.monthly_view_limit - profile.monthly_view_count)} views remaining this month
                  </span>
                </div>
                <Link to="/pricing" className="font-semibold hover:text-amber-900">
                  Upgrade →
                </Link>
              </div>
            )}

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
            >
              <ArrowLeft size={20} />
              Back to Products
            </button>

            {/* Header */}
            <div className="bg-white rounded-xl p-8 shadow-sm mb-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  {product.category && (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                      {product.category.name}
                    </span>
                  )}
                </div>
                {product.url && (
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    Visit Website
                    <ExternalLink size={18} />
                  </a>
                )}
              </div>

              <p className="text-lg text-gray-600 mb-6">
                {product.description || 'No description available'}
              </p>

              {/* Founder Info - Premium Feature */}
              {product.founder && (
                <div className={`flex items-center gap-4 pt-6 border-t border-gray-100 ${!isPremiumUser ? 'relative' : ''}`}>
                  {!isPremiumUser && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                      <div className="text-center">
                        <Lock className="text-gray-400 mx-auto mb-2" size={24} />
                        <p className="text-sm font-semibold text-gray-700">Premium Feature</p>
                        <Link to="/pricing" className="text-xs text-green-600 hover:text-green-700">
                          Upgrade to view
                        </Link>
                      </div>
                    </div>
                  )}
                  <User className="text-gray-400" size={20} />
                  <div>
                    <div className="text-sm text-gray-500">Founder</div>
                    <div className="font-medium text-gray-900">{product.founder.name}</div>
                  </div>
                  <div className="flex gap-2 ml-auto">
                    {product.founder.twitter_url && (
                      <a
                        href={product.founder.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        Twitter
                      </a>
                    )}
                    {product.founder.personal_url && (
                      <a
                        href={product.founder.personal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-green-600 transition-colors"
                      >
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <DollarSign size={20} />
                  <span className="text-sm font-medium">Monthly Recurring Revenue</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {product.revenue?.mrr ? formatRevenue(product.revenue.mrr) : 'N/A'}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <TrendingUp size={20} />
                  <span className="text-sm font-medium">Annual Recurring Revenue</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {product.revenue?.arr ? formatRevenue(product.revenue.arr) : 'N/A'}
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Calendar size={20} />
                  <span className="text-sm font-medium">Added to Platform</span>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {new Date(product.date_added).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            </div>

            {/* Verification Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Verification</h2>
              <div className="flex items-start gap-4">
                {getVerificationBadge()}
                <div className="flex-1">
                  <p className="text-gray-600 mb-2">
                    {product.verification_tier?.description || 'No verification information available'}
                  </p>
                  {product.revenue?.source_url && (
                    <a
                      href={product.revenue.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                    >
                      View Source
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Founder Bio - Premium Feature */}
            {product.founder?.bio && (
              <div className={`bg-white rounded-xl p-6 shadow-sm relative ${!isPremiumUser ? 'min-h-[150px]' : ''}`}>
                {!isPremiumUser && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
                    <div className="text-center">
                      <Lock className="text-gray-400 mx-auto mb-2" size={32} />
                      <p className="font-semibold text-gray-700 mb-1">Premium Feature</p>
                      <p className="text-sm text-gray-600 mb-3">Unlock detailed founder profiles</p>
                      <Link 
                        to="/pricing" 
                        className="inline-block px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700"
                      >
                        Upgrade Now
                      </Link>
                    </div>
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900 mb-4">About the Founder</h2>
                <p className="text-gray-600">{product.founder.bio}</p>
              </div>
            )}

            {/* CTA */}
            <div className="mt-8 bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-2">
                {isPremiumUser ? 'Enjoying Premium Access?' : 'Want to see more products like this?'}
              </h3>
              <p className="text-green-100 mb-6">
                {isPremiumUser 
                  ? 'Explore more verified products with your premium membership'
                  : 'Get premium access to advanced filters and detailed insights'}
              </p>
              <Link
                to={isPremiumUser ? '/' : '/pricing'}
                className="inline-block px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
              >
                {isPremiumUser ? 'Explore More Products' : 'View Pricing'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
