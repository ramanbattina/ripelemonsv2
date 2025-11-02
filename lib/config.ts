// Get the production URL for email redirects
export function getRedirectUrl(path: string = ''): string {
  // Use environment variable if available, otherwise use window.location.origin
  const productionUrl = import.meta.env.VITE_PUBLIC_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'https://ripelemonsv2f.vercel.app')
  
  // For email redirects, always use production URL if available
  const emailRedirectUrl = import.meta.env.VITE_EMAIL_REDIRECT_URL || 'https://ripelemonsv2f.vercel.app'
  
  return `${emailRedirectUrl}${path}`
}

