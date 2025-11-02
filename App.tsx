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
import './App.css'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/submit" element={<SubmitProductPage />} />
          <Route path="/success" element={<PaymentSuccessPage />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/founders" element={<AdminFounders />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/submissions" element={<AdminSubmissions />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
