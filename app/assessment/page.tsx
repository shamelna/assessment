"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getRandomQuestions, Question } from "@/lib/questions"
import { useRouter } from "next/navigation"

// Clear old sessionStorage data when starting new assessment ONLY if not coming from results
if (typeof window !== 'undefined' && !window.location.pathname.includes('/results')) {
  sessionStorage.removeItem('assessmentResults')
}
import { useAuth } from '@/contexts/AuthContext'
import { FirebaseStatus } from '@/components/ui/firebase-status'
import { signUpWithEmail, saveAssessmentSubmission, AssessmentSubmission } from '@/lib/firebase'
import { ArrowLeft, ArrowRight, Mail } from "lucide-react"
import { CountrySelector } from "@/components/ui/country-selector"
import { COUNTRIES } from "@/lib/countries"
import Link from "next/link"
import { useI18n } from '@/contexts/I18nContext'

export default function AssessmentPage() {
  const router = useRouter()
  const { user, loading, isConfigured } = useAuth()
  const { t } = useI18n()

  // Helper function to process text with bold formatting for React
  const processTextWithBold = (text: string) => {
    // Handle edge cases: empty text, no asterisks, etc.
    if (!text || typeof text !== 'string') {
      return text
    }
    
    // Split the text by asterisks, keeping the asterisks in the array
    const parts = text.split(/(\*[^*]+\*)/g)
    
    // Map over parts and create React elements
    return parts.map((part, index) => {
      // Check if this part is bold text (starts and ends with *)
      if (part.startsWith('*') && part.endsWith('*')) {
        // Remove asterisks and wrap in strong tag
        const boldText = part.slice(1, -1)
        return <strong key={index}>{boldText}</strong>
      } else {
        // Regular text, return as-is
        return part
      }
    })
  }

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showUserForm, setShowUserForm] = useState(false)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    role: "",
    country: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Remove auth requirement - allow anyone to take assessment
    // Sign-up will happen at the end
  }, [])

  useEffect(() => {
    // Load questions immediately - no auth required
    setQuestions(getRandomQuestions(15))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-lightgrey flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-yellow"></div>
          <p className="mt-4 text-brand-grey animate-fade-in-up animate-delay-200">Loading assessment...</p>
        </div>
      </div>
    )
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-brand-lightgrey flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Configuration Error</CardTitle>
            <CardDescription>
              Firebase is not configured. Please contact the administrator.
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

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: answer })
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Check if user is already signed in
      if (user) {
        // User is already signed in, go directly to results
        submitAssessmentForExistingUser()
      } else {
        // User needs to sign up
        setShowUserForm(true)
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const submitAssessmentForExistingUser = async () => {
    setIsSubmitting(true)
    
    try {
      // Calculate score
      let score = 0
      questions.forEach((q) => {
        if (answers[q.id] === q.correctAnswer) {
          score++
        }
      })

      const percentage = Math.round((score / questions.length) * 100)
      let readinessLevel = ""
      
      if (percentage >= 80) {
        readinessLevel = "Advanced"
      } else if (percentage >= 60) {
        readinessLevel = "Intermediate"
      } else if (percentage >= 40) {
        readinessLevel = "Developing"
      } else {
        readinessLevel = "Beginner"
      }

      console.log('Assessment results for existing user:', { score, percentage, readinessLevel })

      // Save assessment to Firebase for existing user
      if (user && isConfigured) {
        try {
          const assessmentData: AssessmentSubmission = {
            userId: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            company: '',
            role: '',
            country: '',
            score,
            total_questions: questions.length,
            percentage,
            readiness_level: readinessLevel,
            answers,
            questions,
            created_at: new Date()
          }

          await saveAssessmentSubmission(assessmentData)
          console.log('Assessment saved successfully for existing user')
        } catch (error) {
          console.warn('⚠️ Could not save assessment to Firebase:', error)
        }
      }

      // Store results for navigation
      const results = {
        name: user?.displayName || user?.email?.split('@')[0] || 'User',
        email: user?.email || '',
        score: score,
        total_questions: questions.length,
        percentage: percentage,
        readiness_level: readinessLevel,
        answers: answers,
        questions: questions,
        userId: user?.uid,
        isNewUser: false
      }

      console.log('Navigating to results for existing user...')
      
      // Store results in sessionStorage with complete data
      const completeResults = {
        ...results,
        questions: questions, // Ensure all questions are stored
        answers: answers,    // Ensure all answers are stored
        timestamp: new Date().toISOString()
      }
      sessionStorage.setItem('assessmentResults', JSON.stringify(completeResults))
      console.log('Stored complete results:', {
        questionCount: completeResults.questions.length,
        answerCount: Object.keys(completeResults.answers).length
      })
      
      // Navigate to user account history for existing users
      router.push('/history')
      
    } catch (error) {
      console.error('Error submitting assessment for existing user:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      console.log('Starting form submission...', userData)
      
      // Validate form data
      if (!userData.name || !userData.email || !userData.password) {
        throw new Error('Please fill in all required fields')
      }
      
      // Validate answers
      if (Object.keys(answers).length === 0) {
        throw new Error('No answers recorded')
      }
      
      console.log('Answers:', answers)
      
      // Calculate score first
      let score = 0
      questions.forEach((q) => {
        if (answers[q.id] === q.correctAnswer) {
          score++
        }
      })

      const percentage = Math.round((score / questions.length) * 100)
      let readinessLevel = ""
      
      if (percentage >= 80) {
        readinessLevel = "Advanced"
      } else if (percentage >= 60) {
        readinessLevel = "Intermediate"
      } else if (percentage >= 40) {
        readinessLevel = "Developing"
      } else {
        readinessLevel = "Beginner"
      }

      console.log('Score calculated:', { score, percentage, readinessLevel })

      // First, try to sign up the user
      let userId = null
      if (userData.email && userData.password) {
        console.log('Attempting to sign up user...')
        try {
          const userCredential = await signUpWithEmail(userData.email, userData.password)
          userId = userCredential.user.uid
          console.log('User signed up successfully:', userId)
        } catch (signUpError: any) {
          console.error('Sign up failed:', signUpError)
          
          // If email already exists, try to sign in instead
          if (signUpError.code === 'auth/email-already-in-use') {
            console.log('Email already exists, attempting to sign in...')
            try {
              const { signInWithEmail } = await import('@/lib/firebase')
              const userCredential = await signInWithEmail(userData.email, userData.password)
              userId = userCredential.user.uid
              console.log('User signed in successfully:', userId)
            } catch (signInError) {
              console.error('Sign in also failed:', signInError)
              // Continue without account creation
            }
          } else {
            // For other errors, continue without account creation
            console.error('Non-email-related sign up error:', signUpError.message)
          }
        }
      }

      // Save assessment to Firebase if user was created
      if (userId) {
        console.log('Saving assessment to Firebase...')
        try {
          const submission: Omit<AssessmentSubmission, 'id' | 'created_at'> = {
            userId: userId,
            name: userData.name,
            email: userData.email,
            company: userData.company || '',
            role: userData.role || '',
            country: userData.country,
            score: score,
            total_questions: questions.length,
            percentage: percentage,
            answers: answers as Record<number, string>,
            readiness_level: readinessLevel,
            questions,
          }
          await saveAssessmentSubmission(submission)
          console.log('Assessment saved successfully')
        } catch (saveError: any) {
          console.error('Failed to save assessment:', saveError)
          // Continue anyway - user can still see results
          // Note: This is likely a Firestore permissions issue that needs to be fixed in Firebase Console
          if (saveError.message?.includes('Missing or insufficient permissions')) {
            console.warn('⚠️ Firestore permissions need to be configured in Firebase Console')
          }
        }
      }

      // Store results for navigation
      const results = {
        ...userData,
        score: score,
        total_questions: questions.length,
        percentage: percentage,
        answers: answers,
        readiness_level: readinessLevel,
        questions: questions,
        userId: userId,
        isNewUser: !!userId
      }

      console.log('Navigating to results...')
      
      // Store results in sessionStorage with complete data
      const completeResults = {
        ...results,
        questions: questions, // Ensure all questions are stored
        answers: answers,    // Ensure all answers are stored
        timestamp: new Date().toISOString()
      }
      sessionStorage.setItem('assessmentResults', JSON.stringify(completeResults))
      console.log('Stored complete results:', {
        questionCount: completeResults.questions.length,
        answerCount: Object.keys(completeResults.answers).length
      })
      
      // Navigate to results without data in URL
      router.push('/results')
      
    } catch (error) {
      console.error('Error during sign-up and assessment submission:', error)
      
      // Calculate score for error case
      let score = 0
      questions.forEach((q) => {
        if (answers[q.id] === q.correctAnswer) {
          score++
        }
      })

      const percentage = Math.round((score / questions.length) * 100)
      let readinessLevel = ""
      
      if (percentage >= 80) {
        readinessLevel = "Advanced"
      } else if (percentage >= 60) {
        readinessLevel = "Intermediate"
      } else if (percentage >= 40) {
        readinessLevel = "Developing"
      } else {
        readinessLevel = "Beginner"
      }

      // Still navigate to results even if Firebase fails
      const results = {
        ...userData,
        score: score,
        total_questions: questions.length,
        percentage: percentage,
        answers: answers,
        readiness_level: readinessLevel,
        questions: questions,
        error: 'Account creation failed, but your results are ready'
      }
      
      // Store results in sessionStorage with complete data
      const completeResults = {
        ...results,
        questions: questions, // Ensure all questions are stored
        answers: answers,    // Ensure all answers are stored
        timestamp: new Date().toISOString()
      }
      sessionStorage.setItem('assessmentResults', JSON.stringify(completeResults))
      console.log('Stored complete results (error case):', {
        questionCount: completeResults.questions.length,
        answerCount: Object.keys(completeResults.answers).length
      })
      
      router.push('/results')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <h2 className="text-2xl font-bold animate-pulse-slow">Loading Assessment...</h2>
        </div>
      </div>
    )
  }

  if (showUserForm) {
    return (
      <main className="min-h-screen bg-brand-lightgrey py-16 animate-fade-in-up">
        {/* Logo Header */}
        <div className="bg-white py-4 border-b border-gray-200 mb-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <img 
                src="http://practitioner.kaizenacademy.education/logo_round.png" 
                alt="Kaizen Academy Logo" 
                className="h-16 w-auto animate-float"
              />
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="shadow-xl border-0 animate-scale-in">
            <CardHeader className="bg-brand-black text-white text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center mx-auto animate-glow">
                  <span className="text-2xl font-bold text-brand-black">🎯</span>
                </div>
              </div>
              <CardTitle className="text-2xl animate-fade-in-up">One More Step!</CardTitle>
              <CardDescription className="text-gray-300 text-lg animate-fade-in-up animate-delay-200">
                Sign up to get your personalized results emailed to you instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Benefits Section */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200 animate-slide-in-up">
                <h4 className="font-semibold text-green-800 mb-2">✨ What you'll get:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Instant email with your detailed assessment report</li>
                  <li>• Personalized recommendations for improvement</li>
                  <li>• Account to track your progress over time</li>
                  <li>• Access to your assessment history anytime</li>
                </ul>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm sm:text-base">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    placeholder="John Doe"
                    className="mobile-input"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm sm:text-base">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="mobile-input"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-sm sm:text-base">Create Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={userData.password || ''}
                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                    placeholder="Create a secure password (min 6 characters)"
                    className="mobile-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">Your password secures your assessment history</p>
                </div>
                <div>
                  <Label htmlFor="company" className="text-sm sm:text-base">Company (Optional)</Label>
                  <Input
                    id="company"
                    value={userData.company}
                    onChange={(e) => setUserData({ ...userData, company: e.target.value })}
                    placeholder="Your Company"
                    className="mobile-input"
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="text-sm sm:text-base">Role (Optional)</Label>
                  <Input
                    id="role"
                    value={userData.role}
                    onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                    placeholder="Operations Manager"
                    className="mobile-input"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-sm sm:text-base">Country (Optional)</Label>
                  <CountrySelector
                    value={userData.country}
                    onChange={(value) => setUserData({ ...userData, country: value })}
                    placeholder="Select your country"
                    className="mobile-input"
                  />
                </div>

                {/* Terms and Privacy */}
                <div className="p-3 bg-gray-50 rounded text-xs text-gray-600">
                  <p>By signing up, you agree to receive your assessment results and occasional tips about operational excellence. We respect your privacy and never share your data.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUserForm(false)}
                    className="border-brand-darkgrey text-brand-darkgrey hover:bg-brand-darkgrey hover:text-white mobile-button touch-target min-h-[44px]"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Back</span>
                    <span className="sm:hidden">Back</span>
                  </Button>
                  <Button type="submit" className="flex-1 bg-brand-yellow text-brand-black hover:bg-yellow-400 font-semibold mobile-button touch-target min-h-[44px]" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-brand-black border-t-transparent rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Creating Account...</span>
                        <span className="sm:hidden">Creating...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Email My Results & Sign Up</span>
                        <span className="sm:hidden">Sign Up & Email</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-lightgrey py-4 sm:py-6 md:py-8 mobile-viewport">
      {/* Firebase Status Banner */}
      <FirebaseStatus />
      
      {/* Logo Header */}
      <div className="bg-white py-3 sm:py-4 border-b border-gray-200 safe-area-top">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center hover-lift">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-brand-darkgrey" />
              <span className="text-sm sm:text-base text-brand-darkgrey hidden sm:inline">Back to Home</span>
              <span className="text-sm text-brand-darkgrey sm:hidden">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="text-xs sm:text-sm text-brand-grey animate-pulse-slow">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm animate-fade-in-up">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-2xl font-bold text-brand-black">Operational Excellence Assessment</h1>
            <span className="text-sm font-semibold text-brand-darkgrey animate-count-up">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-3 animate-progress-fill" />
        </div>

        <Card className="shadow-lg border-0 animate-scale-in">
          <CardHeader className="bg-brand-darkgrey text-white">
            <CardTitle className="text-xl leading-relaxed animate-fade-in-up">
              {processTextWithBold(currentQuestion.question)}
            </CardTitle>
            <CardDescription className="text-gray-300 animate-fade-in-up animate-delay-200">Select the best answer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={option.label}
                onClick={() => handleAnswer(option.label)}
                className={`w-full text-left p-3 sm:p-4 md:p-5 rounded-lg border-2 transition-all touch-target hover-lift animate-fade-in-up animate-delay-${index * 100}${
                  answers[currentQuestion.id] === option.label
                    ? "border-brand-yellow bg-yellow-50 shadow-md"
                    : "border-gray-200 hover:border-brand-yellow hover:shadow-sm"
                }`}
              >
                <div className="flex gap-2 sm:gap-3">
                  <span className="font-bold text-brand-black flex-shrink-0 text-base sm:text-lg">
                    {option.label}.
                  </span>
                  <span className="text-brand-darkgrey leading-relaxed text-sm sm:text-base">
                    {processTextWithBold(option.text)}
                  </span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-2 sm:gap-4 mt-4 sm:mt-6">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="border-brand-darkgrey text-brand-darkgrey hover:bg-brand-darkgrey hover:text-white mobile-button touch-target min-h-[44px] hover-lift"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            className="flex-1 bg-brand-yellow text-brand-black hover:bg-yellow-400 font-semibold mobile-button touch-target min-h-[44px]"
          >
            <span className="hidden sm:inline">Next Question</span>
            <span className="sm:hidden">Next</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </main>
  )
}
