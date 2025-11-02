import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Check, X, ExternalLink } from 'lucide-react'

interface Submission {
  id: number
  product_name: string
  product_url: string | null
  description: string | null
  category_id: number | null
  founder_name: string
  founder_email: string
  founder_twitter: string | null
  mrr: number | null
  arr: number | null
  verification_source: string | null
  status: string
  submitted_at: string
  reviewed_at: string | null
  reviewer_notes: string | null
}

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [submissionsRes, categoriesRes] = await Promise.all([
        supabase.from('product_submissions').select('*').order('submitted_at', { ascending: false }),
        supabase.from('categories').select('*')
      ])

      if (submissionsRes.data) setSubmissions(submissionsRes.data)
      if (categoriesRes.data) setCategories(categoriesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(submission: Submission) {
    if (!confirm('Are you sure you want to approve this submission?')) return

    try {
      // First, check if founder exists or create new one
      let founderId: number
      
      const { data: existingFounder } = await supabase
        .from('founders')
        .select('id')
        .eq('name', submission.founder_name)
        .maybeSingle()

      if (existingFounder) {
        founderId = existingFounder.id
      } else {
        const { data: newFounder, error: founderError } = await supabase
          .from('founders')
          .insert({
            name: submission.founder_name,
            twitter_url: submission.founder_twitter,
            personal_url: null,
            bio: null
          })
          .select()
          .maybeSingle()

        if (founderError) throw founderError
        if (!newFounder) throw new Error('Failed to create founder')
        founderId = newFounder.id
      }

      // Create product
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          name: submission.product_name,
          url: submission.product_url,
          founder_id: founderId,
          description: submission.description,
          category_id: submission.category_id,
          date_added: new Date().toISOString()
        })
        .select()
        .maybeSingle()

      if (productError) throw productError
      if (!newProduct) throw new Error('Failed to create product')

      // Add revenue data if provided
      if (submission.mrr || submission.arr) {
        await supabase.from('revenue_data').insert({
          product_id: newProduct.id,
          mrr: submission.mrr,
          arr: submission.arr,
          date_reported: new Date().toISOString(),
          verification_tier_id: 2, // Tier 2: Founder Reported
          source_url: submission.verification_source
        })
      }

      // Update submission status
      await supabase
        .from('product_submissions')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewer_notes: notes
        })
        .eq('id', submission.id)

      setNotes('')
      setSelectedSubmission(null)
      fetchData()
      alert('Submission approved and product created!')
    } catch (error) {
      console.error('Error approving submission:', error)
      alert('Failed to approve submission: ' + (error as Error).message)
    }
  }

  async function handleReject(id: number) {
    if (!confirm('Are you sure you want to reject this submission?')) return

    try {
      await supabase
        .from('product_submissions')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewer_notes: notes
        })
        .eq('id', id)

      setNotes('')
      setSelectedSubmission(null)
      fetchData()
      alert('Submission rejected')
    } catch (error) {
      console.error('Error rejecting submission:', error)
      alert('Failed to reject submission')
    }
  }

  function formatRevenue(amount: number | null): string {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">Pending</span>
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Approved</span>
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">Rejected</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">{status}</span>
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Product Submissions</h1>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <p className="text-gray-600">No submissions yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map(submission => (
              <div key={submission.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{submission.product_name}</h3>
                      {getStatusBadge(submission.status)}
                    </div>
                    <p className="text-sm text-gray-500">
                      Submitted on {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  {submission.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedSubmission(submission)}
                        className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <Check size={18} />
                        Review
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Description</div>
                    <p className="text-gray-900">{submission.description || 'No description provided'}</p>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Category</div>
                    <p className="text-gray-900">
                      {categories.find(c => c.id === submission.category_id)?.name || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Founder</div>
                    <p className="text-gray-900">{submission.founder_name}</p>
                    <p className="text-sm text-gray-600">{submission.founder_email}</p>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Revenue</div>
                    <p className="text-gray-900">
                      MRR: {formatRevenue(submission.mrr)} | ARR: {formatRevenue(submission.arr)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 text-sm">
                  {submission.product_url && (
                    <a
                      href={submission.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 flex items-center gap-1"
                    >
                      Product URL
                      <ExternalLink size={14} />
                    </a>
                  )}
                  {submission.verification_source && (
                    <a
                      href={submission.verification_source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 flex items-center gap-1"
                    >
                      Verification Source
                      <ExternalLink size={14} />
                    </a>
                  )}
                  {submission.founder_twitter && (
                    <a
                      href={submission.founder_twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      Twitter
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>

                {submission.reviewer_notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-500 mb-1">Reviewer Notes</div>
                    <p className="text-gray-700">{submission.reviewer_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Review: {selectedSubmission.product_name}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reviewer Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Add any notes about this submission..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleApprove(selectedSubmission)}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Approve & Create Product
              </button>
              <button
                onClick={() => handleReject(selectedSubmission.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <X size={18} />
                Reject
              </button>
              <button
                onClick={() => {
                  setSelectedSubmission(null)
                  setNotes('')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
