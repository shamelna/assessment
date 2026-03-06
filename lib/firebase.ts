import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, doc, getDoc, enableIndexedDbPersistence, Firestore } from 'firebase/firestore'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  connectAuthEmulator,
  Auth
} from 'firebase/auth'
import { getAnalytics, Analytics } from 'firebase/analytics'
import type { FirebaseApp } from 'firebase/app'

// Enhanced Firebase configuration with validation
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
}

// Configuration validation
const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'projectId', 'appId']
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig])
  
  if (missingFields.length > 0) {
    console.error('Firebase configuration incomplete. Missing fields:', missingFields)
    return false
  }
  
  // Check if using placeholder values
  const isPlaceholder = Object.values(firebaseConfig).some(value => 
    value.includes('placeholder') || value === ''
  )
  
  if (isPlaceholder) {
    console.error('Firebase is using placeholder values. Please configure environment variables.')
    return false
  }
  
  return true
}

// Initialize Firebase app with enhanced error handling
let firebaseApp: FirebaseApp | null = null
let initializationError: Error | null = null

try {
  if (validateFirebaseConfig()) {
    firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp()
    console.log('Firebase app initialized successfully')
  } else {
    throw new Error('Firebase configuration is invalid or incomplete')
  }
} catch (error) {
  initializationError = error as Error
  console.error('Firebase app initialization failed:', error)
}

// Initialize Firestore with persistence and error handling
let firestore: Firestore | null = null
let firestoreError: Error | null = null

if (firebaseApp) {
  try {
    firestore = getFirestore(firebaseApp)
    
    // Enable offline persistence for better performance
    enableIndexedDbPersistence(firestore).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.')
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support persistence.')
      }
    })
    
    console.log('Firestore initialized successfully')
  } catch (error) {
    firestoreError = error as Error
    console.error('Firestore initialization failed:', error)
  }
}

// Initialize Auth with enhanced error handling
let auth: Auth | null = null
let authError: Error | null = null

if (firebaseApp) {
  try {
    auth = getAuth(firebaseApp)
    
    // Use emulator in development if needed
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      connectAuthEmulator(auth, 'http://localhost:9099')
    }
    
    console.log('Firebase Auth initialized successfully')
  } catch (error) {
    authError = error as Error
    console.error('Firebase Auth initialization failed:', error)
  }
}

// Initialize Analytics with error handling
let analytics: Analytics | null = null
let analyticsError: Error | null = null

if (firebaseApp && typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(firebaseApp)
    console.log('Firebase Analytics initialized successfully')
  } catch (error) {
    analyticsError = error as Error
    console.error('Firebase Analytics initialization failed:', error)
  }
}

// Connection status checker
export const checkFirebaseConnection = () => {
  const status = {
    app: !!firebaseApp,
    firestore: !!firestore,
    auth: !!auth,
    analytics: !!analytics,
    configured: validateFirebaseConfig(),
    errors: {
      initialization: initializationError,
      firestore: firestoreError,
      auth: authError,
      analytics: analyticsError
    }
  }
  
  const isHealthy = status.app && status.firestore && status.auth && status.configured && !Object.values(status.errors).some(Boolean)
  
  return {
    ...status,
    isHealthy,
    message: isHealthy ? 'Firebase is properly configured and connected' : 'Firebase has configuration issues'
  }
}

// Enhanced configuration checker
export const isFirebaseConfigured = () => {
  const status = checkFirebaseConnection()
  return status.isHealthy
}

export const getFirebaseErrorMessage = () => {
  const status = checkFirebaseConnection()
  const errors = Object.entries(status.errors)
    .filter(([_, error]) => error)
    .map(([service, error]) => `${service}: ${error?.message}`)
  
  if (errors.length > 0) {
    return `Firebase configuration errors: ${errors.join(', ')}`
  }
  
  return status.message
}

export interface AssessmentSubmission {
  id?: string
  created_at?: any
  userId: string
  name: string
  email: string
  company?: string
  role?: string
  country: string
  score: number
  total_questions: number
  percentage: number
  answers: Record<string, string>
  readiness_level: string
  questions?: any[]   // stored with submission so Q&A is always accurate
}

// Enhanced save function with better error handling
export const saveAssessmentSubmission = async (submission: Omit<AssessmentSubmission, 'id' | 'created_at'>) => {
  if (!firestore) {
    const errorMsg = 'Firestore not initialized: ' + (firestoreError?.message || 'Unknown error')
    console.error('Firestore not available:', firestoreError)
    throw new Error(errorMsg)
  }

  try {
    const docRef = await addDoc(collection(firestore, 'assessments'), {
      ...submission,
      created_at: serverTimestamp()
    })
    console.log('Assessment saved with ID:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error saving assessment:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Detailed error:', {
      error,
      errorMessage,
      submission: {
        userId: submission.userId,
        name: submission.name,
        email: submission.email,
        score: submission.score,
        total_questions: submission.total_questions
      }
    })
    throw new Error(`Failed to save assessment: ${errorMessage}`)
  }
}

// Enhanced retrieval functions with error handling
export const getUserAssessments = async (userId: string) => {
  if (!firestore) {
    throw new Error('Firestore not initialized: ' + (firestoreError?.message || 'Unknown error'))
  }

  try {
    const q = query(
      collection(firestore, 'assessments'),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    const assessments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AssessmentSubmission[]
    
    // Sort by created_at descending (newest first)
    return assessments.sort((a: any, b: any) => {
      const aTime = a.created_at?.toMillis?.() || a.created_at || 0
      const bTime = b.created_at?.toMillis?.() || b.created_at || 0
      return bTime - aTime
    })
  } catch (error) {
    console.error('Error fetching user assessments:', error)
    throw new Error(`Failed to fetch assessments: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const getAssessment = async (assessmentId: string) => {
  if (!firestore) {
    throw new Error('Firestore not initialized: ' + (firestoreError?.message || 'Unknown error'))
  }

  try {
    const docRef = doc(firestore, 'assessments', assessmentId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as AssessmentSubmission
    } else {
      throw new Error('Assessment not found')
    }
  } catch (error) {
    console.error('Error fetching assessment:', error)
    throw new Error(`Failed to fetch assessment: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Authentication functions with enhanced error handling
export const signUpWithEmail = async (email: string, password: string) => {
  if (!auth) throw new Error('Auth not initialized: ' + (authError?.message || 'Unknown error'))
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    console.log('User signed up successfully:', result.user.email)
    return result
  } catch (error) {
    console.error('Error signing up:', error)
    throw error
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  if (!auth) throw new Error('Auth not initialized: ' + (authError?.message || 'Unknown error'))
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    console.log('User signed in successfully:', result.user.email)
    return result
  } catch (error) {
    console.error('Error signing in:', error)
    throw error
  }
}

export const signInWithGoogle = async () => {
  if (!auth) throw new Error('Auth not initialized: ' + (authError?.message || 'Unknown error'))
  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    console.log('Google sign in successful:', result.user.email)
    return result
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

export const signInWithMicrosoft = async () => {
  if (!auth) throw new Error('Auth not initialized: ' + (authError?.message || 'Unknown error'))
  try {
    const provider = new OAuthProvider('microsoft.com')
    const result = await signInWithPopup(auth, provider)
    console.log('Microsoft sign in successful:', result.user.email)
    return result
  } catch (error) {
    console.error('Error signing in with Microsoft:', error)
    throw error
  }
}

export const signInWithApple = async () => {
  if (!auth) throw new Error('Auth not initialized: ' + (authError?.message || 'Unknown error'))
  try {
    const provider = new OAuthProvider('apple.com')
    provider.addScope('email')
    provider.addScope('name')
    const result = await signInWithPopup(auth, provider)
    console.log('Apple sign in successful:', result.user.email)
    return result
  } catch (error) {
    console.error('Error signing in with Apple:', error)
    throw error
  }
}

export const signOutUser = async () => {
  if (!auth) throw new Error('Auth not initialized: ' + (authError?.message || 'Unknown error'))
  try {
    await signOut(auth)
    console.log('User signed out successfully')
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export const onAuthStateChangedListener = (callback: (user: User | null) => void) => {
  if (!auth) {
    console.warn('Auth not initialized, listener not set up')
    return () => {} // Return empty unsubscribe function
  }
  
  try {
    return onAuthStateChanged(auth, callback)
  } catch (error) {
    console.error('Error setting up auth listener:', error)
    return () => {} // Return empty unsubscribe function
  }
}

// Export instances for direct access if needed
export { firebaseApp, firestore, auth, analytics, signOut }
