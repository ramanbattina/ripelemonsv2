import { Link } from 'react-router-dom'
import { Package, Users, FileText, CreditCard } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Ripe<span className="text-green-600">Lemons</span> Admin
            </Link>
            <Link to="/" className="text-gray-600 hover:text-gray-900">
              Back to Site
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Products Management */}
          <Link
            to="/admin/products"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="text-green-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Products</h2>
            </div>
            <p className="text-gray-600">
              Manage product listings, revenue data, and verification status
            </p>
          </Link>

          {/* Founders Management */}
          <Link
            to="/admin/founders"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Founders</h2>
            </div>
            <p className="text-gray-600">
              Add and manage founder profiles and information
            </p>
          </Link>

          {/* Payment Configuration */}
          <Link
            to="/admin/payments"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CreditCard className="text-orange-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Payments</h2>
            </div>
            <p className="text-gray-600">
              Configure payment processors and checkout settings
            </p>
          </Link>

          {/* Submissions */}
          <Link
            to="/admin/submissions"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="text-purple-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Submissions</h2>
            </div>
            <p className="text-gray-600">
              Review and approve product submissions from owners
            </p>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">7</div>
              <div className="text-sm text-gray-600">Founders</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Pending Submissions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">$10M+</div>
              <div className="text-sm text-gray-600">Total MRR</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
