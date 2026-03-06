// Clean PDF Generator with Professional Layout
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

// Brand colors
const BRAND_COLORS = {
  yellow: [255, 213, 89],    // #ffd559
  black: [0, 0, 0],          // #000000
  darkGrey: [42, 42, 42],    // #2a2a2a
  lightGrey: [240, 240, 240], // #f0f0f0
  white: [255, 255, 255],   // #ffffff
  blue: [37, 99, 235]       // #2563eb
}

// Helper function to generate assessment ID
const generateAssessmentID = () => {
  return 'KA-' + Math.random().toString(36).substr(2, 9).toUpperCase()
}

// Helper function to add new page if needed
const checkPageBreak = (doc: jsPDF, y: number, requiredSpace: number = 20) => {
  const pageHeight = doc.internal.pageSize.getHeight()
  if (y > pageHeight - requiredSpace) {
    doc.addPage()
    return 70 // Start after header
  }
  return y
}

// Helper function to add section header
const addSectionHeader = (doc: jsPDF, title: string, y: number, margin: number) => {
  doc.setFillColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
  doc.rect(margin, y, doc.internal.pageSize.getWidth() - (margin * 2), 8, 'F')
  
  doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(title, margin + 5, y + 6)
  
  return y + 18
}

// Helper function to add text with proper wrapping
const addWrappedText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number = 6): number => {
  const lines = doc.splitTextToSize(text, maxWidth)
  lines.forEach((line: string) => {
    doc.text(line, x, y)
    y += lineHeight
  })
  return y
}

export const createEnhancedPDF = async (results: AssessmentResults): Promise<string> => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)

  // Header
  doc.setFillColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
  doc.rect(0, 0, pageWidth, 50, 'F')
  
  // Logo placeholder
  doc.setFillColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.circle(30, 25, 10, 'F')
  doc.setFillColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
  doc.circle(30, 25, 8, 'F')
  
  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text("Operational Excellence", 50, 20)
  doc.setFontSize(14)
  doc.text("Readiness Assessment Report", 50, 30)

  let y = 70

  // Executive Summary
  y = addSectionHeader(doc, "Executive Summary", y, margin)
  
  doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  
  const summaryText = `This comprehensive assessment evaluates ${results.name}'s operational excellence readiness across key Lean principles and practices. With a score of ${results.score} out of ${results.total_questions} (${Math.round(results.percentage)}%), the current readiness level is ${results.readiness_level}. This report provides detailed analysis, personalized recommendations, and a structured 90-day action plan to accelerate professional development in operational excellence.`
  
  y = addWrappedText(doc, summaryText, margin, y, contentWidth)
  y += 10

  // Candidate Information
  y = addSectionHeader(doc, "Candidate Information", y, margin)
  
  doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  
  const candidateInfo = [
    `Name: ${results.name}`,
    `Email: ${results.email}`,
    `Assessment Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    `Assessment ID: ${generateAssessmentID()}`
  ]
  
  candidateInfo.forEach((info, index) => {
    doc.text(info, margin + 5, y + (index * 6))
  })
  y += candidateInfo.length * 6 + 10

  // Assessment Results
  y = addSectionHeader(doc, "Assessment Results", y, margin)
  
  // Score display
  const scoreX = pageWidth / 2
  doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.text(`${Math.round(results.percentage)}%`, scoreX - 20, y)
  
  doc.setFontSize(16)
  doc.text(`${results.score}/${results.total_questions}`, scoreX - 25, y + 15)
  
  // Readiness Level Badge
  const readinessColors = {
    'Advanced': [34, 197, 94],
    'Intermediate': [59, 130, 246], 
    'Developing': [250, 204, 21],
    'Beginner': [249, 115, 22]
  }
  const readinessColor = readinessColors[results.readiness_level as keyof typeof readinessColors] || [107, 114, 128]
  
  doc.setFillColor(...readinessColor as [number, number, number])
  doc.roundedRect(margin, y + 30, contentWidth, 35, 5, 5, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(`Readiness Level: ${results.readiness_level}`, margin + 10, y + 50)
  
  y += 80

  // Performance Analysis
  y = addSectionHeader(doc, "Performance Analysis", y, margin)
  
  doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  
  const correctCount = results.score
  const incorrectCount = results.total_questions - results.score
  const correctPercent = Math.round((correctCount / results.total_questions) * 100)
  const incorrectPercent = Math.round((incorrectCount / results.total_questions) * 100)
  
  const performanceData = [
    `Correct: ${correctCount} (${correctPercent}%)`,
    `Incorrect: ${incorrectCount} (${incorrectPercent}%)`
  ]
  
  performanceData.forEach((data, index) => {
    doc.text(data, margin + 5, y + (index * 6))
  })
  
  // Key Insights
  y += 20
  const insights = [
    "Starting Lean journey with good potential",
    "Fundamental concepts need deeper understanding", 
    "Structured training program highly recommended"
  ]
  
  insights.forEach((insight, index) => {
    doc.text(`• ${insight}`, margin + 5, y + (index * 6))
  })
  
  y += insights.length * 6 + 10

  // Question-by-Question Analysis
  y = addSectionHeader(doc, "Question-by-Question Analysis", y, margin)
  
  doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text("Detailed breakdown of your answers:", margin + 5, y)
  y += 10

  results.questions.forEach((question, index) => {
    y = checkPageBreak(doc, y, 20)
    
    const userAnswer = results.answers[question.id]
    const isCorrect = userAnswer === question.correctAnswer
    
    // Question number and status
    if (isCorrect) {
      doc.setTextColor(34, 197, 94) // Green
      doc.text(`✓ Q${index + 1}: ${question.question.substring(0, 50)}...`, margin + 5, y)
    } else {
      doc.setTextColor(239, 68, 68) // Red
      doc.text(`✗ Q${index + 1}: ${question.question.substring(0, 50)}...`, margin + 5, y)
    }
    
    y += 6
    doc.setTextColor(BRAND_COLORS.darkGrey[0], BRAND_COLORS.darkGrey[1], BRAND_COLORS.darkGrey[2])
    doc.setFontSize(9)
    doc.text(`   Your answer: ${userAnswer} | Correct: ${question.correctAnswer}`, margin + 5, y)
    
    y += 10
  })

  // Personalized Recommendations
  y = addSectionHeader(doc, "Personalized Recommendations", y, margin)
  
  const recommendations = [
    {
      title: "1. Getting Started",
      items: [
        "Enroll in Kaizen Academy's Certified Lean Practitioner Program",
        "Learn basic terminology and concepts of Lean",
        "Understand the core principles of operational excellence",
        "Study successful Lean implementation case studies"
      ]
    },
    {
      title: "2. First Steps", 
      items: [
        "Organize your workspace using 5S principles",
        "Practice identifying the 8 types of waste",
        "Learn basic problem-solving techniques",
        "Start observing processes with a critical eye"
      ]
    },
    {
      title: "3. Building Momentum",
      items: [
        "Find a mentor or coach experienced in Lean",
        "Join improvement teams at your organization",
        "Practice one Lean tool each month",
        "Document your learning and improvement journey"
      ]
    }
  ]
  
  recommendations.forEach((category) => {
    y = checkPageBreak(doc, y, 30)
    
    doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(category.title, margin, y)
    y += 8
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    category.items.forEach((item) => {
      y = checkPageBreak(doc, y, 6)
      doc.text(`• ${item}`, margin + 5, y)
      y += 6
    })
    y += 5
  })

  // 90-Day Action Plan
  y = addSectionHeader(doc, "90-Day Action Plan", y, margin)
  
  const actionPlan = [
    { title: "Month 1", action: "Complete introductory Lean training course" },
    { title: "Month 2", action: "Organize personal workspace using 5S principles" },
    { title: "Month 3", action: "Identify and eliminate at least 3 types of waste" },
    { title: "Month 4", action: "Learn and apply basic problem-solving tools" }
  ]
  
  actionPlan.forEach((month) => {
    y = checkPageBreak(doc, y, 12)
    
    doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(month.title, margin, y)
    y += 6
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(month.action, margin + 5, y)
    y += 8
  })

  // Next Steps & Resources
  y = addSectionHeader(doc, "Next Steps & Resources", y, margin)
  
  doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  
  const nextSteps = [
    "Start with introductory Lean fundamentals course",
    "Apply 5S principles to your workspace immediately", 
    "Learn to identify 8 wastes in daily work",
    "Find a Lean mentor or join practitioner communities"
  ]
  
  nextSteps.forEach((step, index) => {
    y = checkPageBreak(doc, y, 6)
    doc.text(`• ${step}`, margin + 5, y + (index * 6))
  })

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 30
  doc.setFillColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
  doc.rect(0, footerY - 10, pageWidth, 1, 'F')
  
  doc.setTextColor(BRAND_COLORS.darkGrey[0], BRAND_COLORS.darkGrey[1], BRAND_COLORS.darkGrey[2])
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`© 2024 Kaizen Academy - continuousimprovement.education`, margin, footerY)
  doc.text(`Empowering Operational Excellence Worldwide`, margin, footerY + 5)
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} | Assessment ID: ${generateAssessmentID()}`, margin, footerY + 10)

  return doc.output('datauristring')
}
