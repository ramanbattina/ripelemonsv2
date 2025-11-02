/**
 * Payment Configuration Utility
 * Handles configuration and management of multiple payment processors
 */

export interface PaymentProcessor {
  name: string
  processor: string
  is_active: boolean
  is_test_mode: boolean
  configuration: Record<string, any>
}

export interface PaymentData {
  processor: string
  payment_id: string
  client_secret?: string
  checkout_url?: string
  payment_url?: string
  amount: number
  currency: string
  is_test_mode: boolean
}

// Default configurations for each payment processor
export const PAYMENT_PROCESSORS = {
  stripe: {
    name: 'Stripe',
    required_fields: ['public_key', 'secret_key', 'webhook_secret'],
    supported_features: ['cards', 'wallets', 'international'],
    test_mode: true
  },
  lemonsqueezy: {
    name: 'LemonSqueezy',
    required_fields: ['public_key', 'api_key', 'webhook_secret'],
    supported_features: ['cards', 'paypal', 'wallets', 'international'],
    test_mode: true
  },
  dodopayments: {
    name: 'DodoPayments',
    required_fields: ['public_key', 'api_key', 'webhook_secret'],
    supported_features: ['cards', 'mobile', 'international'],
    test_mode: true
  }
} as const

/**
 * Validate payment processor configuration
 */
export function validateProcessorConfig(processor: string, config: Record<string, any>): string[] {
  const required = PAYMENT_PROCESSORS[processor as keyof typeof PAYMENT_PROCESSORS]?.required_fields || []
  const errors: string[] = []
  
  required.forEach(field => {
    if (!config[field] || config[field].trim() === '') {
      errors.push(`${field} is required`)
    }
  })
  
  return errors
}

/**
 * Get processor display info
 */
export function getProcessorInfo(processor: string) {
  return PAYMENT_PROCESSORS[processor as keyof typeof PAYMENT_PROCESSORS] || null
}

/**
 * Format payment amount for display
 */
export function formatAmount(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Check if payment processor is properly configured
 */
export function isProcessorConfigured(processor: string, config: Record<string, any>): boolean {
  const validation = validateProcessorConfig(processor, config)
  return validation.length === 0
}

/**
 * Get environment variable for payment processor
 * Note: This function is for server-side use only (edge functions)
 */
export function getEnvVar(_processor: string, _field: string, defaultValue?: string): string {
  // const envKey = `${processor.toUpperCase()}_${field.toUpperCase()}`
  // This function should only be used in edge functions, not in browser
  if (typeof window !== 'undefined') {
    console.warn('getEnvVar should not be called in browser context')
    return defaultValue || ''
  }
  return defaultValue || ''
}

/**
 * Get all configured environment variables for a processor
 */
export function getProcessorEnvVars(processor: string): Record<string, string> {
  const config = PAYMENT_PROCESSORS[processor as keyof typeof PAYMENT_PROCESSORS]
  if (!config) return {}
  
  const envVars: Record<string, string> = {}
  config.required_fields.forEach(field => {
    envVars[field] = getEnvVar(processor, field)
  })
  
  return envVars
}

/**
 * Check if we should use test mode
 */
export function shouldUseTestMode(_processor: string, config?: Record<string, any>): boolean {
  // Check if test mode is explicitly set in config
  if (config && typeof config.test_mode === 'boolean') {
    return config.test_mode
  }
  
  // Default to test mode for safety
  return true
}

/**
 * Get payment processor from database
 */
export async function getActivePaymentProcessor(): Promise<PaymentProcessor | null> {
  try {
    const response = await fetch('https://ikqmkibcfnnjqfazayfm.supabase.co/functions/v1/admin-payment-api', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.error('Failed to fetch payment processors')
      return null
    }
    
    const result = await response.json()
    const processors = result.data || []
    return processors.find((p: PaymentProcessor) => p.is_active) || null
  } catch (error) {
    console.error('Error fetching payment processor:', error)
    return null
  }
}

/**
 * Validate payment amount and tier
 */
export function validatePayment(tier: string, amount: number): { valid: boolean; message?: string } {
  const pricing = {
    'premium': 49,
    'pro': 99
  }
  
  if (!pricing[tier as keyof typeof pricing]) {
    return { valid: false, message: 'Invalid tier' }
  }
  
  const expectedAmount = pricing[tier as keyof typeof pricing]
  if (amount !== expectedAmount) {
    return { valid: false, message: `Expected amount ${expectedAmount}, got ${amount}` }
  }
  
  return { valid: true }
}

/**
 * Sanitize processor data for logging (remove sensitive info)
 */
export function sanitizeProcessorData(data: any): any {
  if (!data) return data
  
  const sanitized = { ...data }
  
  // Remove sensitive fields
  const sensitiveFields = ['secret_key', 'api_key', 'webhook_secret', 'password']
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***'
    }
  })
  
  return sanitized
}

/**
 * Get processor-specific checkout URL
 */
export function getCheckoutUrl(processor: string, paymentData: PaymentData): string | null {
  switch (processor) {
    case 'stripe':
      return paymentData.client_secret ? `/checkout/stripe/${paymentData.payment_id}` : null
    case 'lemonsqueezy':
      return paymentData.checkout_url || null
    case 'dodopayments':
      return paymentData.payment_url || null
    default:
      return null
  }
}