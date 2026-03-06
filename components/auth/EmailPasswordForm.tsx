"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signInWithEmail, signUpWithEmail } from "@/lib/firebase"

interface EmailPasswordFormProps {
  mode: "signin" | "signup"
  loading: boolean
  onAuthSuccess: () => void
  onAuthError: (message: string) => void
  onModeChange: () => void
}

export function EmailPasswordForm({ mode, loading: externalLoading, onAuthSuccess, onAuthError, onModeChange }: EmailPasswordFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const isLoading = loading || externalLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === "signin") {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password)
      }
      onAuthSuccess()
    } catch (error: any) {
      const msg = error?.message || "Authentication failed"
      onAuthError(
        msg.includes("wrong-password") || msg.includes("user-not-found")
          ? "Invalid email or password"
          : msg.includes("email-already-in-use")
          ? "An account with this email already exists"
          : msg.includes("weak-password")
          ? "Password must be at least 6 characters"
          : msg
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-xl font-semibold mb-1">{mode === "signin" ? "Sign In" : "Create Account"}</h3>
      <p className="text-sm text-gray-500 mb-4">
        {mode === "signin" ? "Use your email and password" : "Register with your email"}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "Minimum 6 characters" : "Your password"}
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-brand-yellow text-brand-black hover:bg-yellow-400 font-semibold"
          disabled={isLoading}
        >
          {isLoading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
        </Button>
      </form>
      <p className="text-center text-sm mt-4 text-gray-600">
        {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
        <button onClick={onModeChange} className="text-brand-black font-semibold underline">
          {mode === "signin" ? "Sign Up" : "Sign In"}
        </button>
      </p>
    </div>
  )
}
