import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navigation from '../components/Navigation'
import { Check, X, Zap, Star, Crown, CreditCard, Loader, DollarSign, Rocket } from 'lucide-react'

export default function PricingPage() {
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentProcessor, setCurrentProcessor] = useState<string | null>(null)
  const [paymentProcessor, setPaymentProcessor] = useState<string>('stripe')

  const features = {
    free: [
      '10 product views per month',
      'Basic search functionality',
      'Category filters',
      'Public revenue data only',
    ],
    freeMissing: [
      'Advanced filters',
      'Revenue range sorting',
      'Verification status filters',
      'Founder insights',
      'API access',
      'Export data',
    ],
    premium: [
      'Unlimited product views',
      'Advanced search & filters',
      'All verification tiers',
      'Revenue range filters',
      'Founder profiles',
      'Priority support',
    ],
    premiumMissing: [
      'API access',
      'Bulk exports',
      'Custom analytics',
    ],
    pro: [
      'Everything in Premium',
      'Full API access',
      'Bulk data exports',
      'Custom analytics dashboard',
      'Early access to new products',
      'Priority verification requests',
      'Direct founder contacts',
    ]
  }

  async function handlePurchase(tier: string) {
    setIsProcessing(true)
    setCurrentProcessor(paymentProcessor)
    
    try {
      const response = await fetch('https://ikqmkibcfnnjqfazayfm.supabase.co/functions/v1/universal-payment-processor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: tier,
          email: `customer_${Date.now()}@example.com`, // In real app, get from user
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
          // Redirect to Stripe Checkout or use Stripe Elements
          if (payment_data.client_secret) {
            // Use Stripe Elements - in a real implementation, you'd integrate Stripe Elements
            window.location.href = `/checkout/stripe/${payment_data.payment_id}`
          }
          break
          
        case 'lemonsqueezy':
          // Redirect to LemonSqueezy checkout
          if (payment_data.checkout_url) {
            window.location.href = payment_data.checkout_url
          }
          break
          
        case 'dodopayments':
          // Redirect to DodoPayments checkout
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
      setCurrentProcessor(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-50">
      <Navigation />
      
      <div className="pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              One-time payment for lifetime access. No subscriptions, no recurring fees.
            </p>
          </div>

          {/* Payment Processor Selector */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stripe Option */}
              <label className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                paymentProcessor === 'stripe' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300 bg-white'
              }`}>
                <input
                  type="radio"
                  name="payment_processor"
                  value="stripe"
                  checked={paymentProcessor === 'stripe'}
                  onChange={(e) => setPaymentProcessor(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${
                    paymentProcessor === 'stripe' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <CreditCard size={20} />
                  </div>
                  <span className="font-semibold text-gray-900">Stripe</span>
                  {paymentProcessor === 'stripe' && (
                    <Check className="ml-auto text-blue-600" size={20} />
                  )}
                </div>
                <p className="text-sm text-gray-600">Most popular, supports all major cards worldwide</p>
              </label>

              {/* LemonSqueezy Option */}
              <label className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                paymentProcessor === 'lemonsqueezy' 
                  ? 'border-yellow-500 bg-yellow-50' 
                  : 'border-gray-200 hover:border-yellow-300 bg-white'
              }`}>
                <input
                  type="radio"
                  name="payment_processor"
                  value="lemonsqueezy"
                  checked={paymentProcessor === 'lemonsqueezy'}
                  onChange={(e) => setPaymentProcessor(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${
                    paymentProcessor === 'lemonsqueezy' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    <DollarSign size={20} />
                  </div>
                  <span className="font-semibold text-gray-900">LemonSqueezy</span>
                  {paymentProcessor === 'lemonsqueezy' && (
                    <Check className="ml-auto text-yellow-600" size={20} />
                  )}
                </div>
                <p className="text-sm text-gray-600">Great for digital products, handles tax automatically</p>
              </label>

              {/* DodoPayments Option */}
              <label className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                paymentProcessor === 'dodopayments' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-green-300 bg-white'
              }`}>
                <input
                  type="radio"
                  name="payment_processor"
                  value="dodopayments"
                  checked={paymentProcessor === 'dodopayments'}
                  onChange={(e) => setPaymentProcessor(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${
                    paymentProcessor === 'dodopayments' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'
                  }`}>
                    <Rocket size={20} />
                  </div>
                  <span className="font-semibold text-gray-900">DodoPayments</span>
                  {paymentProcessor === 'dodopayments' && (
                    <Check className="ml-auto text-green-600" size={20} />
                  )}
                </div>
                <p className="text-sm text-gray-600">Fast checkout, optimized for conversions</p>
              </label>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Free Tier */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-200">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="text-gray-400" size={24} />
                  <h3 className="text-2xl font-bold text-gray-900">Free</h3>
                </div>
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
                {features.free.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
                {features.freeMissing.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 opacity-50">
                    <X className="text-gray-400 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-500">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Tier */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-600 relative transform scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-600 text-white text-sm font-semibold rounded-full">
                Most Popular
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="text-green-600" size={24} />
                  <h3 className="text-2xl font-bold text-gray-900">Premium</h3>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  $49
                  <span className="text-lg text-gray-500 font-normal"> one-time</span>
                </div>
                <p className="text-gray-600">Lifetime access for indie hackers</p>
              </div>

              <button
                onClick={() => handlePurchase('premium')}
                disabled={isProcessing}
                className="block w-full py-3 px-6 text-center bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing && currentProcessor === 'premium' ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    Get Premium Access
                  </>
                )}
              </button>

              <div className="space-y-3">
                {features.premium.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
                {features.premiumMissing.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 opacity-50">
                    <X className="text-gray-400 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-500">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tier */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-gray-200">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="text-purple-600" size={24} />
                  <h3 className="text-2xl font-bold text-gray-900">Pro</h3>
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  $99
                  <span className="text-lg text-gray-500 font-normal"> one-time</span>
                </div>
                <p className="text-gray-600">For serious entrepreneurs</p>
              </div>

              <button
                onClick={() => handlePurchase('pro')}
                disabled={isProcessing}
                className="block w-full py-3 px-6 text-center bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing && currentProcessor === 'pro' ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    Get Pro Access
                  </>
                )}
              </button>

              <div className="space-y-3">
                {features.pro.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <CreditCard size={20} />
              Secure Payment Processing
            </h3>
            <p className="text-blue-800">
              Payments are processed securely through <strong>{paymentProcessor}</strong>. 
              All payment information is encrypted and we never store your card details.
            </p>
          </div>

          {/* Features Comparison */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Why Go Premium?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Check className="text-green-600" size={24} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Unlimited Access</h3>
                <p className="text-gray-600">
                  View unlimited products and revenue data without restrictions
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-green-600" size={24} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Advanced Filters</h3>
                <p className="text-gray-600">
                  Filter by revenue range, verification status, and more
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="text-green-600" size={24} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">One-Time Payment</h3>
                <p className="text-gray-600">
                  Pay once, access forever. No subscriptions or hidden fees
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Is this really a one-time payment?</h3>
                <p className="text-gray-600">
                  Yes! Pay once and get lifetime access to all features in your tier. No recurring charges.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Can I upgrade later?</h3>
                <p className="text-gray-600">
                  Absolutely! You can upgrade from Free to Premium or Premium to Pro anytime. You'll only pay the difference.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">How is revenue data verified?</h3>
                <p className="text-gray-600">
                  We use a 3-tier verification system: Tier 1 (90-95% confidence) includes direct financial proof, Tier 2 (70-85%) is founder-reported data, and Tier 3 (50-70%) is community-reported data.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Do you offer refunds?</h3>
                <p className="text-gray-600">
                  Yes, we offer a 30-day money-back guarantee if you're not satisfied with your purchase.
                </p>
              </div>
            </div>
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
