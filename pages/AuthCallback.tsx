import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing authentication...')

  useEffect(() => {
    async function handleCallback() {
      try {
        // Get the hash fragment from the URL (Supabase puts tokens in hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const error = hashParams.get('error')
        const errorDescription = hashParams.get('error_description')

        if (error) {
          setStatus('error')
          setMessage(errorDescription || error || 'Authentication failed')
          setTimeout(() => navigate('/'), 3000)
          return
        }

        if (accessToken && refreshToken) {
          // Set the session with the tokens
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (sessionError) throw sessionError

          if (data?.user) {
            // Refresh profile to ensure we have the latest data
            await refreshProfile()
            
            setStatus('success')
            setMessage('Email verified! Redirecting...')
            
            // Redirect to dashboard or home
            setTimeout(() => {
              navigate('/dashboard')
            }, 2000)
          } else {
            throw new Error('No user data received')
          }
        } else {
          // No tokens in URL, check if user is already authenticated
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            setStatus('success')
            setMessage('Already authenticated! Redirecting...')
            setTimeout(() => navigate('/dashboard'), 1500)
          } else {
            throw new Error('No authentication tokens found')
          }
        }
      } catch (error: any) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setMessage(error.message || 'Authentication failed. Please try again.')
        setTimeout(() => navigate('/'), 3000)
      }
    }

    handleCallback()
  }, [navigate, refreshProfile])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying...</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <a href="/" className="text-green-600 hover:text-green-700 underline">Return to Home</a>
          </div>
        )}
      </div>
    </div>
  )
}

