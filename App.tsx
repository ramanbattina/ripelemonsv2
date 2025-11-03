import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProductDetailPage from './pages/ProductDetailPage'
import PricingPage from './pages/PricingPage'
import SubmitProductPage from './pages/SubmitProductPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminFounders from './pages/admin/AdminFounders'
import AdminSubmissions from './pages/admin/AdminSubmissions'
import AdminPayments from './pages/admin/AdminPayments'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import UserDashboard from './pages/UserDashboard'
import AuthCallback from './pages/AuthCallback'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AdminRoute from './components/AdminRoute'
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/submit" element={<SubmitProductPage />} />
          <Route path="/success" element={<PaymentSuccessPage />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
          <Route path="/admin/founders" element={<AdminRoute><AdminFounders /></AdminRoute>} />
          <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
          <Route path="/admin/submissions" element={<AdminRoute><AdminSubmissions /></AdminRoute>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
