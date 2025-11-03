import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navigation from '../components/Navigation'
import { Check, CreditCard, Loader } from 'lucide-react'
import { VIEW_PACKS, getViewPack, type ViewPackId } from '../lib/payment-config'
import { useAuth } from '../contexts/AuthContext'

export default function PricingPage() {
  const { user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentPack, setCurrentPack] = useState<ViewPackId | null>(null)
  const [paymentProcessor] = useState<string>('stripe')

  async function handlePurchasePack(packId: ViewPackId) {
    setIsProcessing(true)
    setCurrentPack(packId)
    
    try {
      const pack = getViewPack(packId)
      if (!pack) throw new Error('Invalid view pack')

      const response = await fetch('https://ikqmkibcfnnjqfazayfm.supabase.co/functions/v1/universal-payment-processor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pack_id: packId,
          views: pack.views,
          amount: pack.price,
          email: user?.email || `customer_${Date.now()}@example.com`,
          processor: paymentProcessor
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Payment failed')
      }

      const data = await response.json()
      const { processor, payment_data } = data.data

      // Handle different payment processors
      switch (processor) {
        case 'stripe':
          if (payment_data.client_secret) {
            window.location.href = `/checkout/stripe/${payment_data.payment_id}`
          }
          break
          
        case 'lemonsqueezy':
          if (payment_data.checkout_url) {
            window.location.href = payment_data.checkout_url
          }
          break
          
        case 'dodopayments':
          if (payment_data.payment_url) {
            window.location.href = payment_data.payment_url
          }
          break
          
        default:
          throw new Error(`Unsupported payment processor: ${processor}`)
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      alert(`Payment failed: ${error.message}`)
    } finally {
      setIsProcessing(false)
      setCurrentPack(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-50">
      <Navigation />
      
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Simple Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free, pay only when you need more views
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Free Tier */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  $0
                </div>
                <p className="text-gray-600">Perfect for browsing</p>
              </div>

              <Link
                to="/"
                className="block w-full py-3 px-6 text-center bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors mb-6"
              >
                Continue Free
              </Link>

              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">30-40 product views per month</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Basic search functionality</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Category filters</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Public revenue data</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Advanced filters</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Revenue range sorting</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Verification status filters</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">Founder insights</span>
                </div>
              </div>
            </div>

            {/* Pay-as-You-Go */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-600 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-600 text-white text-sm font-semibold rounded-full">
                Most Popular
              </div>
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pay-as-You-Go</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  Starting $4.99
                </div>
                <p className="text-gray-600">Buy view packs when you need them</p>
              </div>

              <div className="space-y-3 mb-6">
                {Object.values(VIEW_PACKS).map((pack) => (
                  <div
                    key={pack.id}
                    className={`p-4 border-2 rounded-lg ${
                      pack.popular 
                        ? 'border-green-600 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-semibold text-gray-900">{pack.name}</span>
                        {'savings' in pack && pack.savings && (
                          <span className="ml-2 px-2 py-0.5 bg-green-600 text-white text-xs font-semibold rounded">
                            Save {pack.savings}
                          </span>
                        )}
                      </div>
                      <span className="text-2xl font-bold text-gray-900">${pack.price}</span>
                    </div>
                    <button
                      onClick={() => handlePurchasePack(pack.id as ViewPackId)}
                      disabled={isProcessing}
                      className={`w-full py-2 px-4 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                        pack.popular
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {isProcessing && currentPack === pack.id ? (
                        <>
                          <Loader className="animate-spin" size={16} />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard size={16} />
                          Buy {pack.name}
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="text-sm text-gray-600">
                <p className="mb-2">Pay-as-you-go includes:</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <Check className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                    <span>All free features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                    <span>No monthly limits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                    <span>Views never expire</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <CreditCard size={20} />
              Secure Payment Processing
            </h3>
            <p className="text-blue-800 text-sm">
              All payments are processed securely. Your card details are never stored.
            </p>
          </div>
        </div>
      </div>

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
