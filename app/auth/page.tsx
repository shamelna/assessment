"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { EmailPasswordForm } from '@/components/auth/EmailPasswordForm'
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const { user, isConfigured } = useAuth()

  useEffect(() => {
    if (user) {
      router.push('/history')
    }
  }, [user, router])

  const handleAuthSuccess = () => {
    setSuccess(mode === 'signin' ? 'Successfully signed in!' : 'Account created successfully!')
    setError(null)
    setTimeout(() => {
      router.push('/history')
    }, 1500)
  }

  const handleAuthError = (errorMessage: string) => {
    setError(errorMessage)
    setSuccess(null)
  }

  const handleSocialLogin = (provider: string) => {
    setError(`${provider} login failed. Please try again or use email/password.`)
    return Promise.resolve()
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-brand-lightgrey flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <CardTitle>Authentication Not Available</CardTitle>
            <CardDescription>
              Firebase authentication is not configured. Please set up Firebase to enable user accounts.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-lightgrey py-16">
      {/* Logo Header */}
      <div className="bg-white py-4 border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <img 
              src="http://practitioner.kaizenacademy.education/logo_round.png" 
              alt="Kaizen Academy Logo" 
              className="h-16 w-auto"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-brand-black">
            {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
          </h1>
          <p className="text-brand-grey text-lg">
            {mode === 'signin' 
              ? 'Sign in to access your Lean assessment and track your progress'
              : 'Join Kaizen Academy to assess your operational excellence readiness'
            }
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Email/Password Form */}
          <div>
            <EmailPasswordForm
              mode={mode}
              loading={loading}
              onAuthSuccess={handleAuthSuccess}
              onAuthError={handleAuthError}
              onModeChange={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin')
                setError(null)
                setSuccess(null)
              }}
            />
          </div>

          {/* Social Login */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Quick Sign In</CardTitle>
                <CardDescription>
                  Use your existing accounts to get started faster
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SocialLoginButtons
                  loading={loading}
                  onSocialLogin={handleSocialLogin}
                />
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Why Create an Account?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Save your assessment progress</li>
                    <li>• Track your readiness improvement over time</li>
                    <li>• Access personalized recommendations</li>
                    <li>• Download detailed PDF reports</li>
                    <li>• Get exclusive Kaizen Academy content</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="outline" className="border-brand-darkgrey text-brand-darkgrey hover:bg-brand-darkgrey hover:text-white">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
