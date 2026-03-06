// Enhanced PDF Generator with Brand Colors and Comprehensive Recommendations
import { jsPDF } from 'jspdf'

export interface AssessmentResults {
  name: string
  email: string
  company?: string
  role?: string
  country?: string
  score: number
  total_questions: number
  percentage: number
  readiness_level: string
  answers: Record<string, string>
  questions: any[]
}

// Brand colors from your CSS
const BRAND_COLORS = {
  yellow: [255, 213, 89],    // #ffd559
  black: [0, 0, 0],          // #000000
  darkGrey: [42, 42, 42],    // #2a2a2a
  lightGrey: [240, 240, 240], // #f0f0f0
  white: [255, 255, 255],   // #ffffff
  blue: [37, 99, 235]       // #2563eb (for accents)
}

// Helper function to process text with bold formatting
const processTextWithBold = (text: string): { text: string, boldIndices: number[] } => {
  const boldIndices: number[] = []
  let processedText = text
  
  // Find all *text* patterns and mark them for bold rendering
  const boldPattern = /\*([^*]+)\*/g
  let match
  let offset = 0
  
  while ((match = boldPattern.exec(text)) !== null) {
    const boldText = match[1]
    const startIndex = match.index - offset
    const endIndex = startIndex + boldText.length
    
    // Store the indices for bold text
    boldIndices.push(startIndex, endIndex)
    
    // Remove the asterisks from the text
    processedText = processedText.replace(`*${boldText}*`, boldText)
    offset += 2 // Account for removed asterisks
  }
  
  return { text: processedText, boldIndices }
}

export const createEnhancedPDF = async (results: AssessmentResults): Promise<string> => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)

  // Helper function to add new page if needed
  const checkPageBreak = (y: number, requiredSpace: number = 20) => {
    if (y > pageHeight - requiredSpace) {
      doc.addPage()
      // Add header to new page
      doc.setFillColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
      doc.rect(0, 0, pageWidth, 40, 'F')
      doc.setFontSize(16)
      doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
      doc.text("Assessment Report (continued)", margin, 55)
      return 70
    }
    return y
  }

  // Add subtle background watermark
  doc.setFillColor(255, 213, 89, 13) // Brand yellow with very low opacity
  doc.setFontSize(48)
  doc.text("KAIZEN", pageWidth / 2 - 40, pageHeight / 2, { angle: 45 })

  // Add colored header bar
  doc.setFillColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  // Add logo placeholder
  doc.setFillColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.circle(30, 20, 8, 'F')
  doc.setFillColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
  doc.circle(30, 20, 6, 'F')
  
  // Add title
  doc.setFontSize(20)
  doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.text("Operational Excellence", 50, 25)
  
  // Add subtitle
  doc.setFontSize(12)
  doc.setTextColor(BRAND_COLORS.darkGrey[0], BRAND_COLORS.darkGrey[1], BRAND_COLORS.darkGrey[2])
  doc.text("Readiness Assessment Report", 50, 32)

  // User info section
  let y = 60
  doc.setFillColor(BRAND_COLORS.lightGrey[0], BRAND_COLORS.lightGrey[1], BRAND_COLORS.lightGrey[2])
  doc.roundedRect(margin, y - 10, contentWidth, 40, 3, 3, 'F')
  
  doc.setFontSize(14)
  doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.text("Candidate Information", margin + 5, y)
  
  y += 10
  doc.setFontSize(11)
  doc.setTextColor(BRAND_COLORS.darkGrey[0], BRAND_COLORS.darkGrey[1], BRAND_COLORS.darkGrey[2])
  
  const userInfo = [
    `Name: ${results.name}`,
    `Email: ${results.email}`,
    results.company ? `Company: ${results.company}` : null,
    results.role ? `Role: ${results.role}` : null,
    results.country ? `Country: ${results.country}` : null,
    `Assessment Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    `Assessment ID: ${generateAssessmentID()}`
  ].filter(Boolean)
  
  userInfo.forEach((info, index) => {
    if (info) {
      doc.text(info, margin + 5, y + (index * 5))
    }
  })

  // Score section with enhanced visual elements
  y = 110
  doc.setFillColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
  doc.roundedRect(margin, y - 10, contentWidth, 80, 3, 3, 'F')
  
  doc.setFontSize(16)
  doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.text("Assessment Results", margin + 5, y)
  
  y += 15
  
  // Large score visualization
  const scoreCircleX = pageWidth / 2
  const scoreCircleY = y + 20
  const scoreCircleRadius = 25
  
  // Background circle
  doc.setFillColor(BRAND_COLORS.lightGrey[0], BRAND_COLORS.lightGrey[1], BRAND_COLORS.lightGrey[2])
  doc.circle(scoreCircleX, scoreCircleY, scoreCircleRadius, 'F')
  
  // Progress arc
  doc.setLineWidth(4)
  doc.setDrawColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
  const startAngle = -90
  const endAngle = startAngle + (360 * results.percentage / 100)
  
  // Draw arc manually
  const steps = 50
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / steps)
    const x = scoreCircleX + scoreCircleRadius * Math.cos(angle * Math.PI / 180)
    const y = scoreCircleY + scoreCircleRadius * Math.sin(angle * Math.PI / 180)
    if (i === 0) {
      doc.moveTo(x, y)
    } else {
      doc.lineTo(x, y)
    }
  }
  doc.stroke()
  
  // Score text in circle
  doc.setFontSize(16)
  doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.text(`${results.percentage.toFixed(1)}%`, scoreCircleX - 10, scoreCircleY + 5)
  doc.setFontSize(10)
  doc.text(`${results.score}/${results.total_questions}`, scoreCircleX - 12, scoreCircleY + 12)
  
  y += 55
  
  // Readiness level with enhanced styling
  const levelColors: Record<string, number[]> = {
    "Advanced": [34, 197, 94],    // Green
    "Intermediate": [59, 130, 246], // Blue
    "Developing": [251, 191, 36],   // Yellow
    "Beginner": [249, 115, 22]     // Orange
  }
  
  const levelColor = levelColors[results.readiness_level] || BRAND_COLORS.darkGrey
  
  doc.setFillColor(levelColor[0], levelColor[1], levelColor[2])
  doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F')
  
  doc.setFontSize(14)
  doc.setTextColor(BRAND_COLORS.white[0], BRAND_COLORS.white[1], BRAND_COLORS.white[2])
  doc.text(`Readiness Level: ${results.readiness_level}`, margin + 10, y + 13)
  
  // Performance Analysis
  y = 210
  y = checkPageBreak(y, 100)
  
  doc.setFillColor(BRAND_COLORS.lightGrey[0], BRAND_COLORS.lightGrey[1], BRAND_COLORS.lightGrey[2])
  doc.roundedRect(margin, y - 10, contentWidth, 90, 3, 3, 'F')
  
  doc.setFontSize(16)
  doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.text("Performance Analysis", margin + 5, y)
  
  y += 15
  
  // Performance bars
  const correctCount = results.score
  const incorrectCount = results.total_questions - results.score
  
  // Correct answers bar
  doc.setFillColor(BRAND_COLORS.lightGrey[0], BRAND_COLORS.lightGrey[1], BRAND_COLORS.lightGrey[2])
  doc.rect(margin + 10, y, contentWidth - 20, 8, 'F')
  doc.setFillColor(34, 197, 94) // Green
  const correctWidth = ((contentWidth - 20) * correctCount) / results.total_questions
  doc.rect(margin + 10, y, correctWidth, 8, 'F')
  
  doc.setFontSize(10)
  doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.text(`Correct: ${correctCount} (${((correctCount / results.total_questions) * 100).toFixed(1)}%)`, margin + 10, y - 3)
  
  y += 15
  
  // Incorrect answers bar
  doc.setFillColor(BRAND_COLORS.lightGrey[0], BRAND_COLORS.lightGrey[1], BRAND_COLORS.lightGrey[2])
  doc.rect(margin + 10, y, contentWidth - 20, 8, 'F')
  doc.setFillColor(239, 68, 68) // Red
  const incorrectWidth = ((contentWidth - 20) * incorrectCount) / results.total_questions
  doc.rect(margin + 10, y, incorrectWidth, 8, 'F')
  
  doc.setFontSize(10)
  doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.text(`Incorrect: ${incorrectCount} (${((incorrectCount / results.total_questions) * 100).toFixed(1)}%)`, margin + 10, y - 3)
  
  y += 20
  
  // Key insights
  const insights = getPerformanceInsights(results.readiness_level, results.percentage)
  doc.setFontSize(10)
  doc.setTextColor(BRAND_COLORS.darkGrey[0], BRAND_COLORS.darkGrey[1], BRAND_COLORS.darkGrey[2])
  insights.forEach((insight, index) => {
    doc.text(`• ${insight}`, margin + 10, y + (index * 5))
  })

  // Question-by-Question Breakdown
  y = 310
  y = checkPageBreak(y, 150)
  
  doc.setFillColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.roundedRect(margin, y - 10, contentWidth, 25, 3, 3, 'F')
  
  doc.setFontSize(16)
  doc.setTextColor(BRAND_COLORS.white[0], BRAND_COLORS.white[1], BRAND_COLORS.white[2])
  doc.text("Question-by-Question Analysis", margin + 5, y)
  
  y += 15
  
  doc.setFontSize(10)
  doc.setTextColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
  doc.text("Detailed breakdown of your answers:", margin + 5, y)
  
  y += 10
  
  // Add question analysis
  results.questions.forEach((question, index) => {
    y = checkPageBreak(y, 25)
    
    const userAnswer = results.answers[question.id]
    const isCorrect = userAnswer === question.correctAnswer
    
    // Process question text for bold formatting
    const processedQuestion = processTextWithBold(question.question.substring(0, 60) + "...")
    
    // Question number and status
    doc.setFontSize(9)
    if (isCorrect) {
      doc.setTextColor(34, 197, 94) // Green
      doc.text(`✓ Q${index + 1}: ${processedQuestion.text}`, margin + 5, y)
    } else {
      doc.setTextColor(239, 68, 68) // Red
      doc.text(`✗ Q${index + 1}: ${processedQuestion.text}`, margin + 5, y)
    }
    
    // Render bold text if needed
    if (processedQuestion.boldIndices.length > 0) {
      doc.setFont('helvetica', 'bold')
      for (let i = 0; i < processedQuestion.boldIndices.length; i += 2) {
        const startIdx = processedQuestion.boldIndices[i]
        const endIdx = processedQuestion.boldIndices[i + 1]
        const boldText = processedQuestion.text.substring(startIdx, endIdx)
        const xPos = margin + 5 + doc.getTextWidth(`✓ Q${index + 1}: ${processedQuestion.text.substring(0, startIdx)}`)
        doc.text(boldText, xPos, y)
      }
      doc.setFont('helvetica', 'normal')
    }
    
    y += 6
    doc.setFontSize(8)
    doc.setTextColor(BRAND_COLORS.darkGrey[0], BRAND_COLORS.darkGrey[1], BRAND_COLORS.darkGrey[2])
    doc.text(`   Your answer: ${userAnswer} | Correct: ${question.correctAnswer}`, margin + 5, y)
    
    y += 8
  })

  // Comprehensive Recommendations
  y = checkPageBreak(y, 120)
  
  doc.setFillColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
  doc.roundedRect(margin, y - 10, contentWidth, 120, 3, 3, 'F')
  
  doc.setFontSize(16)
  doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.text("Personalized Recommendations", margin + 5, y)
  
  y += 15
  const recommendations = getComprehensiveRecommendations(results.readiness_level)
  
  recommendations.forEach((rec, index) => {
    y = checkPageBreak(y, 30)
    
    doc.setFontSize(10)
    doc.setTextColor(BRAND_COLORS.darkGrey[0], BRAND_COLORS.darkGrey[1], BRAND_COLORS.darkGrey[2])
    
    // Category title
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${rec.category}`, margin + 5, y)
    doc.setFont('helvetica', 'normal')
    
    y += 6
    // Recommendation details
    rec.items.forEach((item, itemIndex) => {
      doc.text(`   • ${item}`, margin + 10, y + (itemIndex * 5))
    })
    
    y += (rec.items.length * 5) + 8
  })

  // 90-Day Action Plan
  y = checkPageBreak(y, 80)
  
  doc.setFillColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.roundedRect(margin, y - 10, contentWidth, 80, 3, 3, 'F')
  
  doc.setFontSize(16)
  doc.setTextColor(BRAND_COLORS.white[0], BRAND_COLORS.white[1], BRAND_COLORS.white[2])
  doc.text("90-Day Action Plan", margin + 5, y)
  
  y += 15
  const actionPlan = getActionPlan(results.readiness_level)
  actionPlan.forEach((action, index) => {
    doc.setFontSize(10)
    doc.setTextColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
    doc.text(`Month ${index + 1}:`, margin + 10, y)
    doc.setTextColor(BRAND_COLORS.white[0], BRAND_COLORS.white[1], BRAND_COLORS.white[2])
    doc.text(action, margin + 35, y)
    y += 6
  })

  // Next Steps & Resources
  y = checkPageBreak(y, 60)
  
  doc.setFillColor(BRAND_COLORS.lightGrey[0], BRAND_COLORS.lightGrey[1], BRAND_COLORS.lightGrey[2])
  doc.roundedRect(margin, y - 10, contentWidth, 60, 3, 3, 'F')
  
  doc.setFontSize(16)
  doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.text("Next Steps & Resources", margin + 5, y)
  
  y += 15
  const resources = getNextSteps(results.readiness_level)
  resources.forEach((resource, index) => {
    doc.setFontSize(9)
    doc.setTextColor(BRAND_COLORS.darkGrey[0], BRAND_COLORS.darkGrey[1], BRAND_COLORS.darkGrey[2])
    doc.text(`• ${resource}`, margin + 10, y + (index * 5))
  })

  // Footer
  const footerY = pageHeight - 30
  doc.setFillColor(BRAND_COLORS.darkGrey[0], BRAND_COLORS.darkGrey[1], BRAND_COLORS.darkGrey[2])
  doc.rect(0, footerY - 10, pageWidth, 30, 'F')
  
  doc.setFontSize(9)
  doc.setTextColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
  doc.text("© 2024 Kaizen Academy - continuousimprovement.education", margin, footerY)
  doc.setTextColor(BRAND_COLORS.white[0], BRAND_COLORS.white[1], BRAND_COLORS.white[2])
  doc.text("Empowering Operational Excellence Worldwide", margin, footerY + 7)
  doc.text(`Generated on ${new Date().toLocaleDateString()} | Assessment ID: ${generateAssessmentID()}`, margin, footerY + 14)
  
  return doc.output('datauristring')
}

function generateAssessmentID(): string {
  return 'KA-' + Date.now().toString(36).toUpperCase()
}

function getPerformanceInsights(readinessLevel: string, percentage: number): string[] {
  const insights: Record<string, string[]> = {
    "Advanced": [
      "Exceptional performance across all assessment areas",
      "Ready for leadership roles in operational excellence",
      "Consider mentoring others and leading strategic initiatives"
    ],
    "Intermediate": [
      "Strong foundational knowledge with room for advanced growth",
      "Good understanding of core Lean principles",
      "Ready for more complex improvement projects"
    ],
    "Developing": [
      "Building solid foundation in Lean concepts",
      "Basic understanding established, needs practical application",
      "Focus on hands-on implementation recommended"
    ],
    "Beginner": [
      "Starting Lean journey with good potential",
      "Fundamental concepts need deeper understanding",
      "Structured training program highly recommended"
    ]
  }
  
  return insights[readinessLevel] || insights["Beginner"]
}

function getNextSteps(readinessLevel: string): string[] {
  const steps: Record<string, string[]> = {
    "Advanced": [
      "Enroll in Advanced Lean Practitioner or Master Black Belt program",
      "Join industry conferences and professional networks",
      "Consider consulting or internal coaching roles",
      "Publish case studies or speak at industry events"
    ],
    "Intermediate": [
      "Complete Certified Lean Practitioner program",
      "Lead cross-functional improvement projects",
      "Develop mentoring and coaching skills",
      "Study advanced statistical analysis methods"
    ],
    "Developing": [
      "Complete foundational Lean training courses",
      "Practice 5S and visual management daily",
      "Join improvement teams at your organization",
      "Read key Lean literature (Toyota Way, Lean Thinking)"
    ],
    "Beginner": [
      "Start with introductory Lean fundamentals course",
      "Apply 5S principles to your workspace immediately",
      "Learn to identify the 8 wastes in daily work",
      "Find a Lean mentor or join practitioner communities"
    ]
  }
  
  return steps[readinessLevel] || steps["Beginner"]
}

function getDetailedAnalysis(readinessLevel: string, percentage: number): string[] {
  const analyses: Record<string, string[]> = {
    "Advanced": [
      "You demonstrate exceptional understanding of Lean principles and practices",
      "Your problem-solving skills show advanced analytical thinking",
      "You're ready for leadership roles in operational excellence initiatives",
      "Consider mentoring others and leading improvement projects"
    ],
    "Intermediate": [
      "You have solid foundational knowledge of Lean concepts",
      "Your understanding of waste identification and elimination is good",
      "You're ready to take on more complex improvement projects",
      "Focus on developing advanced analytical and leadership skills"
    ],
    "Developing": [
      "You're building a good foundation in Lean principles",
      "Your understanding of basic concepts is developing well",
      "You need more practice with practical application",
      "Focus on hands-on implementation and real-world projects"
    ],
    "Beginner": [
      "You're starting your Lean journey with enthusiasm",
      "Basic concepts are familiar but need deeper understanding",
      "You'll benefit from structured training and guidance",
      "Focus on fundamentals and practical application"
    ]
  }
  
  return analyses[readinessLevel] || analyses["Beginner"]
}

function getComprehensiveRecommendations(readinessLevel: string): Array<{category: string, items: string[]}> {
  const recommendations: Record<string, Array<{category: string, items: string[]}>> = {
    "Advanced": [
      {
        category: "Leadership Development",
        items: [
          "Lead cross-functional improvement projects",
          "Mentor junior practitioners in Lean methodologies",
          "Develop strategic thinking for operational excellence",
          "Create and present business cases for improvements"
        ]
      },
      {
        category: "Advanced Tools & Techniques",
        items: [
          "Master Six Sigma methodologies and statistical analysis",
          "Implement advanced process mapping and value stream mapping",
          "Develop expertise in Theory of Constraints",
          "Learn advanced problem-solving frameworks (A3, 8D, etc.)"
        ]
      },
      {
        category: "Continuous Improvement Culture",
        items: [
          "Design and implement Kaizen event programs",
          "Create employee suggestion systems and recognition programs",
          "Develop metrics and KPI systems for continuous monitoring",
          "Build a culture of problem-solving and innovation"
        ]
      }
    ],
    "Intermediate": [
      {
        category: "Skill Enhancement",
        items: [
          "Complete Certified Lean Practitioner training program",
          "Practice 5S implementation in your work area",
          "Learn and apply root cause analysis techniques",
          "Develop skills in process mapping and flow analysis"
        ]
      },
      {
        category: "Practical Application",
        items: [
          "Lead small-scale improvement projects",
          "Participate in Kaizen events and improvement activities",
          "Apply waste identification in daily work processes",
          "Practice visual management and standardized work"
        ]
      },
      {
        category: "Knowledge Building",
        items: [
          "Study advanced Lean concepts and methodologies",
          "Learn about different Lean frameworks (Toyota Production System, etc.)",
          "Read case studies of successful Lean implementations",
          "Network with other Lean practitioners"
        ]
      }
    ],
    "Developing": [
      {
        category: "Foundation Building",
        items: [
          "Complete foundational Lean training course",
          "Learn the 8 wastes of Lean and how to identify them",
          "Understand the 5S methodology and workplace organization",
          "Study basic process mapping techniques"
        ]
      },
      {
        category: "Hands-On Practice",
        items: [
          "Apply 5S principles to your personal workspace",
          "Practice identifying waste in daily activities",
          "Participate in team improvement activities",
          "Create simple visual aids and standard work instructions"
        ]
      },
      {
        category: "Learning Resources",
        items: [
          'Read "The Toyota Way" and "Lean Thinking" books',
          "Watch online tutorials on Lean methodologies",
          "Join Lean practitioner communities and forums",
          "Attend workshops and seminars on operational excellence"
        ]
      }
    ],
    "Beginner": [
      {
        category: "Getting Started",
        items: [
          "Enroll in Kaizen Academy's Certified Lean Practitioner Program",
          "Learn basic terminology and concepts of Lean",
          "Understand the core principles of operational excellence",
          "Study successful Lean implementation case studies"
        ]
      },
      {
        category: "First Steps",
        items: [
          "Organize your workspace using 5S principles",
          "Practice identifying the 8 types of waste",
          "Learn basic problem-solving techniques",
          "Start observing processes with a critical eye"
        ]
      },
      {
        category: "Building Momentum",
        items: [
          "Find a mentor or coach experienced in Lean",
          "Join improvement teams at your organization",
          "Practice one Lean tool each month",
          "Document your learning and improvement journey"
        ]
      }
    ]
  }
  
  return recommendations[readinessLevel] || recommendations["Beginner"]
}

function getActionPlan(readinessLevel: string): string[] {
  const plans: Record<string, string[]> = {
    "Advanced": [
      "Lead strategic improvement initiative with measurable ROI",
      "Mentor 3+ junior practitioners in Lean methodologies",
      "Complete advanced certification (Black Belt or equivalent)",
      "Present at industry conference on operational excellence"
    ],
    "Intermediate": [
      "Complete 2-3 improvement projects with documented results",
      "Achieve Lean Practitioner certification",
      "Lead a Kaizen event or improvement workshop",
      "Develop and implement standardized work for key processes"
    ],
    "Developing": [
      "Complete foundational Lean training program",
      "Successfully implement 5S in your work area",
      "Participate in at least one improvement project",
      "Demonstrate waste identification and elimination skills"
    ],
    "Beginner": [
      "Complete introductory Lean training course",
      "Organize personal workspace using 5S principles",
      "Identify and eliminate at least 3 types of waste",
      "Learn and apply basic problem-solving tools"
    ]
  }
  
  return plans[readinessLevel] || plans["Beginner"]
}
