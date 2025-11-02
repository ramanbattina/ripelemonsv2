import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navigation from '../components/Navigation'
import { Send, CheckCircle } from 'lucide-react'

export default function SubmitProductPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    product_name: '',
    product_url: '',
    description: '',
    category_id: '',
    founder_name: '',
    founder_email: '',
    founder_twitter: '',
    mrr: '',
    arr: '',
    verification_source: ''
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('product_submissions').insert({
        product_name: formData.product_name,
        product_url: formData.product_url || null,
        description: formData.description || null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        founder_name: formData.founder_name,
        founder_email: formData.founder_email,
        founder_twitter: formData.founder_twitter || null,
        mrr: formData.mrr ? parseInt(formData.mrr) : null,
        arr: formData.arr ? parseInt(formData.arr) : null,
        verification_source: formData.verification_source || null,
        status: 'pending'
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => navigate('/'), 3000)
    } catch (error) {
      console.error('Submission error:', error)
      alert('Failed to submit product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-32 pb-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Submission Received!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for submitting your product. We'll review it and get back to you soon.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to homepage...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Submit Your Product
            </h1>
            <p className="text-lg text-gray-600">
              Share your successful digital product with the indie hacker community. All submissions are reviewed before publication.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-sm">
            <div className="space-y-6">
              {/* Product Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Product Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.product_name}
                      onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., MyAwesomeSaaS"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product URL
                    </label>
                    <input
                      type="url"
                      value={formData.product_url}
                      onChange={(e) => setFormData({ ...formData, product_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://myproduct.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Briefly describe what your product does..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      <option value="1">SaaS</option>
                      <option value="2">Browser Extension</option>
                      <option value="3">Mobile App</option>
                      <option value="4">Digital Course</option>
                      <option value="5">Newsletter</option>
                      <option value="6">E-commerce Tool</option>
                      <option value="7">Developer Tool</option>
                      <option value="8">Content Platform</option>
                      <option value="9">API Service</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Founder Information */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Founder Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.founder_name}
                      onChange={(e) => setFormData({ ...formData, founder_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.founder_email}
                      onChange={(e) => setFormData({ ...formData, founder_email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter/X URL
                    </label>
                    <input
                      type="url"
                      value={formData.founder_twitter}
                      onChange={(e) => setFormData({ ...formData, founder_twitter: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>
                </div>
              </div>

              {/* Revenue Information */}
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Information</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Recurring Revenue (MRR)
                      </label>
                      <input
                        type="number"
                        value={formData.mrr}
                        onChange={(e) => setFormData({ ...formData, mrr: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="5000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Annual Recurring Revenue (ARR)
                      </label>
                      <input
                        type="number"
                        value={formData.arr}
                        onChange={(e) => setFormData({ ...formData, arr: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="60000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Source
                    </label>
                    <input
                      type="url"
                      value={formData.verification_source}
                      onChange={(e) => setFormData({ ...formData, verification_source: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="https://twitter.com/yourhandle/status/123456 or Dashboard screenshot URL"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Link to a public tweet, blog post, or screenshot showing your revenue data
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t border-gray-200 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Submit Product
                    </>
                  )}
                </button>
                <p className="mt-4 text-sm text-gray-500">
                  By submitting, you agree that the information provided is accurate and can be publicly displayed on RipeLemons.
                </p>
              </div>
            </div>
          </form>
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
