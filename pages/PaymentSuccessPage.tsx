import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Clock, ArrowLeft, Loader, Mail, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed' | 'expired'
  payment_id: string
  amount: number
  processor: string
  tier: string
  message?: string
}

export default function PaymentSuccessPage() {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAccountCreation, setShowAccountCreation] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [accountError, setAccountError] = useState('')
  const [accountCreated, setAccountCreated] = useState(false)
  
  const { user, signIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const paymentId = urlParams.get('payment_id')
    const processor = urlParams.get('processor')
    
    if (paymentId && processor) {
      checkPaymentStatus(paymentId, processor)
    } else {
      setLoading(false)
    }
  }, [])

  const checkPaymentStatus = async (paymentId: string, processor: string) => {
    try {
      const response = await fetch('https://ikqmkibcfnnjqfazayfm.supabase.co/functions/v1/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrcW1raWJjZm5uanFmYXpheWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzcxOTAsImV4cCI6MjA3NzY1MzE5MH0.T3n_BCMww_wdFnW5L4ZgQ1hPF9jRdVq9ZVhXlQfppyo`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrcW1raWJjZm5uanFmYXpheWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzcxOTAsImV4cCI6MjA3NzY1MzE5MH0.T3n_BCMww_wdFnW5L4ZgQ1hPF9jRdVq9ZVhXlQfppyo'
        },
        body: JSON.stringify({ payment_id: paymentId, processor: processor })
      });

      if (!response.ok) throw new Error('Payment verification failed');

      const result = await response.json();
      const data = result.data;

      setPaymentStatus({
        status: data.status,
        payment_id: data.payment_id,
        amount: data.amount,
        processor: data.processor,
        tier: data.tier,
        message: data.verified ? 'Payment verified successfully' : undefined
      });
      
      if (data.status === 'completed' && !user) {
        setShowAccountCreation(true)
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('Payment verification error:', error);
      setPaymentStatus({
        status: 'failed',
        payment_id: paymentId,
        amount: 0,
        processor: processor,
        tier: 'Unknown',
        message: error.message || 'Failed to verify payment status'
      });
      setLoading(false);
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setAccountError('')
    setCreatingAccount(true)

    try {
      const response = await fetch('https://ikqmkibcfnnjqfazayfm.supabase.co/functions/v1/create-user-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrcW1raWJjZm5uanFmYXpheWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzcxOTAsImV4cCI6MjA3NzY1MzE5MH0.T3n_BCMww_wdFnW5L4ZgQ1hPF9jRdVq9ZVhXlQfppyo`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrcW1raWJjZm5uanFmYXpheWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzcxOTAsImV4cCI6MjA3NzY1MzE5MH0.T3n_BCMww_wdFnW5L4ZgQ1hPF9jRdVq9ZVhXlQfppyo'
        },
        body: JSON.stringify({
          email,
          password,
          payment_id: paymentStatus?.payment_id,
          processor: paymentStatus?.processor,
          tier: paymentStatus?.tier,
          amount: paymentStatus?.amount
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create account')
      }

      if (result.data.user_exists) {
        setAccountError('Account already exists. Please sign in instead.')
        return
      }

      setAccountCreated(true)
      
      setTimeout(async () => {
        await signIn(email, password)
        navigate('/dashboard')
      }, 2000)

    } catch (error: any) {
      setAccountError(error.message || 'Failed to create account')
    } finally {
      setCreatingAccount(false)
    }
  }

  const getStatusIcon = () => {
    switch (paymentStatus?.status) {
      case 'completed':
        return <CheckCircle className="text-green-600" size={64} />
      case 'failed':
        return <XCircle className="text-red-600" size={64} />
      case 'pending':
        return <Clock className="text-yellow-600" size={64} />
      default:
        return <Loader className="text-blue-600 animate-spin" size={64} />
    }
  }

  const getStatusMessage = () => {
    switch (paymentStatus?.status) {
      case 'completed':
        return 'Payment Successful!'
      case 'failed':
        return 'Payment Failed'
      case 'pending':
        return 'Payment Processing...'
      default:
        return 'Loading...'
    }
  }

  const getStatusColor = () => {
    switch (paymentStatus?.status) {
      case 'completed':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      case 'pending':
        return 'text-yellow-600'
      default:
        return 'text-blue-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="text-green-600 animate-spin mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we verify your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Ripe<span className="text-green-600">Lemons</span>
            </Link>
            <Link to="/pricing" className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Pricing
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mb-6">{getStatusIcon()}</div>
          
          <h1 className={`text-3xl font-bold mb-4 ${getStatusColor()}`}>
            {getStatusMessage()}
          </h1>
          
          {paymentStatus?.message && (
            <p className="text-gray-600 mb-6">{paymentStatus.message}</p>
          )}
          
          {paymentStatus && paymentStatus.status === 'completed' && (
            <>
              {accountCreated ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-green-900 mb-2">Account Created Successfully!</h3>
                  <p className="text-green-800">Redirecting you to your dashboard...</p>
                </div>
              ) : showAccountCreation && !user ? (
                <div className="bg-white border-2 border-green-200 rounded-lg p-6 mb-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-4 text-center">Create Your Account</h3>
                  <p className="text-gray-600 mb-4 text-center text-sm">
                    Create an account to access your premium features
                  </p>
                  
                  {accountError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                      {accountError}
                    </div>
                  )}
                  
                  <form onSubmit={handleCreateAccount} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Minimum 6 characters"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={creatingAccount}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {creatingAccount ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-green-900 mb-2">Welcome to RipeLemons Premium!</h3>
                  <p className="text-green-800">
                    You now have unlimited access to all premium features.
                  </p>
                </div>
              )}
              
              <div className="text-sm text-gray-600 mb-6 space-y-1">
                <p><strong>Payment ID:</strong> {paymentStatus.payment_id}</p>
                <p><strong>Processor:</strong> {paymentStatus.processor}</p>
                <p><strong>Amount:</strong> ${paymentStatus.amount}</p>
                <p><strong>Plan:</strong> {paymentStatus.tier} Tier</p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Link
                  to="/"
                  className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Exploring
                </Link>
                {user && (
                  <Link
                    to="/dashboard"
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                )}
              </div>
            </>
          )}
          
          {paymentStatus && paymentStatus.status === 'failed' && (
            <>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-red-900 mb-2">Payment Failed</h3>
                <p className="text-red-800">
                  We couldn't process your payment. Please try again or contact support.
                </p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Link
                  to="/pricing"
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </Link>
              </div>
            </>
          )}
          
          {!paymentStatus && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Missing Payment Information</h3>
                <p className="text-blue-800">
                  We couldn't find your payment details.
                </p>
              </div>
              
              <Link
                to="/pricing"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Pricing
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
