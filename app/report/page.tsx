"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { createUnifiedPDF } from '@/lib/unified-pdf-generator'
import { useAuth } from '@/contexts/AuthContext'
import { getAssessment, AssessmentSubmission } from '@/lib/firebase'
import { CheckCircle2, XCircle, Award, Download, Mail, Calendar, User, Building, Briefcase, ArrowLeft, TrendingUp, Target, BookOpen, Clock, Percent } from 'lucide-react'
import Link from 'next/link'
import { allQuestions, Question } from '@/lib/questions'

function ReportContent() {
  const searchParams = useSearchParams()
  const { user, loading } = useAuth()
  const [assessment, setAssessment] = useState<AssessmentSubmission | null>(null)
  const [loadingAssessment, setLoadingAssessment] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailError, setEmailError] = useState(false)

  useEffect(() => {
    const assessmentId = searchParams.get('id')

    if (assessmentId) {
      // Always load from Firebase when a specific ID is in the URL —
      // never let sessionStorage from a recent assessment override this
      if (user) loadAssessment(assessmentId)
    } else {
      // No ID in URL — fall back to sessionStorage (fresh assessment flow)
      const sessionData = sessionStorage.getItem('assessmentResults')
      if (sessionData) {
        const parsedResults = JSON.parse(sessionData)
        setAssessment(parsedResults)
        setQuestions(parsedResults.questions || [])
      }
      setLoadingAssessment(false)
    }
  }, [searchParams, user])

  const loadAssessment = async (assessmentId: string) => {
    try {
      setLoadingAssessment(true)
      const assessmentData = await getAssessment(assessmentId)
      
      // Verify user owns this assessment
      if (assessmentData.userId !== user?.uid) {
        throw new Error('Access denied')
      }
      
      setAssessment(assessmentData)

      // Use questions stored with the assessment if available (new submissions)
      // Otherwise fall back to matching from current bank (may show different questions)
      if (assessmentData.questions && assessmentData.questions.length > 0) {
        setQuestions(assessmentData.questions)
      } else {
        const matched = allQuestions.filter(q =>
          Object.keys(assessmentData.answers).includes(q.id.toString())
        )
        setQuestions(matched)
      }
      
    } catch (error) {
      console.error('Error loading assessment:', error)
      setAssessment(null)
    } finally {
      setLoadingAssessment(false)
    }
  }

  const generatePDF = async () => {
    if (!assessment) return
    
    setIsGeneratingPDF(true)
    try {
      // Use the new professional PDF generator
      const pdfDataUrl = await createUnifiedPDF({
        name: assessment.name,
        email: assessment.email,
        company: assessment.company,
        role: assessment.role,
        country: assessment.country,
        score: assessment.score,
        total_questions: assessment.total_questions,
        percentage: assessment.percentage,
        readiness_level: assessment.readiness_level,
        answers: assessment.answers,
        questions: questions,
        created_at: assessment.created_at
      })
      
      // Download PDF
      const link = document.createElement('a')
      link.href = pdfDataUrl
      const dateObj = assessment.created_at?.toDate?.() ?? new Date()
      const date = (dateObj instanceof Date && !isNaN(dateObj.getTime()))
        ? dateObj.toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
      link.download = `Lean-Assessment-Report-${assessment.name.replace(/\s+/g, '-')}-${date}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const sendEmail = async () => {
    if (!assessment) return
    setIsSendingEmail(true)
    setEmailError(false)
    try {
      const pdfDataUrl = await createUnifiedPDF({
        name: assessment.name,
        email: assessment.email,
        company: assessment.company,
        role: assessment.role,
        country: assessment.country,
        score: assessment.score,
        total_questions: assessment.total_questions,
        percentage: assessment.percentage,
        readiness_level: assessment.readiness_level,
        answers: assessment.answers,
        questions: questions,   // matched questions for Q&A section
        created_at: assessment.created_at
      })
      const res = await fetch('/api/send-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: assessment.name,
          email: assessment.email,
          company: assessment.company || '',
          role: assessment.role || '',
          country: assessment.country || '',
          score: assessment.score,
          totalQuestions: assessment.total_questions,
          percentage: assessment.percentage,
          readinessLevel: assessment.readiness_level,
          pdfDataUrl,
        }),
      })
      if (res.ok) setEmailSent(true)
      else setEmailError(true)
    } catch {
      setEmailError(true)
    } finally {
      setIsSendingEmail(false)
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
            <User className="mx-auto h-12 w-12 text-brand-yellow mb-4" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to view assessment reports.
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

  if (loadingAssessment) {
    return (
      <div className="min-h-screen bg-brand-lightgrey flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-yellow"></div>
          <p className="mt-4 text-brand-grey">Loading assessment...</p>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-brand-lightgrey flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <CardTitle>Assessment Not Found</CardTitle>
            <CardDescription>
              The assessment you're looking for doesn't exist or you don't have access to it.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/history">
              <Button>View Your History</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getCourseRecommendations = (level: string) => {
    const recommendations: Record<string, any> = {
      "Advanced": {
        title: "🎯 Certified Lean Practitioner Program",
        description: "You qualify for our premium certification program!",
        price: "$995",
        discount: "Save 35% for 48 hours",
        url: "https://academy.continuousimprovement.education/p/certified-lean-practitioner-training-bundle",
        coupon: "?coupon_code=kaizen60",
        features: [
          "Advanced Lean methodologies",
          "Leadership training",
          "Real-world project implementation",
          "Industry-recognized certification"
        ]
      },
      "Intermediate": {
        title: "🎯 Certified Lean Practitioner Program",
        description: "You're ready for our comprehensive certification!",
        price: "$995",
        discount: "Save 35% for 48 hours",
        url: "https://academy.continuousimprovement.education/p/certified-lean-practitioner-training-bundle",
        coupon: "?coupon_code=kaizen60",
        features: [
          "Complete Lean framework",
          "Hands-on implementation",
          "Mentorship opportunities",
          "Career advancement focus"
        ]
      },
      "Developing": {
        title: "📈 Skill Development Courses",
        description: "Build your expertise with specialized courses",
        courses: [
          {
            name: "Value Stream Mapping",
            description: "Master process visualization and optimization",
            url: "https://academy.continuousimprovement.education/p/advanced-value-stream-mapping?coupon_code=kaizen60",
            price: "20% OFF"
          },
          {
            name: "Business Process Management",
            description: "Perfect for service and non-manufacturing roles",
            url: "https://academy.continuousimprovement.education/p/business-process-management?coupon_code=kaizen60",
            price: "20% OFF"
          }
        ]
      },
      "Beginner": {
        title: "🚀 Foundational Learning Path",
        description: "Start your Lean journey with essential fundamentals",
        courses: [
          {
            name: "Toyota Production System & Lean Fundamentals",
            description: "Complete introduction to Lean principles",
            url: "https://academy.continuousimprovement.education/p/toyota-production-system-and-lean-fundamentals1?coupon_code=kaizen60",
            price: "20% OFF"
          },
          {
            name: "Scientific Problem Solving",
            description: "Learn systematic problem-solving methods",
            url: "https://academy.continuousimprovement.education/p/en-home?coupon_code=kaizen60",
            price: "20% OFF"
          }
        ]
      }
    }
    return recommendations[level] || recommendations["Beginner"]
  }

  const getPerformanceData = () => {
    if (!assessment) return null
    // Use the stored score — never recalculate from a partial question set
    const correct = assessment.score
    const total = assessment.total_questions
    const incorrect = total - correct
    return {
      correct,
      incorrect,
      total,
      percentage: assessment.percentage,
    }
  }

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'Advanced': return 'text-green-600 bg-green-50'
      case 'Intermediate': return 'text-blue-600 bg-blue-50'
      case 'Developing': return 'text-yellow-600 bg-yellow-50'
      case 'Beginner': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-brand-lightgrey py-16">
      {/* Logo Header */}
      <div className="bg-white py-4 border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/history">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to History
                </Button>
              </Link>
              <img 
                src="http://practitioner.kaizenacademy.education/logo_round.png" 
                alt="Kaizen Academy Logo" 
                className="h-16 w-auto"
              />
            </div>
            <Link href="/assessment">
              <Button>Take New Assessment</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-brand-black">Assessment Report</h1>
          <p className="text-brand-grey text-lg">
            Detailed results for {assessment.name}
          </p>
        </div>

        {/* User Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Candidate Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium">{assessment.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Company</div>
                  <div className="font-medium">{assessment.company || 'Not specified'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Role</div>
                  <div className="font-medium">{assessment.role || 'Not specified'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium">
                    {assessment.created_at?.toDate?.().toLocaleDateString() || 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Card */}
        <Card className="mb-6 border-t-4 border-t-brand-yellow shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Assessment Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Score</span>
                <span className="font-bold text-2xl text-blue-600">
                  {assessment.score}/{assessment.total_questions}
                </span>
              </div>
              <Progress value={assessment.percentage} className="h-3" />
              <div className="text-right mt-1 text-sm text-gray-600">
                {assessment.percentage.toFixed(1)}%
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-brand-yellow" />
                <div>
                  <div className="font-semibold text-lg text-brand-grey">Readiness Level</div>
                  <div className={`text-2xl font-bold px-3 py-1 rounded-lg inline-block ${getReadinessColor(assessment.readiness_level)}`}>
                    {assessment.readiness_level}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Charts */}
        {getPerformanceData() && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Analytics
              </CardTitle>
              <CardDescription>
                Visual breakdown of your assessment performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Score Distribution Chart */}
                <div className="text-center">
                  <h4 className="font-semibold mb-4">Score Distribution</h4>
                  <div className="relative h-48 flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      <svg className="transform -rotate-90 w-32 h-32">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#e5e7eb"
                          strokeWidth="12"
                          fill="none"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#10b981"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - getPerformanceData()!.percentage / 100)}`}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {getPerformanceData()!.percentage.toFixed(0)}%
                          </div>
                          <div className="text-sm text-gray-500">Score</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Correct Answers</span>
                      <span className="font-semibold text-green-600">{getPerformanceData()!.correct}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(getPerformanceData()!.correct / getPerformanceData()!.total) * 100}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Incorrect Answers</span>
                      <span className="font-semibold text-red-600">{getPerformanceData()!.incorrect}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(getPerformanceData()!.incorrect / getPerformanceData()!.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations Card */}
        <Card className="mb-6 border-t-4 border-t-brand-yellow">
          <CardHeader>
            <CardTitle>Personalized Recommendations</CardTitle>
            <CardDescription>
              Based on your {assessment.readiness_level} readiness level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {assessment.readiness_level === "Advanced" && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">🎯 Excellent Work!</h4>
                    <p className="text-green-700">
                      You demonstrate exceptional understanding of Lean principles and practices. You have strong mastery of Lean concepts and Toyota Production System principles.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Recommended Next Steps:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Lead strategic improvement initiatives with measurable ROI</li>
                      <li>• Mentor junior practitioners in Lean methodologies</li>
                      <li>• Consider advanced certification programs</li>
                      <li>• Explore organizational transformation leadership roles</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {assessment.readiness_level === "Intermediate" && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">📈 Good Progress!</h4>
                    <p className="text-blue-700">
                      You demonstrate solid Lean knowledge and practical understanding. You're ready for advanced topics and leadership roles in Lean transformation.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Recommended Next Steps:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Focus on advanced problem-solving techniques</li>
                      <li>• Consider our practitioner certification program</li>
                      <li>• Practice leading small-scale improvement projects</li>
                      <li>• Study advanced Toyota Production System concepts</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {assessment.readiness_level === "Developing" && (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">🌱 Growing Strong!</h4>
                    <p className="text-yellow-700">
                      You have foundational knowledge and are ready to deepen your understanding. Focus on practical application and real-world problem-solving to advance to the next level.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Recommended Next Steps:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Complete intermediate Lean certification courses</li>
                      <li>• Participate in hands-on workshops</li>
                      <li>• Practice value stream mapping exercises</li>
                      <li>• Study real-world Lean implementation case studies</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {assessment.readiness_level === "Beginner" && (
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-2">🚀 Great Start!</h4>
                    <p className="text-orange-700">
                      You're at the beginning of your Lean journey. This is an exciting time to build foundational knowledge! We recommend starting with our introductory courses to establish a strong understanding of Lean principles.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Recommended Next Steps:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Start with foundational Lean training programs</li>
                      <li>• Learn basic Toyota Production System principles</li>
                      <li>• Understand the 8 wastes of Lean</li>
                      <li>• Practice 5S methodology in daily work</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Course Recommendations */}
        <Card className="mb-6 border-t-4 border-t-brand-yellow shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recommended Learning Path
            </CardTitle>
            <CardDescription>
              Personalized course recommendations based on your {assessment.readiness_level} readiness level
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const recommendations = getCourseRecommendations(assessment.readiness_level)
              
              if (recommendations.courses) {
                // Multiple courses for Beginner/Developing
                return (
                  <div className="space-y-6">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{recommendations.title}</h3>
                      <p className="text-gray-600">{recommendations.description}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {recommendations.courses.map((course: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-semibold text-lg">{course.name}</h4>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-medium">
                              {course.price}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4">{course.description}</p>
                          <a 
                            href={course.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full"
                          >
                            <Button className="w-full bg-brand-yellow text-brand-black hover:bg-yellow-400 font-semibold border-0 transition-all duration-300">
                              Enroll Now
                            </Button>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              } else {
                // Single premium course for Advanced/Intermediate
                return (
                  <div className="space-y-6">
                    <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">{recommendations.title}</h3>
                      <p className="text-gray-600 mb-4">{recommendations.description}</p>
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <span className="text-3xl font-bold text-gray-800 line-through">{recommendations.price}</span>
                        <span className="text-2xl font-bold text-green-600">
                          {Math.round(995 * 0.65).toLocaleString()} USD
                        </span>
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                          {recommendations.discount}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                        <Clock className="h-4 w-4" />
                        <span>Limited time offer - Expires in 48 hours</span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">What You'll Learn:</h4>
                        <ul className="space-y-2">
                          {recommendations.features.map((feature: any, index: number) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex flex-col justify-center">
                        <a 
                          href={recommendations.url + recommendations.coupon}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Button className="w-full bg-brand-yellow text-brand-black hover:bg-yellow-400 font-semibold border-0 text-lg py-3 transition-all duration-300 transform hover:scale-105">
                            <Target className="w-5 h-5 mr-2" />
                            Get Certified Now
                          </Button>
                        </a>
                        <p className="text-center text-sm text-gray-500 mt-2">
                          Discount automatically applied at checkout
                        </p>
                      </div>
                    </div>
                  </div>
                )
              }
            })()}
          </CardContent>
        </Card>
        {questions.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Question-by-Question Analysis</CardTitle>
              <CardDescription>
                {assessment.questions && assessment.questions.length > 0
                  ? 'Review your answers and see which areas need improvement'
                  : 'Showing best-match questions from current bank — original question details not stored for this assessment'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questions.map((question, index) => {
                  const userAnswer = assessment.answers[question.id] ?? assessment.answers[String(question.id)] ?? 'Not answered'
                  const isCorrect = userAnswer === question.correctAnswer
                  
                  return (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isCorrect 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {isCorrect ? '✓' : '✗'}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium mb-2">
                            Question {index + 1}: {question.question}
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="text-gray-600">
                              <span className="font-medium">Your answer:</span> 
                              <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                {userAnswer || 'Not answered'}
                              </span>
                              {!isCorrect && (
                                <span className="text-gray-500 ml-2">
                                  (Correct: {question.correctAnswer})
                                </span>
                              )}
                            </div>
                            {question.explanation && (
                              <div className="text-gray-500 italic">
                                {question.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Button
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className="bg-brand-yellow text-brand-black hover:bg-yellow-400 font-semibold border-0"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPDF ? "Generating..." : "Download PDF Report"}
          </Button>
          <Button
            onClick={sendEmail}
            disabled={isSendingEmail || emailSent}
            variant="outline"
          >
            {isSendingEmail ? "Sending..." : emailSent ? "Email Sent ✓" : "Send Results to Email"}
          </Button>
          {emailError && (
            <p className="w-full text-sm text-red-600">Failed to send email. Please try again.</p>
          )}
          <Link href="/assessment">
            <Button variant="outline">
              Take New Assessment
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center">
          <Link href="/history">
            <Button variant="outline" className="border-brand-darkgrey text-brand-darkgrey hover:bg-brand-darkgrey hover:text-white">
              View All Assessments
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-lightgrey flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-yellow"></div>
          <p className="mt-4 text-brand-grey">Loading...</p>
        </div>
      </div>
    }>
      <ReportContent />
    </Suspense>
  )
}
