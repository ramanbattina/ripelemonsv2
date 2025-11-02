import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Eye, EyeOff, Check, X, CreditCard, Save, DollarSign, Rocket } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface PaymentProcessor {
  processor: string
  name: string
  is_active: boolean
  is_test_mode: boolean
  configuration: Record<string, any>
}

export default function AdminPayments() {
  const [processors, setProcessors] = useState<PaymentProcessor[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchProcessors()
  }, [])

  const fetchProcessors = async () => {
    try {
      const response = await fetch('https://ikqmkibcfnnjqfazayfm.supabase.co/functions/v1/admin-payment-api', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      if (!response.ok) throw new Error('Failed to fetch payment processors')
      
      const result = await response.json()
      setProcessors(result.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleProcessor = async (processor: string, isActive: boolean) => {
    setSaving(processor)
    try {
      const response = await fetch(`https://ikqmkibcfnnjqfazayfm.supabase.co/functions/v1/admin-payment-api/${processor}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      })
      
      if (!response.ok) throw new Error('Failed to update processor status')
      
      setProcessors(prev => prev.map(p => 
        p.processor === processor ? { ...p, is_active: !isActive } : p
      ))
      setSuccess(`${processor} ${!isActive ? 'enabled' : 'disabled'} successfully`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message)
      setTimeout(() => setError(null), 3000)
    } finally {
      setSaving(null)
    }
  }

  const updateProcessor = async (processor: string, field: string, value: any) => {
    setSaving(processor)
    try {
      const response = await fetch(`https://ikqmkibcfnnjqfazayfm.supabase.co/functions/v1/admin-payment-api/${processor}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      })
      
      if (!response.ok) throw new Error('Failed to update processor')
      
      setProcessors(prev => prev.map(p => 
        p.processor === processor ? { ...p, [field]: value } : p
      ))
      setSuccess(`${processor} updated successfully`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message)
      setTimeout(() => setError(null), 3000)
    } finally {
      setSaving(null)
    }
  }

  const updateConfig = async (processor: string, key: string, value: string) => {
    setSaving(processor)
    try {
      const processorData = processors.find(p => p.processor === processor)
      const newConfig = { ...processorData?.configuration, [key]: value }
      
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY
      
      const response = await fetch(`https://ikqmkibcfnnjqfazayfm.supabase.co/functions/v1/admin-payment-api/${processor}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ configuration: newConfig })
      })
      
      if (!response.ok) throw new Error('Failed to update configuration')
      
      setProcessors(prev => prev.map(p => 
        p.processor === processor ? { ...p, configuration: newConfig } : p
      ))
      setSuccess(`${processor} configuration updated`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message)
      setTimeout(() => setError(null), 3000)
    } finally {
      setSaving(null)
    }
  }

  const getProcessorIcon = (processor: string) => {
    switch (processor) {
      case 'stripe': return <CreditCard className="text-blue-600" size={28} />
      case 'lemonsqueezy': return <DollarSign className="text-yellow-600" size={28} />
      case 'dodopayments': return <Rocket className="text-green-600" size={28} />
      default: return <CreditCard className="text-gray-600" size={28} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment processors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Ripe<span className="text-green-600">Lemons</span> Admin
            </Link>
            <div className="flex gap-4">
              <Link to="/admin" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                Back to Site
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="text-gray-700" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Payment Configuration</h1>
          </div>
          <p className="text-gray-600">
            Configure and manage payment processors. Only one processor can be active at a time.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <X className="text-red-600" size={20} />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
            <Check className="text-green-600" size={20} />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {/* Payment Processors */}
        <div className="space-y-6">
          {processors.map((processor) => (
            <div
              key={processor.processor}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 ${
                processor.is_active ? 'border-green-500' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-50">{getProcessorIcon(processor.processor)}</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      {processor.name}
                      {processor.is_active && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                    </h2>
                    <p className="text-gray-600 capitalize">{processor.processor}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleProcessor(processor.processor, processor.is_active)}
                    disabled={saving === processor.processor}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      processor.is_active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {saving === processor.processor ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : processor.is_active ? (
                      'Disable'
                    ) : (
                      'Enable'
                    )}
                  </button>
                </div>
              </div>

              {/* Test Mode Toggle */}
              <div className="mb-6">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={processor.is_test_mode}
                    onChange={(e) => updateProcessor(processor.processor, 'is_test_mode', e.target.checked)}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-gray-700 font-medium">Test Mode</span>
                  <span className="text-sm text-gray-500">(Use test API keys and sandbox environment)</span>
                </label>
              </div>

              {/* Configuration Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Public Key
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets[`${processor.processor}_public`] ? 'text' : 'password'}
                      value={processor.configuration.public_key || ''}
                      onChange={(e) => updateConfig(processor.processor, 'public_key', e.target.value)}
                      placeholder="Enter public key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => setShowSecrets(prev => ({ ...prev, [`${processor.processor}_public`]: !prev[`${processor.processor}_public`] }))}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showSecrets[`${processor.processor}_public`] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Key
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets[`${processor.processor}_secret`] ? 'text' : 'password'}
                      value={processor.configuration.secret_key || ''}
                      onChange={(e) => updateConfig(processor.processor, 'secret_key', e.target.value)}
                      placeholder="Enter secret key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => setShowSecrets(prev => ({ ...prev, [`${processor.processor}_secret`]: !prev[`${processor.processor}_secret`] }))}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showSecrets[`${processor.processor}_secret`] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook Secret
                  </label>
                  <input
                    type="password"
                    value={processor.configuration.webhook_secret || ''}
                    onChange={(e) => updateConfig(processor.processor, 'webhook_secret', e.target.value)}
                    placeholder="Enter webhook secret"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Success URL
                  </label>
                  <input
                    type="text"
                    value={processor.configuration.success_url || ''}
                    onChange={(e) => updateConfig(processor.processor, 'success_url', e.target.value)}
                    placeholder="/success"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancel URL
                  </label>
                  <input
                    type="text"
                    value={processor.configuration.cancel_url || ''}
                    onChange={(e) => updateConfig(processor.processor, 'cancel_url', e.target.value)}
                    placeholder="/pricing"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Processor-specific fields */}
                {processor.processor === 'lemonsqueezy' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API URL
                    </label>
                    <input
                      type="text"
                      value={processor.configuration.api_url || ''}
                      onChange={(e) => updateConfig(processor.processor, 'api_url', e.target.value)}
                      placeholder="https://api.lemonsqueezy.com/v1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                )}

                {processor.processor === 'dodopayments' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API URL
                      </label>
                      <input
                        type="text"
                        value={processor.configuration.api_url || ''}
                        onChange={(e) => updateConfig(processor.processor, 'api_url', e.target.value)}
                        placeholder="https://api.dodopayments.com/v1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Webhook URL
                      </label>
                      <input
                        type="text"
                        value={processor.configuration.webhook_url || ''}
                        onChange={(e) => updateConfig(processor.processor, 'webhook_url', e.target.value)}
                        placeholder="https://yourapp.com/webhook"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Save Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => updateProcessor(processor.processor, 'updated_at', new Date().toISOString())}
                  disabled={saving === processor.processor}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving === processor.processor ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Help Text */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Payment Processor Setup Guide</h3>
          <div className="text-blue-800 space-y-2">
            <p><strong>Stripe:</strong> Get your keys from the Stripe Dashboard → Developers → API keys</p>
            <p><strong>LemonSqueezy:</strong> Get your API key from LemonSqueezy → Settings → API</p>
            <p><strong>DodoPayments:</strong> Get your API key from DodoPayments Dashboard → Settings → API</p>
            <p><strong>Note:</strong> Only one payment processor can be active at a time. Test mode uses sandbox environments.</p>
          </div>
        </div>
      </div>
    </div>
  )
}