import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Plus, Edit, Trash2, ArrowLeft, Save } from 'lucide-react'

interface Founder {
  id: number
  name: string
  twitter_url: string | null
  personal_url: string | null
  bio: string | null
}

export default function AdminFounders() {
  const [founders, setFounders] = useState<Founder[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    twitter_url: '',
    personal_url: '',
    bio: ''
  })

  useEffect(() => {
    fetchFounders()
  }, [])

  async function fetchFounders() {
    try {
      const { data, error } = await supabase
        .from('founders')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      if (data) setFounders(data)
    } catch (error) {
      console.error('Error fetching founders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    try {
      const { error } = await supabase.from('founders').insert({
        name: formData.name,
        twitter_url: formData.twitter_url || null,
        personal_url: formData.personal_url || null,
        bio: formData.bio || null
      })

      if (error) throw error

      setShowAddForm(false)
      setFormData({ name: '', twitter_url: '', personal_url: '', bio: '' })
      fetchFounders()
      alert('Founder added successfully!')
    } catch (error) {
      console.error('Error adding founder:', error)
      alert('Failed to add founder')
    }
  }

  async function handleUpdate(id: number) {
    try {
      const founder = founders.find(f => f.id === id)
      if (!founder) return

      const { error } = await supabase
        .from('founders')
        .update({
          name: founder.name,
          twitter_url: founder.twitter_url,
          personal_url: founder.personal_url,
          bio: founder.bio
        })
        .eq('id', id)

      if (error) throw error

      setEditingId(null)
      alert('Founder updated successfully!')
    } catch (error) {
      console.error('Error updating founder:', error)
      alert('Failed to update founder')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure? This will affect products associated with this founder.')) return

    try {
      const { error } = await supabase.from('founders').delete().eq('id', id)

      if (error) throw error

      fetchFounders()
      alert('Founder deleted successfully!')
    } catch (error) {
      console.error('Error deleting founder:', error)
      alert('Failed to delete founder')
    }
  }

  function updateFounder(id: number, field: string, value: any) {
    setFounders(founders.map(f => f.id === id ? { ...f, [field]: value } : f))
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Founders</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Founder
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Founder</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Founder Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <input
                type="url"
                placeholder="Twitter URL"
                value={formData.twitter_url}
                onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <input
                type="url"
                placeholder="Personal Website"
                value={formData.personal_url}
                onChange={(e) => setFormData({ ...formData, personal_url: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 md:col-span-2"
              />
              <textarea
                placeholder="Bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 md:col-span-2"
                rows={3}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Save size={18} />
                Save
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Founders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {founders.map(founder => (
            <div key={founder.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              {editingId === founder.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={founder.name}
                    onChange={(e) => updateFounder(founder.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-bold"
                    placeholder="Name"
                  />
                  <input
                    type="url"
                    value={founder.twitter_url || ''}
                    onChange={(e) => updateFounder(founder.id, 'twitter_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Twitter URL"
                  />
                  <input
                    type="url"
                    value={founder.personal_url || ''}
                    onChange={(e) => updateFounder(founder.id, 'personal_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Personal Website"
                  />
                  <textarea
                    value={founder.bio || ''}
                    onChange={(e) => updateFounder(founder.id, 'bio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Bio"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(founder.id)}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{founder.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(founder.id)}
                        className="p-1 text-blue-600 hover:text-blue-700"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(founder.id)}
                        className="p-1 text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  {founder.bio && (
                    <p className="text-sm text-gray-600 mb-3">{founder.bio}</p>
                  )}
                  <div className="flex gap-3 text-sm">
                    {founder.twitter_url && (
                      <a
                        href={founder.twitter_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Twitter
                      </a>
                    )}
                    {founder.personal_url && (
                      <a
                        href={founder.personal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700"
                      >
                        Website
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
