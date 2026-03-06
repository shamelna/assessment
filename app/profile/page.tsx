"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { updateProfile } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { Settings, Save, User as UserIcon } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    company: '',
    role: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileData({
        displayName: user.displayName || '',
        email: user.email || '',
        company: '',
        role: ''
      })
      // Load additional profile data from Firestore
      loadUserProfile()
    }
  }, [user])

  const loadUserProfile = async () => {
    if (!user || !firestore) return
    
    try {
      // In a real implementation, you'd fetch user profile from Firestore
      // For now, we'll use the basic user data
      console.log('User profile loaded')
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const handleSave = async () => {
    if (!user || !firestore) {
      setSaveError('Authentication error. Please sign in again.')
      return
    }

    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      // Update Firebase Auth profile
      if (profileData.displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: profileData.displayName
        })
      }

      // Update user profile in Firestore
      const userDocRef = doc(firestore, 'users', user.uid)
      await updateDoc(userDocRef, {
        displayName: profileData.displayName,
        company: profileData.company,
        role: profileData.role,
        updatedAt: serverTimestamp()
      })

      setSaveSuccess(true)
      setIsEditing(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
      
    } catch (error) {
      console.error('Error saving profile:', error)
      setSaveError('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-lightgrey flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-yellow"></div>
          <p className="mt-4 text-brand-grey">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-lightgrey flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <UserIcon className="mx-auto h-12 w-12 text-brand-yellow mb-4" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to view your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/auth">
              <Button>Sign In</Button>
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
          <div className="flex justify-between items-center">
            <img 
              src="http://practitioner.kaizenacademy.education/logo_round.png" 
              alt="Kaizen Academy Logo" 
              className="h-16 w-auto"
            />
            <Link href="/assessment">
              <Button>Take Assessment</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-brand-black">My Profile</h1>
          <p className="text-brand-grey text-lg">
            Manage your account information and assessment preferences
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your personal and professional details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-500">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={profileData.company}
                  onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Your company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={profileData.role}
                  onChange={(e) => setProfileData(prev => ({ ...prev, role: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Your job role"
                />
              </div>

              <div className="flex gap-2 pt-4">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setIsEditing(false)
                      setSaveError(null)
                      setSaveSuccess(false)
                    }}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
              
              {/* Success Message */}
              {saveSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">Profile updated successfully!</p>
                </div>
              )}
              
              {/* Error Message */}
              {saveError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{saveError}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Statistics</CardTitle>
              <CardDescription>
                Your Lean assessment progress and history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-blue-800">Assessments Taken</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">-</div>
                  <div className="text-sm text-green-800">Average Score</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Recent Activity</h4>
                <p className="text-sm text-gray-500">No assessment history yet</p>
                <div className="flex gap-2">
                  <Link href="/assessment">
                    <Button variant="outline" className="flex-1">
                      Take Assessment
                    </Button>
                  </Link>
                  <Link href="/history">
                    <Button variant="outline" className="flex-1">
                      View History
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
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
