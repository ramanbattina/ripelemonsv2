// Get the production URL for email redirects
export function getRedirectUrl(path: string = ''): string {
  // For email redirects, always use production URL
  // Priority: environment variable > custom domain > vercel URL
  const emailRedirectUrl = import.meta.env.VITE_EMAIL_REDIRECT_URL || 
    import.meta.env.VITE_PUBLIC_URL || 
    'https://ripelemons.com'
  
  return `${emailRedirectUrl}${path}`
}

