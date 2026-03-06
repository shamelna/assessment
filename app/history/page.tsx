"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { getUserAssessments, AssessmentSubmission } from '@/lib/firebase'
import { createUnifiedPDF } from '@/lib/unified-pdf-generator'
import { getRandomQuestions } from '@/lib/questions'
import { History, Calendar, TrendingUp, Award, Eye, Download } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function HistoryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [assessments, setAssessments] = useState<AssessmentSubmission[]>([])
  const [loadingAssessments, setLoadingAssessments] = useState(true)
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadAssessments()
    }
  }, [user])

  const loadAssessments = async () => {
    if (!user) return
    try {
      setLoadingAssessments(true)
      const userAssessments = await getUserAssessments(user.uid)
      setAssessments(userAssessments)
    } catch (error) {
      console.error('Error loading assessments:', error)
    } finally {
      setLoadingAssessments(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  const downloadPDF = async (assessment: AssessmentSubmission) => {
    if (downloadingPDF === assessment.id || !assessment.id) return
    
    setDownloadingPDF(assessment.id)
    
    try {
      // Get questions for this assessment
      const questions = getRandomQuestions(15)
      
      // Create PDF data with summary
      const pdfData = {
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
        
        // Add summary statistics
        averageScore: assessments.length > 0 ? Math.round(assessments.reduce((sum, a) => sum + a.percentage, 0) / assessments.length) : 0,
        totalAssessments: assessments.length,
        bestScore: Math.max(...assessments.map(a => a.percentage)),
        worstScore: Math.min(...assessments.map(a => a.percentage)),
        
        // Performance breakdown
        correctAnswers: Object.values(assessment.answers).filter(answer => {
          const question = questions.find(q => q.id.toString() === answer)
          return answer === question?.correctAnswer
        }).length,
        
        // Recommendations based on readiness level
        recommendations: getRecommendations(assessment.readiness_level)
      }
      
      // Generate PDF
      const pdfDataUrl = await createUnifiedPDF(pdfData)
      
      // Download PDF
      const link = document.createElement('a')
      link.href = pdfDataUrl
      link.download = `Lean-Assessment-${assessment.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setDownloadingPDF(null)
    }
  }

  const getRecommendations = (level: string) => {
    switch (level) {
      case 'Advanced':
        return [
          'Focus on advanced Lean implementation strategies',
          'Consider Lean Six Sigma certification',
          'Mentor others in Lean methodologies'
        ]
      case 'Intermediate':
        return [
          'Strengthen foundational Lean knowledge',
          'Practice value stream mapping',
          'Join improvement projects or Kaizen events'
        ]
      case 'Beginner':
        return [
          'Start with Lean fundamentals training',
          'Learn 8 wastes identification',
          'Practice 5S methodology',
          'Consider foundational certification'
        ]
      default:
        return [
          'Take an assessment to determine your level',
          'Explore Lean learning resources'
        ]
    }
  }

  const getAverageScore = () => {
    if (assessments.length === 0) return 0
    const total = assessments.reduce((sum, assessment) => sum + assessment.percentage, 0)
    return Math.round(total / assessments.length)
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
            <History className="mx-auto h-12 w-12 text-brand-yellow mb-4" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to view your assessment history.
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
            <div className="flex gap-2">
              <Link href="/assessment">
                <Button>Take Assessment</Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline">Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-brand-black">Assessment History</h1>
          <p className="text-brand-grey text-lg">
            Track your progress and review past Lean assessments
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <History className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{assessments.length}</div>
              <div className="text-sm text-gray-600">Total Assessments</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{getAverageScore()}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {assessments.filter(a => a.readiness_level === 'Advanced').length}
              </div>
              <div className="text-sm text-gray-600">Advanced Scores</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {assessments.length > 0 ? formatDate(assessments[0].created_at).split(',')[0] : 'Never'}
              </div>
              <div className="text-sm text-gray-600">Last Assessment</div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Assessment Reports</CardTitle>
            <CardDescription>
              Click on any assessment to view detailed results and download your report
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAssessments ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow mx-auto"></div>
                <p className="mt-2 text-brand-grey">Loading assessments...</p>
              </div>
            ) : assessments.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Yet</h3>
                <p className="text-gray-500 mb-4">
                  You haven't completed any Lean assessments yet.
                </p>
                <Link href="/assessment">
                  <Button>Take Your First Assessment</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <div key={assessment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">
                          {assessment.name || 'Assessment'} - {assessment.readiness_level}
                        </h3>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReadinessColor(assessment.readiness_level)}`}>
                            {assessment.readiness_level}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(assessment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Performance Summary */}
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Score:</span> 
                        <span className="ml-2 font-bold text-blue-600">
                          {assessment.score}/{assessment.total_questions} ({assessment.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Company:</span> 
                        <span className="ml-2">{assessment.company || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Role:</span> 
                        <span className="ml-2">{assessment.role || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> 
                        <span className="ml-2">{formatDate(assessment.created_at)}</span>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Recommended Next Steps</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {getRecommendations(assessment.readiness_level).map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      <Link href={`/report?id=${assessment.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadPDF(assessment)}
                        disabled={downloadingPDF === assessment.id}
                      >
                        {downloadingPDF === assessment.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
