"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'firebase/auth'
import { 
  onAuthStateChangedListener,
  signOutUser,
  isFirebaseConfigured,
  checkFirebaseConnection,
  getFirebaseErrorMessage
} from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  isConfigured: boolean
  connectionStatus: ReturnType<typeof checkFirebaseConnection>
  errorMessage: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<ReturnType<typeof checkFirebaseConnection>>(checkFirebaseConnection())
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // Check Firebase connection status
    const status = checkFirebaseConnection()
    setConnectionStatus(status)
    setErrorMessage(getFirebaseErrorMessage())

    // Set up auth listener only if Firebase is properly configured
    if (status.isHealthy) {
      const unsubscribe = onAuthStateChangedListener((user) => {
        setUser(user)
        setLoading(false)
      })

      return () => unsubscribe()
    } else {
      // Firebase not configured, stop loading
      setLoading(false)
      console.warn('Firebase not properly configured:', status.message)
    }
  }, [])

  const signOut = async () => {
    try {
      await signOutUser()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signOut,
    isConfigured: connectionStatus.isHealthy,
    connectionStatus,
    errorMessage
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
