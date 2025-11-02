import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  User, Crown, Eye, TrendingUp, Key, 
  Settings, CreditCard, Calendar, AlertCircle, CheckCircle
} from 'lucide-react'
import Navigation from '../components/Navigation'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface Subscription {
  id: string
  subscription_tier: string
  status: string
  payment_processor: string
  amount_paid: number
  started_at: string
}

export default function UserDashboard() {
  const { user, profile, updateProfile, refreshProfile, loading: authLoading } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!authLoading) {
      loadData()
    }
  }, [user, profile, authLoading])

  const loadData = async () => {
    if (!user) return
    
    try {
      const { data: subs } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setSubscriptions(subs || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateApiKey = async () => {
    if (!profile || profile.subscription_status === 'free') {
      setMessage('API keys are only available for Premium and Pro users')
      return
    }

    try {
      const apiKey = 'rl_' + Math.random().toString(36).substr(2, 32)
      await updateProfile({ api_key: apiKey })
      await refreshProfile()
      setMessage('API key generated successfully!')
    } catch (error) {
      console.error('Error generating API key:', error)
      setMessage('Failed to generate API key')
    }
  }

  const getSubscriptionBadge = () => {
    if (!profile) return null
    
    const badges = {
      free: { color: 'bg-gray-100 text-gray-700', icon: <User size={16} /> },
      premium: { color: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white', icon: <Crown size={16} /> },
      pro: { color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white', icon: <Crown size={16} /> }
    }

    const badge = badges[profile.subscription_status]
    return (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${badge.color}`}>
        {badge.icon}
        <span>{profile.subscription_status.toUpperCase()}</span>
      </div>
    )
  }

  const getRemainingViews = () => {
    if (!profile) return 0
    if (profile.subscription_status !== 'free') return 'Unlimited'
    return Math.max(0, profile.monthly_view_limit - profile.monthly_view_count)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Authenticated</h2>
            <p className="text-gray-600 mb-4">Please sign in to access your dashboard</p>
            <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // If user exists but profile doesn't, try to refresh it
  useEffect(() => {
    if (user && !profile && !authLoading) {
      refreshProfile()
    }
  }, [user, profile, authLoading, refreshProfile])

  if (!profile && user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Setting up your profile...</h2>
            <p className="text-gray-600 mb-4">Please wait while we load your account information</p>
          </div>
        </div>
      </div>
    )
  }

  // TypeScript guard - profile must exist here
  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {profile.full_name || 'User'}!
              </h1>
              <p className="text-gray-600">Manage your subscription and access premium features</p>
            </div>
            {getSubscriptionBadge()}
          </div>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircle size={20} />
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Usage Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Monthly Views</h3>
                <p className="text-sm text-gray-600">This month</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {typeof getRemainingViews() === 'number' 
                ? `${getRemainingViews()}/${profile.monthly_view_limit}` 
                : getRemainingViews()}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {profile.subscription_status === 'free' 
                ? 'Remaining views this month' 
                : 'Unlimited access'}
            </p>
          </div>

          {/* Subscription Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Subscription</h3>
                <p className="text-sm text-gray-600">Current plan</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 capitalize">
              {profile.subscription_status}
            </div>
            {profile.subscription_status === 'free' && (
              <Link 
                to="/pricing" 
                className="inline-block mt-3 text-sm text-green-600 hover:text-green-700 font-semibold"
              >
                Upgrade to Premium →
              </Link>
            )}
          </div>

          {/* API Access */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Key className="text-purple-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">API Key</h3>
                <p className="text-sm text-gray-600">Premium & Pro only</p>
              </div>
            </div>
            {profile.api_key ? (
              <div className="text-sm font-mono bg-gray-50 p-2 rounded border border-gray-200 truncate">
                {profile.api_key}
              </div>
            ) : (
              <button
                onClick={generateApiKey}
                disabled={profile.subscription_status === 'free'}
                className="text-sm text-purple-600 hover:text-purple-700 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Generate API Key
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings size={24} />
              Account Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{profile.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <p className="text-gray-900">{profile.full_name || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Member Since</label>
                <p className="text-gray-900">
                  {new Date(profile.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Subscription History */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={24} />
              Payment History
            </h2>
            {subscriptions.length > 0 ? (
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 capitalize">
                        {sub.subscription_tier}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        sub.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Amount: ${sub.amount_paid}</p>
                      <p>Processor: {sub.payment_processor}</p>
                      <p className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(sub.started_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No payment history yet</p>
                {profile.subscription_status === 'free' && (
                  <Link 
                    to="/pricing" 
                    className="inline-block mt-2 text-green-600 hover:text-green-700 font-semibold"
                  >
                    Upgrade to Premium →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Premium Features */}
        {profile.subscription_status !== 'free' && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-sm p-6 mt-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Your Premium Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} />
                <span>Unlimited product views</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={20} />
                <span>Advanced filters</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={20} />
                <span>Founder profiles</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={20} />
                <span>API access</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={20} />
                <span>Priority support</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={20} />
                <span>Export data</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
