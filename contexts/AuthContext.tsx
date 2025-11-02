import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  subscription_status: 'free' | 'premium' | 'pro'
  subscription_tier: string | null
  monthly_view_count: number
  monthly_view_limit: number
  api_key: string | null
  is_admin: boolean | null
  created_at: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, fullName?: string) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<any>
  updateProfile: (updates: Partial<UserProfile>) => Promise<any>
  refreshProfile: () => Promise<void>
  checkViewLimit: () => Promise<boolean>
  incrementViewCount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user and profile on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          await fetchProfile(user.id)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadUser()

    // Set up auth listener - KEEP SIMPLE
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  async function signIn(email: string, password: string) {
    const result = await supabase.auth.signInWithPassword({ email, password })
    if (result.data.user) {
      await fetchProfile(result.data.user.id)
    }
    return result
  }

  async function signUp(email: string, password: string, fullName?: string) {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName
        }
      }
    })

    if (result.data.user) {
      // Create user profile
      await supabase.from('user_profiles').insert({
        id: result.data.user.id,
        email: result.data.user.email,
        full_name: fullName || null,
        subscription_status: 'free',
        monthly_view_count: 0,
        monthly_view_limit: 10
      })
      
      await fetchProfile(result.data.user.id)
    }

    return result
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  async function resetPassword(email: string) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    if (!user) throw new Error('No user logged in')

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .maybeSingle()

    if (error) throw error
    setProfile(data)
    return data
  }

  async function refreshProfile() {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  async function checkViewLimit(): Promise<boolean> {
    if (!profile) return false
    if (profile.subscription_status !== 'free') return true
    return profile.monthly_view_count < profile.monthly_view_limit
  }

  async function incrementViewCount() {
    if (!user || !profile) return
    if (profile.subscription_status !== 'free') return

    await supabase
      .from('user_profiles')
      .update({ monthly_view_count: profile.monthly_view_count + 1 })
      .eq('id', user.id)

    await fetchProfile(user.id)
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile,
    checkViewLimit,
    incrementViewCount
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
