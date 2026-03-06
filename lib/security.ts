// Security utilities and validation

export interface SecurityConfig {
  requiredEnvVars: string[]
  adminEmails: string[]
}

// Validate required environment variables at runtime
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'RESEND_API_KEY',
    'ADMIN_EMAIL'
  ]

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`)
    }
  })

  // Check for placeholder values
  const placeholderValues = ['placeholder', 'your-api-key', 'your-project-id']
  requiredVars.forEach(varName => {
    const value = process.env[varName]
    if (value && placeholderValues.some(placeholder => value.toLowerCase().includes(placeholder))) {
      errors.push(`Environment variable ${varName} appears to be using placeholder value`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Check if user is admin based on email
export const isAdminUser = (email: string | null | undefined): boolean => {
  if (!email) return false
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || []
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  
  return adminEmails.includes(email.toLowerCase()) || email.toLowerCase() === adminEmail
}

// Rate limiting for API endpoints
export const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export const checkRateLimit = (identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now()
  const key = identifier
  
  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  const limit = rateLimitMap.get(key)!
  
  if (now > limit.resetTime) {
    // Reset the window
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (limit.count >= maxRequests) {
    return false
  }
  
  limit.count++
  return true
}

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .slice(0, 1000) // Limit length
}

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Generate secure random token
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Security headers for API responses
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}
