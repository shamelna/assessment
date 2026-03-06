"use client"

import { useAuth } from "@/contexts/AuthContext"

export function FirebaseStatus() {
  const { isConfigured, errorMessage } = useAuth()

  if (isConfigured) return null

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-800 text-center">
      <strong>Demo Mode:</strong> Firebase is not configured. Assessment results will not be saved.
      {errorMessage && <span className="ml-1 text-xs opacity-75">({errorMessage})</span>}
    </div>
  )
}
