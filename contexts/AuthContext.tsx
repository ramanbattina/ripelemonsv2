import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'
import { getRedirectUrl } from '../lib/config'

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
      
      // If profile doesn't exist, create one
      if (!data) {
        // Get user email from auth
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Check if there's an existing profile with this user ID (just in case)
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle()

          if (existingProfile) {
            setProfile(existingProfile)
          } else {
            // Create new profile with default values
            // Note: is_admin should be set manually via SQL if needed
            const { data: newProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert({
                id: userId,
                email: user.email || '',
                full_name: null,
                subscription_status: 'free',
                monthly_view_count: 0,
                monthly_view_limit: 35,
                is_admin: false  // Default to false - must be set manually for admin users
              })
              .select()
              .single()

            if (createError) {
              console.error('Error creating profile:', createError)
              setProfile(null)
            } else {
              setProfile(newProfile)
            }
          }
        } else {
          setProfile(null)
        }
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    }
  }

  async function signIn(email: string, password: string) {
    const result = await supabase.auth.signInWithPassword({ email, password })
    if (result.data.user) {
      await fetchProfile(result.data.user.id)
      // Force a refresh to ensure state updates
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
    }
    return result
  }

  async function signUp(email: string, password: string, fullName?: string) {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getRedirectUrl('/auth/callback'),
        data: {
          full_name: fullName
        }
      }
    })

    if (result.error) {
      console.error('Signup error:', result.error)
      return result
    }

    if (result.data.user) {
      // Create user profile
      const profileResult = await supabase.from('user_profiles').insert({
        id: result.data.user.id,
        email: result.data.user.email,
        full_name: fullName || null,
        subscription_status: 'free',
        monthly_view_count: 0,
        monthly_view_limit: 10
      })

      if (profileResult.error) {
        console.error('Profile creation error:', profileResult.error)
      }
      
      await fetchProfile(result.data.user.id)
    }

    // Check if email was sent
    // Note: Supabase always sends email if confirmations are enabled
    // If user.email_confirmed_at is null, email confirmation is required
    if (result.data.user && !result.data.user.email_confirmed_at) {
      console.log('Email confirmation required - email should be sent')
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
      redirectTo: getRedirectUrl('/reset-password')
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
    // Admin users have unlimited access
    if (profile.is_admin === true) return true
    if (profile.subscription_status !== 'free') return true
    
    // Check monthly view limit
    const monthlyRemaining = profile.monthly_view_count < profile.monthly_view_limit
    
    // Check purchased view packs
    if (user) {
      const { data: viewPacks } = await supabase
        .from('view_packs')
        .select('views_remaining')
        .eq('user_id', user.id)
        .gt('views_remaining', 0)
      
      const hasPurchasedViews = !!(viewPacks && viewPacks.length > 0 && 
        viewPacks.reduce((sum, pack) => sum + pack.views_remaining, 0) > 0)
      
      return monthlyRemaining || hasPurchasedViews
    }
    
    return monthlyRemaining
  }

  async function incrementViewCount() {
    if (!user || !profile) return
    // Admin users don't need view count tracking
    if (profile.is_admin === true) return
    if (profile.subscription_status !== 'free') return

    // Check if user has purchased views first
    const { data: viewPacks } = await supabase
      .from('view_packs')
      .select('id, views_remaining')
      .eq('user_id', user.id)
      .gt('views_remaining', 0)
      .order('purchased_at', { ascending: true })
      .limit(1)

    if (viewPacks && viewPacks.length > 0 && viewPacks[0].views_remaining > 0) {
      // Use purchased view first
      await supabase
        .from('view_packs')
        .update({ views_remaining: viewPacks[0].views_remaining - 1 })
        .eq('id', viewPacks[0].id)
    } else {
      // Use monthly view count
      await supabase
        .from('user_profiles')
        .update({ monthly_view_count: profile.monthly_view_count + 1 })
        .eq('id', user.id)
    }

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
