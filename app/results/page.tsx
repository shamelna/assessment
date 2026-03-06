"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, Award, Download, Mail, TrendingUp, FileText } from "lucide-react"
import Link from "next/link"
import { saveAssessmentSubmission, isFirebaseConfigured, getFirebaseErrorMessage, AssessmentSubmission } from "@/lib/firebase"
import { createUnifiedPDF } from "@/lib/unified-pdf-generator"
import { useAuth } from "@/contexts/AuthContext"
import { getRandomQuestions } from "@/lib/questions"

function ResultsContent() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [results, setResults] = useState<any>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState(false)

  useEffect(() => {
    console.log('Results page useEffect - loading data...')
    
    // Try to get data from sessionStorage first (new method)
    const sessionData = sessionStorage.getItem('assessmentResults')
    console.log('Session data found:', !!sessionData)
    
    if (sessionData) {
      const parsedResults = JSON.parse(sessionData)
      console.log('Session data parsed:', parsedResults)
      console.log('Questions in session:', parsedResults.questions?.length || 0)
      console.log('Answers in session:', Object.keys(parsedResults.answers || {}).length)
      setResults(parsedResults)
      return
    }

    console.log('No session data, checking URL params...')
    
    // Fallback to URL params (old method)
    const score = searchParams.get('score')
    const total = searchParams.get('total_questions')
    const readiness = searchParams.get('readiness_level')
    const answersParam = searchParams.get('answers')
    const questionsParam = searchParams.get('questions')

    console.log('URL params:', { score, total, readiness, hasAnswers: !!answersParam, hasQuestions: !!questionsParam })

    if (score && total && readiness) {
      let parsedQuestions = questionsParam ? JSON.parse(questionsParam) : []
      const parsedAnswers = answersParam ? JSON.parse(answersParam) : {}
      
      // If we don't have complete questions, get the full set and match answers
      if (parsedQuestions.length < 15) {
        console.log('Incomplete questions from URL, getting full set...')
        const allQs = getRandomQuestions(15)
        parsedQuestions = allQs
        console.log('Got full question set:', allQs.length)
      }
      
      console.log('Final questions count:', parsedQuestions.length)
      console.log('Parsed answers from URL:', Object.keys(parsedAnswers).length)
      
      // Calculate actual score from answers to ensure consistency
      const actualScore = parsedQuestions.reduce((count: number, question: any) => {
        const questionId = typeof question.id === 'string' ? parseInt(question.id) : question.id
        return count + (parsedAnswers[question.id] === question.correctAnswer ? 1 : 0)
      }, 0)
      
      const results = {
        name: searchParams.get('name') || 'User',
        email: searchParams.get('email') || 'user@example.com',
        score: actualScore, // Use calculated score for consistency
        total_questions: parsedQuestions.length, // Use actual questions length
        percentage: (actualScore / parsedQuestions.length) * 100,
        readiness_level: readiness,
        answers: parsedAnswers,
        questions: parsedQuestions
      }
      console.log('URL params results:', results)
      setResults(results)
      }
  }, [searchParams, user])

  const getRecommendations = (level: string) => {
    switch (level) {
      case 'Advanced':
        return [
          'Continue mastering advanced Lean methodologies and practitioner-level implementation',
          'Lead strategic transformation initiatives across your organization',
          'Mentor others in advanced Lean principles and practices'
        ]
      case 'Intermediate':
        return [
          'Master value stream mapping and advanced process analysis techniques',
          'Apply practitioner-level tools in real-world projects',
          'Lead Kaizen events and continuous improvement activities'
        ]
      case 'Beginner':
        return [
          'Focus on building strong foundational knowledge of Lean principles',
          'Practice daily application of TPS concepts in your work',
          'Participate actively in team-based improvement projects'
        ]
      default:
        return [
          'Explore Lean learning resources to build foundational knowledge',
          'Take another assessment after completing recommended courses',
          'Focus on understanding core operational excellence concepts'
        ]
    }
  }

  const getLearningPathSteps = (level: string) => {
    switch (level) {
      case 'Advanced':
        return [
          {
            title: 'Master Lean Practitioner Skills',
            description: 'Apply practitioner-level methodologies to complex organizational challenges and lead transformation initiatives',
            duration: '4-6 weeks',
            course: 'Lean Practitioner Certification Program'
          },
          {
            title: 'Lead Strategic Projects',
            description: 'Drive organizational transformation using advanced Lean practitioner methodologies',
            duration: '8-12 weeks',
            course: 'Lean Practitioner Certification Program'
          },
          {
            title: 'Mentor & Teach',
            description: 'Share your expertise by coaching teams in advanced Lean practitioner methodologies',
            duration: 'Ongoing',
            course: 'Lean Practitioner Certification Program'
          }
        ]
      case 'Intermediate':
        return [
          {
            title: 'Master Value Stream Mapping',
            description: 'Develop expertise in advanced value stream analysis and waste elimination',
            duration: '4-6 weeks',
            course: 'Value Stream Mapping'
          },
          {
            title: 'Apply Scientific Problem Solving',
            description: 'Implement systematic problem-solving methodologies in real organizational challenges',
            duration: '6-8 weeks',
            course: 'Scientific Problem Solving'
          },
          {
            title: 'Optimize Business Processes',
            description: 'Apply business process management techniques for organizational efficiency',
            duration: '6-8 weeks',
            course: 'Business Process Management'
          }
        ]
      case 'Beginner':
        return [
          {
            title: 'Learn TPS & Lean Fundamentals',
            description: 'Master core Toyota Production System principles and foundational Lean concepts',
            duration: '2-3 weeks',
            course: 'Toyota Production System & Lean Fundamentals'
          },
          {
            title: 'Practice Daily Applications',
            description: 'Apply TPS principles to your daily work processes and immediate improvements',
            duration: '4 weeks',
            course: 'Toyota Production System & Lean Fundamentals'
          },
          {
            title: 'Join Improvement Projects',
            description: 'Participate in team projects using TPS and Lean methodologies',
            duration: '6-8 weeks',
            course: 'Toyota Production System & Lean Fundamentals'
          }
        ]
      default:
        return [
          {
            title: 'Start with TPS & Lean Fundamentals',
            description: 'Begin your Lean journey with Toyota Production System basics',
            duration: '2 weeks',
            course: 'Toyota Production System & Lean Fundamentals'
          }
        ]
    }
  }

  const getCourseRecommendations = (level: string) => {
    switch (level) {
      case 'Advanced':
        return [
          {
            title: 'Lean Practitioner Certification Program',
            description: 'Comprehensive certification program for Lean practitioners with hands-on project experience and industry recognition',
            price: '$796',
            originalPrice: '$995',
            savings: '20%',
            link: 'https://academy.continuousimprovement.education/p/certified-lean-practitioner-training-bundle?coupon_code=kaizen60'
          }
        ]
      case 'Intermediate':
        return [
          {
            title: 'Value Stream Mapping',
            description: 'Master advanced value stream mapping techniques for process optimization and waste elimination',
            price: '$71',
            originalPrice: '$89',
            savings: '20%',
            link: 'https://academy.continuousimprovement.education/p/advanced-value-stream-mapping?coupon_code=kaizen60'
          },
          {
            title: 'Scientific Problem Solving',
            description: 'Advanced methodology for complex problem-solving and process improvement using systematic approaches',
            price: '$144',
            originalPrice: '$180',
            savings: '20%',
            link: 'https://academy.continuousimprovement.education/p/en-home?coupon_code=kaizen60'
          },
          {
            title: 'Business Process Management',
            description: 'Comprehensive business process management training for organizational efficiency',
            price: '$200',
            originalPrice: '$250',
            savings: '20%',
            link: 'https://academy.continuousimprovement.education/p/business-process-management?coupon_code=kaizen60'
          }
        ]
      case 'Beginner':
        return [
          {
            title: 'Toyota Production System & Lean Fundamentals',
            description: 'Complete introduction to Toyota Production System principles and foundational Lean concepts',
            price: '$79',
            originalPrice: '$99',
            savings: '20%',
            link: 'https://academy.continuousimprovement.education/p/toyota-production-system-and-lean-fundamentals1?coupon_code=kaizen60'
          }
        ]
      default:
        return [
          {
            title: 'Toyota Production System & Lean Fundamentals',
            description: 'Get started with Toyota Production System fundamentals and basic Lean principles',
            price: '$79',
            originalPrice: '$99',
            savings: '20%',
            link: 'https://academy.continuousimprovement.education/p/toyota-production-system-and-lean-fundamentals1?coupon_code=kaizen60'
          }
        ]
    }
  }

  const saveToFirebase = async (data: any) => {
    // REQUIRED: Firebase must be configured for lead collection
    if (!isFirebaseConfigured()) {
      console.warn('Firebase not configured - skipping save to database')
      return
    }

    try {
      await saveAssessmentSubmission(data)
      console.log('Assessment results saved to Firebase')
    } catch (error) {
      console.error('Error saving to Firebase:', error)
    }
  }

  const generateEmailHTML = (results: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Assessment Results</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .score { font-size: 24px; font-weight: bold; color: #007bff; }
          .section { margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Operational Excellence Assessment Results</h1>
            <p>Hello ${results.name},</p>
            <p>Thank you for completing the assessment. Here are your results:</p>
          </div>
          
          <div class="section">
            <div class="score">Your Score: ${results.score}/${results.total_questions}</div>
            <p>Percentage: ${results.percentage.toFixed(1)}%</p>
            <p>Readiness Level: ${results.readiness_level}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  const createPDFDocument = async () => {
    setIsGeneratingPDF(true)
    try {
      const pdfDataUrl = await createUnifiedPDF({
        name: results.name,
        email: results.email,
        company: results.company,
        role: results.role,
        country: results.country,
        score: results.score,
        total_questions: results.total_questions,
        percentage: results.percentage,
        readiness_level: results.readiness_level,
        answers: results.answers,
        questions: results.questions || [],
        created_at: results.created_at
      })
      
      // Create download link
      const link = document.createElement('a')
      link.href = pdfDataUrl
      link.download = `operational-excellence-assessment-${results.name.replace(/\s+/g, '-').toLowerCase()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const sendEmailResults = async () => {
    try {
      setEmailError(false)
      setEmailSent(false)
      
      // Generate PDF and pass data URL directly (no intermediate blob fetch needed)
      const pdfDataUrl = await createUnifiedPDF(results)

      const emailData = {
        name: results.name,
        email: results.email,
        company: results.company || '',
        role: results.role || '',
        country: results.country || '',
        score: results.score,
        totalQuestions: results.total_questions,
        percentage: results.percentage,
        readinessLevel: results.readiness_level,
        pdfDataUrl: pdfDataUrl
      }
      
      // Call email API
      const emailResponse = await fetch('/api/send-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      })
      
      if (emailResponse.ok) {
        setEmailSent(true)
        console.log('Email sent successfully')
      } else {
        const errorText = await emailResponse.text()
        console.error('Email send failed:', errorText)
        setEmailError(true)
      }
      
    } catch (error) {
      console.error('Error sending email:', error)
      setEmailError(true)
    }
  }

  const getAnswer = (question: any) => {
      const questionId = typeof question.id === 'string' ? question.id : question.id.toString()
      return results.answers[questionId] || results.answers[question.id] || 'Not answered'
    }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading Results...</h2>
        </div>
      </div>
    )
  }

  const percentage = Math.round((results.score / Object.keys(results.answers || {}).length) * 100)
  const readinessColor = percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'

  return (
    <main className="min-h-screen bg-brand-lightgrey py-16">
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
        {/* Score Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6" />
              Assessment Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Overall Score</h3>
                <div className="flex items-center gap-4">
                  <Progress value={percentage} className="flex-1" />
                  <span className={`text-2xl font-bold ${readinessColor}`}>
                    {results.score}/{results.total_questions} ({percentage}%)
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Readiness Level</h3>
                <p className={`text-xl font-bold ${readinessColor}`}>
                  {results.readiness_level}
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-4">Assessment Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Name:</strong> {results.name}</p>
                  <p><strong>Email:</strong> {results.email}</p>
                </div>
                <div>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                  <p><strong>Assessment ID:</strong> {Math.random().toString(36).substr(2, 9)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights & Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Performance Summary */}
              <div>
                <h4 className="font-semibold mb-3">Performance Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-green-600">{results.score}</div>
                    <span className="text-sm text-gray-600">Correct</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-red-600">{Object.keys(results.answers || {}).length - results.score}</div>
                    <span className="text-sm text-gray-600">Incorrect</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold text-blue-600">{Object.keys(results.answers || {}).length}</div>
                    <span className="text-sm text-gray-600">Total Questions</span>
                  </div>
                </div>
              </div>

              {/* Personalized Recommendations */}
              <div>
                <h4 className="font-semibold mb-3">Recommended Next Steps</h4>
                <div className="space-y-2">
                  {getRecommendations(results.readiness_level).map((recommendation: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Your Path Forward</h4>
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <p className="text-sm mb-3">
                    {results.readiness_level === 'Beginner' || results.readiness_level === 'Developing' ? (
                      <>
                        Based on your {results.readiness_level.toLowerCase()} readiness level, we recommend focusing on 
                        areas above to enhance your operational excellence capabilities.
                      </>
                    ) : (
                      <>
                        Based on your {results.readiness_level.toLowerCase()} readiness level, we recommend focusing on 
                        areas below to enhance your operational excellence capabilities.
                      </>
                    )}
                  </p>
                  <div className="flex gap-3">
                    {results.readiness_level === 'Beginner' || results.readiness_level === 'Developing' ? (
                      <>
                        <Link href="/assessment/landing">
                          <Button size="sm">Explore Lean Learning Resources</Button>
                        </Link>
                        <Link href="/assessment/landing">
                          <Button variant="outline" size="sm">Take Another Assessment</Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/assessment/landing">
                          <Button size="sm">Retake Assessment</Button>
                        </Link>
                        <Link href="/history">
                          <Button variant="outline" size="sm">View Progress</Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Learning Path */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Your Personalized Learning Path
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  {results.readiness_level} Level Path
                </h4>
                <p className="text-sm text-gray-700 mb-4">
                  Based on your assessment results, here's your recommended learning journey:
                </p>
                
                {/* Learning Path Steps */}
                <div className="space-y-3">
                  {getLearningPathSteps(results.readiness_level).map((step: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-sm">{step.title}</h5>
                        <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                        {step.duration && (
                          <p className="text-xs text-yellow-600 mt-1">⏱️ {step.duration}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Course Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getCourseRecommendations(results.readiness_level).map((course: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h5 className="font-semibold text-sm mb-2">{course.title}</h5>
                    <p className="text-xs text-gray-600 mb-3">{course.description}</p>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-sm font-bold text-green-600">{course.price}</span>
                        {course.originalPrice && (
                          <span className="text-xs text-gray-500 line-through ml-2">{course.originalPrice}</span>
                        )}
                      </div>
                      {course.savings && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                          Save {course.savings}
                        </span>
                      )}
                    </div>
                    <Button size="sm" className="text-xs w-full" asChild>
                      <a href={course.link} target="_blank" rel="noopener noreferrer">
                        Enroll Now
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={createPDFDocument} disabled={isGeneratingPDF} className="w-full">
                {isGeneratingPDF ? (
                  <>
                    <Download className="w-4 h-4 mr-2 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF Report
                  </>
                )}
              </Button>
              
              <Button onClick={sendEmailResults} disabled={emailSent} variant="outline" className="w-full">
                {emailSent ? (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Email Sent ✓
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Results to Email
                  </>
                )}
              </Button>
              
              <Link href="/assessment/landing">
                <Button variant="outline" className="w-full">
                  Take Another Assessment
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="ghost" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detailed Question Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Performance Visual Chart */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">Performance Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium mb-2">Score Distribution</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Correct Answers</span>
                        <span className="font-bold text-green-600">{results.score}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Incorrect Answers</span>
                        <span className="font-bold text-red-600">{Object.keys(results.answers || {}).length - results.score}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Success Rate</span>
                        <span className="font-bold text-blue-600">{percentage}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Performance Level</h5>
                    <div className="relative pt-4">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs">
                        <span>Beginner</span>
                        <span>Advanced</span>
                      </div>
                      <div className="text-center mt-2">
                        <span className={`font-bold ${
                          percentage < 33 ? 'text-red-600' : 
                          percentage < 66 ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {results.readiness_level}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* All Questions Review */}
              <div className="space-y-4">
                {Object.entries(results.answers || {}).map(([questionId, userAnswer], index) => {
                  const question = results.questions?.find((q: any) => q.id.toString() === questionId)
                  const isCorrect = String(userAnswer) === String(question?.correctAnswer)
                  
                  if (!question) {
                    return null // Skip if question not found
                  }
                  
                  return (
                    <div 
                      key={questionId} 
                      className={`border rounded-lg p-4 ${
                        isCorrect 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isCorrect ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : (
                            <XCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium mb-2">
                            Question {index + 1}: {question.question}
                          </p>
                          <div className="text-sm space-y-1">
                            <p>
                              <strong>Your answer:</strong> {String(userAnswer)}
                            </p>
                            <p>
                              <strong>Correct answer:</strong> {String(question.correctAnswer)}
                            </p>
                            {question.explanation && (
                              <p className="text-gray-600">
                                <strong>Explanation:</strong> {question.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 space-y-4">
          <p className="text-gray-600">
            Thank you for completing the Operational Excellence Assessment.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/history">
              <Button variant="outline" size="sm">
                View History
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" size="sm">
                Update Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Loading Results...</h2>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
