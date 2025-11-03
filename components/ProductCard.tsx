import { Link } from 'react-router-dom'
import { ProductWithDetails } from '../lib/supabase'
import { DollarSign, TrendingUp, ExternalLink, Award } from 'lucide-react'

interface ProductCardProps {
  product: ProductWithDetails
}

export default function ProductCard({ product }: ProductCardProps) {
  const mrr = product.revenue?.mrr || 0
  const arr = product.revenue?.arr || 0

  function formatRevenue(amount: number): string {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount}`
  }

  function getVerificationBadge() {
    const tier = product.verification_tier?.tier_name || ''
    if (tier.includes('Tier 1')) {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
          <Award size={12} />
          Verified
        </div>
      )
    } else if (tier.includes('Tier 2')) {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
          <Award size={12} />
          Founder Reported
        </div>
      )
    } else if (tier.includes('Tier 3')) {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
          <Award size={12} />
          Community
        </div>
      )
    }
    return null
  }

  return (
    <Link to={`/product/${product.slug || product.id}`}>
      <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-green-200 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-green-600 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>by {product.founder?.name || 'Unknown'}</span>
            </div>
          </div>
          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-green-600 transition-colors"
            >
              <ExternalLink size={18} />
            </a>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-2">
          {product.description || 'No description available'}
        </p>

        {/* Category */}
        {product.category && (
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              {product.category.name}
            </span>
          </div>
        )}

        {/* Revenue Stats */}
        <div className="border-t border-gray-100 pt-4 mt-auto">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <DollarSign size={12} />
                <span>MRR</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {formatRevenue(mrr)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                <TrendingUp size={12} />
                <span>ARR</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {formatRevenue(arr)}
              </div>
            </div>
          </div>
          
          {/* Verification Badge */}
          <div className="flex items-center justify-between">
            {getVerificationBadge()}
            <span className="text-xs text-gray-400">
              {new Date(product.date_added).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
