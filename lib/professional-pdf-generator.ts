import jsPDF from 'jspdf'

// TypeScript interfaces
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
  created_at?: string
}

// TypeScript interfaces
interface RecommendationAction {
  text: string
  why: string
  time: string
}

interface RecommendationStage {
  icon: string
  title: string
  description: string
  actions: RecommendationAction[]
}

interface ActionPlanMilestone {
  month: string
  objective: string
  success: string
}

interface Course {
  title: string
  description: string
  price?: string
  originalPrice?: string
  savings?: string
}

interface PriorityAction {
  title: string
  description: string
}

// Web-safe icon constants
const ICONS = {
  check: '\u2713', // ✓
  cross: '\u2717', // ✗
  lightbulb: '[!]', // [!] instead of 💡
  target: '[*]', // [*] instead of 🎯
  phase: '[#]', // [#] instead of numbered phases
  arrow: '\u2192', // →
  bullet: '\u2022', // •
  circle: '\u25cf', // ●
  clock: '[Time:]', // instead of ⏱️
  book: '[Read:]', // instead of 📚
  video: '[Watch:]', // instead of 📹
  link: '[Link:]', // instead of 🔗
  mail: '[Email:]', // instead of 📧
  phone: '[Call:]', // instead of 📞
  location: '[Location:]', // instead of 📍
  calendar: '[Date:]', // instead of 📅
  document: '[Document:]', // instead of 📄
  warning: '[!]', // instead of ⚠️
  info: '[i]', // instead of ℹ️
  success: '[OK]', // instead of ✅
  error: '[X]', // instead of ❌
}

// Professional color palette
const COLORS = {
  primary: [255, 213, 89],     // #FFD559 - Kaizen Yellow
  black: [0, 0, 0],           // #000000
  darkGrey: [51, 51, 51],     // #333333
  mediumGrey: [128, 128, 128], // #808080
  lightGrey: [245, 245, 245],  // #F5F5F5
  white: [255, 255, 255],     // #FFFFFF
  success: [76, 175, 80],      // #4CAF50 - Green
  error: [244, 67, 54],       // #F44336 - Red
  info: [33, 150, 243],       // #2196F3 - Blue
  warning: [255, 152, 0]      // #FF9800 - Orange
}

// Typography settings
const FONTS = {
  h1: 28,
  h2: 20,
  h3: 16,
  body: 11,
  caption: 9
}

export class ProfessionalPDFGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin: number
  private contentWidth: number
  private currentY: number
  private currentPage: number

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter'
    })
    
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.margin = 54 // 0.75 inches
    this.contentWidth = this.pageWidth - (this.margin * 2)
    this.currentY = this.margin
    this.currentPage = 1
  }

  private generateAssessmentID(): string {
    return 'KA-' + Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  private addText(text: string, x: number, y: number, fontSize: number, color: number[], align: 'left' | 'center' | 'right' = 'left'): void {
    this.doc.setTextColor(color[0], color[1], color[2])
    this.doc.setFontSize(fontSize)
    this.doc.text(text, x, y, { align })
  }

  private addSectionTitle(title: string, subtitle?: string): void {
    this.checkPageBreak(40)
    
    // Title
    this.addText(title, this.margin, this.currentY, FONTS.h1, COLORS.black)
    this.currentY += 25
    
    // Subtitle
    if (subtitle) {
      this.addText(subtitle, this.margin, this.currentY, FONTS.body, COLORS.darkGrey)
      this.currentY += 15
    }
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number, fillColor: number[], borderColor: number[], borderWidth: number = 1): void {
    this.doc.setFillColor(fillColor[0], fillColor[1], fillColor[2])
    this.doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
    this.doc.roundedRect(x, y, width, height, radius, radius, 'FD')
    if (borderWidth > 0) {
      this.doc.setLineWidth(borderWidth)
      this.doc.roundedRect(x, y, width, height, radius, radius, 'S')
    }
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage()
      this.currentPage++
      this.currentY = this.margin
    }
  }

  private getReadinessColor(level: string): number[] {
    switch (level.toLowerCase()) {
      case 'advanced': return COLORS.success
      case 'intermediate': return COLORS.warning
      case 'beginner': return COLORS.info
      default: return COLORS.darkGrey
    }
  }

  private addFooter(assessmentId: string): void {
    const footerY = this.pageHeight - 30
    this.doc.setDrawColor(COLORS.lightGrey[0], COLORS.lightGrey[1], COLORS.lightGrey[2])
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, footerY, this.pageWidth - this.margin, footerY)
    
    this.addText(`Page ${this.currentPage}`, this.margin, footerY + 10, FONTS.caption, COLORS.mediumGrey)
    this.addText('Kaizen Academy - Empowering Operational Excellence Worldwide', this.pageWidth / 2, footerY + 10, 10, COLORS.mediumGrey, 'center')
  }

  public async generateReport(results: AssessmentResults): Promise<string> {
    const assessmentId = this.generateAssessmentID()
    
    // === PAGE 1: COVER PAGE ===
    this.generateCoverPage(results, assessmentId)
    
    // === PAGE 2: EXECUTIVE SUMMARY ===
    this.doc.addPage()
    this.currentPage++
    this.currentY = this.margin
    this.generateExecutiveSummary(results)
    
    // === PAGES 3-4: DETAILED QUESTION REVIEW ===
    this.generateQuestionReview(results)
    
    // === PAGE 5: STRENGTHS & GROWTH AREAS ===
    this.doc.addPage()
    this.currentPage++
    this.currentY = this.margin
    this.generateStrengthsAndGrowth(results)
    
    // === PAGE 6: PERSONALIZED LEARNING PATH ===
    this.doc.addPage()
    this.currentPage++
    this.currentY = this.margin
    this.generateRecommendations(results)
    
    // === PAGE 7: NEXT STEPS & RESOURCES ===
    this.doc.addPage()
    this.currentPage++
    this.currentY = this.margin
    this.generateNextSteps(results)
    
    // Add footer to all pages
    for (let i = 1; i <= this.currentPage; i++) {
      this.doc.setPage(i)
      this.addFooter(assessmentId)
    }
    
    return this.doc.output('datauristring')
  }

  private generateCoverPage(results: AssessmentResults, assessmentId: string): void {
    // Background gradient effect (simulated with rectangle)
    this.drawRoundedRect(this.margin, this.margin, this.contentWidth, 200, 10, COLORS.primary, COLORS.lightGrey, 0)
    
    // Title
    this.addText('Operational Excellence', this.pageWidth / 2, this.margin + 40, 24, COLORS.black, 'center')
    this.addText('Readiness Assessment', this.pageWidth / 2, this.margin + 65, 18, COLORS.darkGrey, 'center')
    
    // Score circle
    const circleX = this.pageWidth / 2
    const circleY = this.margin + 120
    const circleRadius = 40
    
    // Draw circle background
    this.doc.setFillColor(COLORS.lightGrey[0], COLORS.lightGrey[1], COLORS.lightGrey[2])
    this.doc.circle(circleX, circleY, circleRadius, 'F')
    
    // Draw progress arc (simplified as filled circle for now)
    const percentage = results.percentage
    this.doc.setFillColor(COLORS.success[0], COLORS.success[1], COLORS.success[2])
    this.doc.circle(circleX, circleY, circleRadius, 'F')
    
    // Inner circle (white)
    this.doc.setFillColor(COLORS.white[0], COLORS.white[1], COLORS.white[2])
    this.doc.circle(circleX, circleY, circleRadius - 10, 'F')
    
    // Score text
    this.addText(`${Math.round(percentage)}%`, circleX, circleY - 5, 20, COLORS.black, 'center')
    this.addText(`${results.score}/${results.total_questions}`, circleX, circleY + 15, 16, COLORS.darkGrey, 'center')
    
    // Readiness level
    const readinessColor = this.getReadinessColor(results.readiness_level)
    this.addText(results.readiness_level.toUpperCase(), this.pageWidth / 2, circleY + 35, 18, readinessColor, 'center')
    
    // Candidate information
    this.currentY = circleY + 80
    this.addText('Candidate Information', this.margin, this.currentY, FONTS.h2, COLORS.black)
    this.currentY += 20
    
    const candidateInfo = [
      `Name: ${results.name}`,
      `Email: ${results.email}`,
      `Assessment Date: ${new Date(results.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      `Assessment ID: ${assessmentId}`
    ]
    
    candidateInfo.forEach(info => {
      this.addText(info, this.margin + 10, this.currentY, FONTS.body, COLORS.darkGrey)
      this.currentY += 12
    })
  }

  private generateExecutiveSummary(results: AssessmentResults): void {
    this.addSectionTitle('Your Performance at a Glance')
    
    // Key metrics dashboard
    this.drawRoundedRect(this.margin, this.currentY, this.contentWidth, 100, 5, COLORS.lightGrey, COLORS.lightGrey)
    this.currentY += 20
    
    this.addText('Key Metrics', this.margin + 10, this.currentY, FONTS.h3, COLORS.black)
    this.currentY += 20
    
    // Metrics grid
    const metrics = [
      { label: 'Overall Score', value: `${results.score}/${results.total_questions}`, color: COLORS.black },
      { label: 'Percentage Score', value: `${results.percentage}%`, color: COLORS.black },
      { label: 'Readiness Level', value: results.readiness_level, color: this.getReadinessColor(results.readiness_level) },
      { label: 'Benchmark', value: 'Higher than 28% of test-takers', color: COLORS.info }
    ]
    
    const colWidth = this.contentWidth / 2
    metrics.forEach((metric, index) => {
      const x = this.margin + (index % 2) * colWidth + 10
      const y = this.currentY + Math.floor(index / 2) * 35
      
      this.addText(metric.label, x, y, FONTS.body, COLORS.mediumGrey)
      this.addText(metric.value, x, y + 12, 14, metric.color)
    })
    
    this.currentY += 80
    
    // Performance breakdown
    this.addText('Performance Breakdown', this.margin, this.currentY, FONTS.h3, COLORS.black)
    this.currentY += 20
    
    const correctCount = results.score
    const incorrectCount = results.total_questions - results.score
    const barWidth = this.contentWidth
    const correctWidth = (correctCount / results.total_questions) * barWidth
    
    // Background bar
    this.drawRoundedRect(this.margin, this.currentY, barWidth, 20, 3, COLORS.lightGrey, COLORS.lightGrey)
    
    // Correct portion
    if (correctWidth > 0) {
      this.drawRoundedRect(this.margin, this.currentY, correctWidth, 20, 3, COLORS.success, COLORS.success)
    }
    
    // Labels
    this.addText(`Correct: ${correctCount}`, this.margin + 5, this.currentY + 13, FONTS.caption, COLORS.white)
    if (incorrectCount > 0) {
      this.addText(`Incorrect: ${incorrectCount}`, this.margin + correctWidth + 5, this.currentY + 13, FONTS.caption, COLORS.darkGrey)
    }
    
    this.currentY += 40
    
    // Summary paragraph
    const summaryText = this.getSummaryParagraph(results)
    const lines = this.doc.splitTextToSize(summaryText, this.contentWidth)
    lines.forEach((line: string) => {
      this.addText(line, this.margin, this.currentY, FONTS.body, COLORS.darkGrey)
      this.currentY += 15
    })
  }

  private getSummaryParagraph(results: AssessmentResults): string {
    const level = results.readiness_level.toLowerCase()
    const percentage = results.percentage
    
    if (percentage >= 80) {
      return `Excellent work! With a score of ${percentage}%, you've demonstrated advanced understanding of Lean principles and operational excellence concepts. Your ${level} readiness level indicates you're well-prepared to lead improvement initiatives and mentor others in Lean methodologies.`
    } else if (percentage >= 60) {
      return `Good progress! Your score of ${percentage}% shows solid foundational knowledge of Lean principles. As someone at the ${level} readiness level, you have the opportunity to deepen your understanding and take on more challenging improvement projects. Focus on practical application to advance to the next level.`
    } else {
      return `Great start! At ${percentage}%, you're beginning your Lean journey. Your ${level} readiness level is the perfect foundation for building expertise. We recommend focusing on fundamental concepts and hands-on practice to strengthen your understanding and confidence in operational excellence principles.`
    }
  }

  private generateQuestionReview(results: AssessmentResults): void {
    this.addSectionTitle('Question-by-Question Analysis', 'Review your answers and identify learning opportunities')
    
    const questions = results.questions.slice(0, 10) // First 10 questions on this page
    
    questions.forEach((question, index) => {
      this.checkPageBreak(50)
      
      const userAnswer = results.answers[question.id]
      const isCorrect = userAnswer === question.correctAnswer
      
      // Question box
      const boxHeight = 35
      this.drawRoundedRect(this.margin, this.currentY, this.contentWidth, boxHeight, 3, 
        isCorrect ? COLORS.success : COLORS.error, 
        isCorrect ? COLORS.success : COLORS.error, 0.1)
      
      // Question number and status
      this.addText(`Q${index + 1}`, this.margin + 10, this.currentY + 8, FONTS.caption, COLORS.darkGrey)
      this.addText(isCorrect ? ICONS.check : ICONS.cross, this.pageWidth - this.margin - 20, this.currentY + 8, FONTS.h2, 
        isCorrect ? COLORS.success : COLORS.error)
      
      // Full question text (no truncation)
      this.currentY += 20
      const questionLines = this.doc.splitTextToSize(question.question, this.contentWidth - 20)
      questionLines.forEach((line: string) => {
        this.addText(line, this.margin + 10, this.currentY, FONTS.body, COLORS.black)
        this.currentY += 8
      })
      
      // Answer comparison
      this.currentY += 5
      this.addText(`Your Answer: ${userAnswer || 'Not answered'}`, this.margin + 10, this.currentY, FONTS.body, COLORS.darkGrey)
      this.currentY += 8
      this.addText(`Correct Answer: ${question.correctAnswer}`, this.margin + 10, this.currentY, FONTS.body, COLORS.success)
      
      this.currentY += boxHeight + 10
    })
  }

  private generateStrengthsAndGrowth(results: AssessmentResults): void {
    this.addSectionTitle('What You Know Well & Where to Focus')
    
    const correctQuestions = results.questions.filter(q => results.answers[q.id] === q.correctAnswer)
    const incorrectQuestions = results.questions.filter(q => results.answers[q.id] !== q.correctAnswer)
    
    // Two-column layout
    const colWidth = (this.contentWidth - 20) / 2
    
    // Strengths column
    this.drawRoundedRect(this.margin, this.currentY, colWidth, 150, 5, COLORS.lightGrey, COLORS.success)
    this.currentY += 20
    this.addText('Your Strengths', this.margin + 10, this.currentY, FONTS.h3, COLORS.success)
    this.currentY += 15
    
    correctQuestions.slice(0, 5).forEach((question, index) => {
      this.addText(`${ICONS.bullet} ${this.extractTopic(question.question)}`, this.margin + 10, this.currentY, FONTS.body, COLORS.darkGrey)
      this.currentY += 12
    })
    
    // Growth opportunities column
    const growthX = this.margin + colWidth + 20
    this.currentY -= 12 * 5 + 15 // Reset Y position
    
    this.drawRoundedRect(growthX, this.currentY, colWidth, 150, 5, COLORS.lightGrey, COLORS.error)
    this.currentY += 20
    this.addText('Growth Opportunities', growthX + 10, this.currentY, FONTS.h3, COLORS.error)
    this.currentY += 15
    
    incorrectQuestions.slice(0, 5).forEach((question, index) => {
      this.addText(`${ICONS.target} ${this.extractTopic(question.question)}`, growthX + 10, this.currentY, FONTS.body, COLORS.darkGrey)
      this.currentY += 12
    })
    
    this.currentY += 160
  }

  private extractTopic(questionText: string): string {
    // Extract topic from question (simplified - in real implementation, would be more sophisticated)
    if (questionText.toLowerCase().includes('5s')) return '5S system components'
    if (questionText.toLowerCase().includes('waste')) return 'Waste identification'
    if (questionText.toLowerCase().includes('value stream')) return 'Value stream mapping'
    if (questionText.toLowerCase().includes('gemba')) return 'Gemba walks'
    return 'Lean principles'
  }

  private generateRecommendations(results: AssessmentResults): void {
    this.addSectionTitle('Your Personalized Learning Path')
    
    const learningSteps = this.getLearningPathSteps(results.readiness_level)
    
    learningSteps.forEach((step: any, index: number) => {
      this.checkPageBreak(60)
      
      // Step header
      this.addText(`${ICONS.phase} Step ${index + 1}: ${step.title}`, this.margin, this.currentY, FONTS.h3, COLORS.black)
      this.currentY += 10
      this.addText(step.description, this.margin + 10, this.currentY, FONTS.body, COLORS.darkGrey)
      this.currentY += 10
      
      if (step.duration) {
        this.addText(`${ICONS.clock} Duration: ${step.duration}`, this.margin + 10, this.currentY, FONTS.caption, COLORS.info)
        this.currentY += 15
      }
      
      if (step.course) {
        this.addText(`${ICONS.book} Recommended Course: ${step.course}`, this.margin + 10, this.currentY, FONTS.caption, COLORS.primary)
        this.currentY += 15
      }
    })
  }

  private getLearningPathSteps(level: string): any[] {
    const steps: Record<string, any[]> = {
      'Advanced': [
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
      ],
      'Intermediate': [
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
      ],
      'Beginner': [
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
    }
    
    return steps[level] || steps['Beginner']
  }

  private generateActionPlan(results: AssessmentResults): void {
    this.addSectionTitle('Your 90-Day Action Plan')
    
    const milestones = this.getActionPlanMilestones(results.readiness_level)
    
    milestones.forEach((milestone: any, index: number) => {
      this.checkPageBreak(50)
      
      // Milestone header
      this.addText(`${ICONS.target} ${milestone.month}`, this.margin, this.currentY, FONTS.h3, COLORS.black)
      this.currentY += 10
      
      // Objective and success criteria
      this.addText(`Objective: ${milestone.objective}`, this.margin + 10, this.currentY, FONTS.body, COLORS.darkGrey)
      this.currentY += 8
      this.addText(`Success: ${milestone.success}`, this.margin + 10, this.currentY, FONTS.body, COLORS.success)
      this.currentY += 15
    })
  }

  private getActionPlanMilestones(level: string): any[] {
    const plans: Record<string, any[]> = {
      'Advanced': [
        { month: 'Month 1', objective: 'Lead strategic improvement initiative', success: 'Complete project charter and stakeholder alignment' },
        { month: 'Month 2', objective: 'Mentor team members', success: 'Conduct 3 coaching sessions with measurable outcomes' },
        { month: 'Month 3', objective: 'Advanced certification', success: 'Pass Black Belt certification exam' }
      ],
      'Intermediate': [
        { month: 'Month 1', objective: 'Complete practitioner training', success: 'Finish Lean Practitioner course' },
        { month: 'Month 2', objective: 'Apply VSM to real process', success: 'Create and implement VSM for one process' },
        { month: 'Month 3', objective: 'Lead Kaizen event', success: 'Facilitate successful Kaizen with documented savings' }
      ],
      'Beginner': [
        { month: 'Month 1', objective: 'Learn fundamentals', success: 'Complete introductory course' },
        { month: 'Month 2', objective: 'Organize workspace', success: 'Implement 5S in your area' },
        { month: 'Month 3', objective: 'Identify wastes', success: 'Find and document 3 waste examples' }
      ]
    }
    
    return plans[level] || plans['Beginner']
  }

  private generateNextSteps(results: AssessmentResults): void {
    this.addSectionTitle('Next Steps & Resources')
    
    // Course recommendations
    this.addText('Recommended Courses for Your Level', this.margin, this.currentY, FONTS.h3, COLORS.black)
    this.currentY += 15
    
    const courses = this.getRecommendedCourses(results.readiness_level)
    
    courses.forEach((course: any, index: number) => {
      this.checkPageBreak(80)
      
      // Course card
      this.drawRoundedRect(this.margin, this.currentY, this.contentWidth, 70, 5, COLORS.lightGrey, COLORS.darkGrey, 1)
      
      // Course title
      this.addText(course.title, this.margin + 10, this.currentY + 10, FONTS.h3, COLORS.black)
      this.currentY += 20
      
      // Course description
      const descLines = this.doc.splitTextToSize(course.description, this.contentWidth - 20)
      descLines.forEach((line: string) => {
        this.addText(line, this.margin + 10, this.currentY, FONTS.body, COLORS.darkGrey)
        this.currentY += 8
      })
      
      this.currentY += 10
      
      // Price and savings
      this.addText(`Price: ${course.price}`, this.margin + 10, this.currentY, FONTS.body, COLORS.success)
      this.currentY += 10
      
      if (course.originalPrice) {
        this.addText(`Original: ${course.originalPrice}`, this.margin + 10, this.currentY, FONTS.caption, COLORS.mediumGrey)
        this.currentY += 8
      }
      
      if (course.savings) {
        this.addText(course.savings, this.margin + 10, this.currentY, FONTS.caption, COLORS.error)
        this.currentY += 8
      }
      
      this.currentY += 10
      
      // Enrollment link
      const courseLinks: Record<string, string> = {
        'Lean Practitioner Certification Program': 'https://practitioner.kaizenacademy.education/?coupon_code=kaizen60',
        'Value Stream Mapping': 'https://academy.continuousimprovement.education/p/advanced-value-stream-mapping?coupon_code=kaizen60',
        'Scientific Problem Solving': 'https://academy.continuousimprovement.education/p/en-home?coupon_code=kaizen60',
        'Business Process Management': 'https://academy.continuousimprovement.education/p/business-process-management?coupon_code=kaizen60',
        'Toyota Production System & Lean Fundamentals': 'https://academy.continuousimprovement.education/p/toyota-production-system-and-lean-fundamentals1?coupon_code=kaizen60'
      }
      
      this.addText(`${ICONS.link} Enroll: ${courseLinks[course.title] || 'https://kaizenacademy.education'}`, this.margin + 10, this.currentY, FONTS.caption, COLORS.info)
      
      this.currentY += 80
    })
    
    // Additional resources
    this.currentY += 20
    this.addText('Free Resources', this.margin, this.currentY, FONTS.h3, COLORS.black)
    this.currentY += 10
    
    const resources = [
      `${ICONS.book} Download Lean Glossary: Available in course materials`,
      `${ICONS.video} Watch Tutorial Videos: Available in course portal`,
      `${ICONS.mail} Join Community: https://kaizenacademy.education/community`,
      `${ICONS.calendar} Schedule Consultation: https://kaizenacademy.education/consultation`
    ]
    
    resources.forEach((resource: string) => {
      this.addText(resource, this.margin + 10, this.currentY, FONTS.body, COLORS.info)
      this.currentY += 12
    })
  }

  private getRecommendedCourses(level: string): Course[] {
    const courses: Record<string, Course[]> = {
      'Advanced': [
        { 
          title: 'Lean Practitioner Certification Program', 
          description: 'Comprehensive certification program for Lean practitioners with hands-on project experience and industry recognition', 
          price: '$796',
          originalPrice: '$995',
          savings: 'Save 20%'
        }
      ],
      'Intermediate': [
        { 
          title: 'Value Stream Mapping', 
          description: 'Master advanced value stream mapping techniques for process optimization and waste elimination', 
          price: '$71',
          originalPrice: '$89',
          savings: 'Save 20%'
        },
        { 
          title: 'Scientific Problem Solving', 
          description: 'Advanced methodology for complex problem-solving and process improvement using systematic approaches', 
          price: '$144',
          originalPrice: '$180',
          savings: 'Save 20%'
        },
        { 
          title: 'Business Process Management', 
          description: 'Comprehensive business process management training for organizational efficiency', 
          price: '$200',
          originalPrice: '$250',
          savings: 'Save 20%'
        }
      ],
      'Beginner': [
        { 
          title: 'Toyota Production System & Lean Fundamentals', 
          description: 'Complete introduction to Toyota Production System principles and foundational Lean concepts', 
          price: '$79',
          originalPrice: '$99',
          savings: 'Save 20%'
        }
      ]
    }
    
    return courses[level] || courses['Beginner']
  }
}

// Main export function
export const createProfessionalPDF = async (results: AssessmentResults): Promise<string> => {
  const generator = new ProfessionalPDFGenerator()
  return await generator.generateReport(results)
}
