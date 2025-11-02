import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ikqmkibcfnnjqfazayfm.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrcW1raWJjZm5uanFmYXpheWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzcxOTAsImV4cCI6MjA3NzY1MzE5MH0.T3n_BCMww_wdFnW5L4ZgQ1hPF9jRdVq9ZVhXlQfppyo"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Product {
  id: number
  name: string
  url: string | null
  founder_id: number
  description: string | null
  category_id: number
  logo_url: string | null
  date_added: string
}

export interface Founder {
  id: number
  name: string
  twitter_url: string | null
  personal_url: string | null
  bio: string | null
}

export interface RevenueData {
  id: number
  product_id: number
  mrr: number | null
  arr: number | null
  date_reported: string
  verification_tier_id: number
  source_url: string | null
}

export interface Category {
  id: number
  name: string
  description: string | null
}

export interface VerificationTier {
  id: number
  tier_name: string
  description: string | null
  confidence_level: string | null
}

export interface ProductWithDetails extends Product {
  founder?: Founder
  revenue?: RevenueData
  category?: Category
  verification_tier?: VerificationTier
}
