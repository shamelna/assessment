// Unified PDF Generator - Enhanced (Mar 2026)
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
  created_at?: any
}

// Brand colors
const BRAND_COLORS = {
  yellow:      [255, 213, 89]  as [number,number,number],
  black:       [0, 0, 0]       as [number,number,number],
  darkGrey:    [51, 51, 51]    as [number,number,number],
  mediumGrey:  [128, 128, 128] as [number,number,number],
  lightGrey:   [245, 245, 245] as [number,number,number],
  white:       [255, 255, 255] as [number,number,number],
  green:       [76, 175, 80]   as [number,number,number],
  red:         [244, 67, 54]   as [number,number,number],
  blue:        [33, 150, 243]  as [number,number,number],
  orange:      [255, 152, 0]   as [number,number,number],
}

const FONTS = { h1: 28, h2: 20, h3: 16, h4: 14, body: 12, small: 10, caption: 9 }

// ---- Page number map for TOC ----
interface PageMap {
  results: number
  strengths: number
  recommendations: number
  actionPlan: number
  learningPath: number
  qa: number
  quote: number
}

export class UnifiedPDFGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin: number
  private contentWidth: number
  private currentY: number
  private currentPage: number
  private logoBase64: string = ''

  constructor() {
    this.doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' })
    this.doc.setFont('helvetica')
    this.pageWidth  = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.margin       = 54
    this.contentWidth = this.pageWidth - this.margin * 2
    this.currentY  = this.margin
    this.currentPage = 1
  }

  // ---- Logo helpers ----

  private async loadLogoBase64(): Promise<void> {
    try {
      const response = await fetch('/logo_round.png')
      if (!response.ok) return
      const blob = await response.blob()
      await new Promise<void>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          // Resize to ~200px via canvas to keep PDF size small
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const size = 200
            canvas.width = size
            canvas.height = size
            const ctx = canvas.getContext('2d')
            if (ctx) {
              ctx.drawImage(img, 0, 0, size, size)
              this.logoBase64 = canvas.toDataURL('image/png')
            }
            resolve()
          }
          img.src = reader.result as string
        }
        reader.readAsDataURL(blob)
      })
    } catch {
      // fallback: no logo — vector circle drawn instead
    }
  }

  private drawLogo(cx: number, cy: number, r: number): void {
    if (this.logoBase64) {
      this.doc.addImage(this.logoBase64, 'PNG', cx - r, cy - r, r * 2, r * 2)
    } else {
      // Vector fallback: yellow circle with K
      this.doc.setFillColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
      this.doc.circle(cx, cy, r, 'F')
      this.doc.setTextColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
      this.doc.setFontSize(r)
      this.doc.text('K', cx, cy + r * 0.35, { align: 'center' })
    }
  }

  // ---- Link helper ----

  private addLinkText(
    text: string, x: number, y: number,
    fontSize: number, color: [number,number,number], url: string
  ): void {
    this.doc.setTextColor(color[0], color[1], color[2])
    this.doc.setFontSize(fontSize)
    this.doc.text(text, x, y)
    // Underline
    const textWidth = this.doc.getTextWidth(text)
    this.doc.setDrawColor(color[0], color[1], color[2])
    this.doc.setLineWidth(0.5)
    this.doc.line(x, y + 2, x + textWidth, y + 2)
    // Clickable hotspot
    this.doc.link(x, y - fontSize, textWidth, fontSize + 4, { url })
  }

  // ---- Text helpers ----

  private textHeight(text: string, fontSize: number, maxWidth: number): number {
    const lines = this.doc.splitTextToSize(text, maxWidth)
    return lines.length * fontSize * 1.4
  }

  private addWrappedText(
    text: string, x: number, y: number,
    fontSize: number, color: [number,number,number],
    maxWidth: number,
    align: 'left' | 'center' | 'right' = 'left'
  ): number {
    this.doc.setTextColor(color[0], color[1], color[2])
    this.doc.setFontSize(fontSize)
    const lines = this.doc.splitTextToSize(text, maxWidth)
    lines.forEach((line: string, i: number) => {
      this.doc.text(line, x, y + i * fontSize * 1.4, { align })
    })
    return lines.length * fontSize * 1.4
  }

  // ---- Drawing helpers ----

  private drawProgressArc(
    cx: number, cy: number, r: number,
    startDeg: number, endDeg: number,
    color: [number,number,number], lineWidth: number = 8
  ): void {
    // Approximate arc with cubic bezier segments (every 90 deg)
    const toRad = (d: number) => (d - 90) * Math.PI / 180
    this.doc.setDrawColor(color[0], color[1], color[2])
    this.doc.setLineWidth(lineWidth)
    const segments = Math.ceil(Math.abs(endDeg - startDeg) / 90)
    const step = (endDeg - startDeg) / segments
    for (let s = 0; s < segments; s++) {
      const a0 = toRad(startDeg + s * step)
      const a1 = toRad(startDeg + (s + 1) * step)
      const alpha = (a1 - a0) / 2
      const k = (4 / 3) * Math.tan(alpha / 2)
      const x0 = cx + r * Math.cos(a0)
      const y0 = cy + r * Math.sin(a0)
      const x1 = cx + r * Math.cos(a1)
      const y1 = cy + r * Math.sin(a1)
      const cp1x = x0 - k * r * Math.sin(a0)
      const cp1y = y0 + k * r * Math.cos(a0)
      const cp2x = x1 + k * r * Math.sin(a1)
      const cp2y = y1 - k * r * Math.cos(a1)
      this.doc.lines([[cp1x - x0, cp1y - y0, cp2x - x0, cp2y - y0, x1 - x0, y1 - y0]], x0, y0)
    }
  }

  private addText(
    text: string, x: number, y: number,
    fontSize: number, color: [number,number,number],
    align: 'left' | 'center' | 'right' = 'left',
    maxWidth?: number
  ): void {
    this.doc.setTextColor(color[0], color[1], color[2])
    this.doc.setFontSize(fontSize)
    if (maxWidth) {
      const lines = this.doc.splitTextToSize(text, maxWidth)
      lines.forEach((line: string, i: number) => {
        this.doc.text(line, x, y + i * fontSize * 1.2, { align })
      })
    } else {
      this.doc.text(text, x, y, { align })
    }
  }

  private checkPageBreak(required: number = 40): void {
    if (this.currentY > this.pageHeight - required) {
      this.doc.addPage()
      this.currentPage++
      this.currentY = this.margin
    }
  }

  private addSectionTitle(title: string, subtitle?: string): void {
    this.checkPageBreak(60)
    // Yellow left accent bar
    this.doc.setFillColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
    this.doc.rect(this.margin - 12, this.currentY - 14, 4, subtitle ? 32 : 22, 'F')
    this.addText(title, this.margin, this.currentY, FONTS.h2, BRAND_COLORS.black)
    this.currentY += 22
    if (subtitle) {
      this.addText(subtitle, this.margin, this.currentY, FONTS.body, BRAND_COLORS.mediumGrey)
      this.currentY += 18
    }
  }

  private drawRoundedRect(
    x: number, y: number, w: number, h: number, r: number,
    fill: [number,number,number],
    border: [number,number,number] = fill,
    borderWidth: number = 1
  ): void {
    this.doc.setFillColor(fill[0], fill[1], fill[2])
    this.doc.setDrawColor(border[0], border[1], border[2])
    this.doc.setLineWidth(borderWidth)
    this.doc.roundedRect(x, y, w, h, r, r, 'FD')
  }

  private getReadinessColor(level: string): { bg: [number,number,number], text: [number,number,number] } {
    switch (level) {
      case 'Advanced':     return { bg: BRAND_COLORS.green,  text: BRAND_COLORS.white }
      case 'Intermediate': return { bg: BRAND_COLORS.blue,   text: BRAND_COLORS.white }
      case 'Developing':   return { bg: BRAND_COLORS.orange, text: BRAND_COLORS.white }
      case 'Beginner':     return { bg: BRAND_COLORS.yellow, text: BRAND_COLORS.black }
      default:             return { bg: BRAND_COLORS.mediumGrey, text: BRAND_COLORS.white }
    }
  }

  private getCurrentYear(): number { return new Date().getFullYear() }

  private generateAssessmentID(): string {
    return 'KA-' + Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  // ---- Data helpers ----

  private getAnswer(results: AssessmentResults, questionId: any): string {
    return results.answers[questionId] || results.answers[String(questionId)] || 'Not answered'
  }

  private validateAssessmentData(results: AssessmentResults): void {
    // Trust the stored score — do not recalculate.
    // Score calculation belongs in the assessment submission flow, not PDF generation.
    // Sanitise nulls in answers only.
    Object.keys(results.answers).forEach(k => {
      if (results.answers[k] == null) results.answers[k] = 'Not answered'
    })
  }

  private getCategoryAnalysis(results: AssessmentResults): Record<string, { correct: number, incorrect: number, total: number }> {
    const cats: Record<string, { correct: number, incorrect: number, total: number }> = {}
    results.questions.forEach(q => {
      const cat = q.category || 'General'
      if (!cats[cat]) cats[cat] = { correct: 0, incorrect: 0, total: 0 }
      cats[cat].total++
      const ans = this.getAnswer(results, q.id)
      if (ans === q.correctAnswer) cats[cat].correct++
      else cats[cat].incorrect++
    })
    return cats
  }

  private generate90DayActionPlan(results: AssessmentResults): Array<{ month: string, actions: string[] }> {
    const incorrect = results.questions.filter(q => this.getAnswer(results, q.id) !== q.correctAnswer)
    const topics = Array.from(new Set(incorrect.map((q: any) => q.category || 'General')))

    return [
      {
        month: 'Month 1 - Foundation',
        actions: [
          `Study ${topics.slice(0, 2).join(' & ')} fundamentals`,
          'Map one value stream in your workplace and identify top 3 wastes',
          'Complete a 5S assessment of your immediate work area',
        ]
      },
      {
        month: 'Month 2 - Application',
        actions: [
          `Apply PDCA to a problem in ${topics[0] || 'your area'}`,
          'Run one Kaizen event targeting your highest-impact waste',
          `Deepen knowledge of ${topics[1] || 'Lean tools'} through structured study`,
        ]
      },
      {
        month: 'Month 3 - Leadership',
        actions: [
          'Lead a cross-functional improvement initiative with measurable targets',
          `Coach a colleague on ${topics[0] || 'Lean principles'}`,
          'Prepare and enrol in a certification course to validate your skills',
        ]
      },
    ]
  }

  private getCourseRecommendations(level: string) {
    const base = 'https://academy.continuousimprovement.education/p/'
    const practitioner = 'https://academy.continuousimprovement.education/p/certified-lean-practitioner-training-bundle'
    switch (level) {
      case 'Advanced':
      case 'Intermediate':
        return {
          title: 'Certified Lean Practitioner Bundle',
          description: 'The complete practitioner certification — advanced methodologies, real-world projects, and industry-recognised credentials.',
          price: '$995',
          discountedPrice: '$398',
          discount: '60% OFF — Exclusive for KA Assessment',
          url: practitioner + '?coupon_code=kaizen60',
          features: [
            'Advanced Lean & TPS methodologies',
            'Value Stream Mapping mastery',
            'Scientific Problem Solving (A3/PDCA)',
            'Hoshin Kanri strategic deployment',
            'Industry-recognised certification',
            'Lifetime course access',
          ]
        }
      case 'Developing':
        return {
          title: 'Skill Development Pathway',
          description: 'Two focused courses to bridge your knowledge gaps and prepare for practitioner-level work.',
          courses: [
            {
              name: 'Advanced Value Stream Mapping',
              description: 'Master end-to-end process visualisation and waste elimination',
              originalPrice: '$89', price: '$71',
              url: base + 'advanced-value-stream-mapping?coupon_code=kaizen60',
            },
            {
              name: 'Business Process Management',
              description: 'Apply BPM techniques for sustained organisational efficiency',
              originalPrice: '$250', price: '$200',
              url: base + 'business-process-management?coupon_code=kaizen60',
            },
          ]
        }
      default: // Beginner
        return {
          title: 'Foundational Learning Path',
          description: 'Two essential courses to build solid Lean foundations and begin your continuous improvement journey.',
          courses: [
            {
              name: 'Toyota Production System & Lean Fundamentals',
              description: 'Core TPS principles, 8 wastes, 5S, Jidoka, JIT — everything to get started',
              originalPrice: '$99', price: '$79',
              url: base + 'toyota-production-system-and-lean-fundamentals1?coupon_code=kaizen60',
            },
            {
              name: 'Scientific Problem Solving',
              description: 'PDCA, A3 thinking, 5 Whys, root cause analysis in practice',
              originalPrice: '$89', price: '$71',
              url: base + 'en-home?coupon_code=kaizen60',
            },
          ]
        }
    }
  }

  private getRecommendationContent(level: string) {
    const map: Record<string, { title: string, description: string, nextSteps: string[] }> = {
      'Advanced': {
        title: 'Excellent Work!',
        description: 'You demonstrate exceptional mastery of Lean principles and Toyota Production System concepts. You are ready to lead strategic transformation and mentor others.',
        nextSteps: [
          'Lead strategic improvement initiatives with measurable ROI',
          'Mentor junior practitioners in Lean methodologies',
          'Pursue Certified Lean Practitioner credentials',
          'Drive organisational transformation at scale',
        ]
      },
      'Intermediate': {
        title: 'Good Progress!',
        description: 'You have solid Lean knowledge and practical understanding. Focus on advanced tools and leadership to reach practitioner level.',
        nextSteps: [
          'Apply advanced problem-solving techniques (A3, FMEA)',
          'Lead Kaizen events and Value Stream improvement workshops',
          'Study Hoshin Kanri and strategy deployment',
          'Pursue Lean Practitioner certification',
        ]
      },
      'Developing': {
        title: 'Growing Strong!',
        description: 'You have foundational knowledge and are ready to deepen your practical application. Targeted study will accelerate your progress significantly.',
        nextSteps: [
          'Complete Value Stream Mapping and BPM courses',
          'Participate in hands-on Kaizen workshops',
          'Practice waste identification in your daily work',
          'Study real-world TPS implementation case studies',
        ]
      },
      'Beginner': {
        title: 'Great Start!',
        description: 'You are at the exciting beginning of your Lean journey. Build strong foundations now and your improvement will compound rapidly.',
        nextSteps: [
          'Start with TPS & Lean Fundamentals course',
          'Learn the 8 wastes and practise identifying them daily',
          'Implement 5S in your immediate work area',
          'Find a Lean mentor or study group',
        ]
      },
    }
    return map[level] || map['Beginner']
  }

  // ================================================================
  // REPORT GENERATION
  // ================================================================

  public async generateReport(results: AssessmentResults): Promise<string> {
    try {
      // Load logo first (async — must complete before drawing)
      if (typeof window !== 'undefined') {
        await this.loadLogoBase64()
      }

      this.validateAssessmentData(results)
      const assessmentId = this.generateAssessmentID()

      // Track page numbers for TOC
      const pageMap: PageMap = {
        results: 0, strengths: 0, recommendations: 0,
        actionPlan: 0, learningPath: 0, qa: 0, quote: 0,
      }

      // === PAGE 1: COVER ===
      this.generateCover(results, assessmentId)

      // === PAGE 2: TOC (placeholder — filled in at the end) ===
      this.doc.addPage()
      this.currentPage++
      // (TOC drawn after all pages are known)

      // === PAGE 3: ASSESSMENT RESULTS + ANALYTICS ===
      this.doc.addPage()
      this.currentPage++
      this.currentY = this.margin
      pageMap.results = this.currentPage
      this.generateAssessmentResults(results)

      // === PAGE 4: STRENGTHS VS. GAP AREAS ===
      this.doc.addPage()
      this.currentPage++
      this.currentY = this.margin
      pageMap.strengths = this.currentPage
      this.generateStrengthsVsGaps(results)

      // === PAGE 5: PERSONALISED RECOMMENDATIONS ===
      this.doc.addPage()
      this.currentPage++
      this.currentY = this.margin
      pageMap.recommendations = this.currentPage
      this.generateRecommendations(results)

      // === PAGE 6: 90-DAY ACTION PLAN ===
      this.doc.addPage()
      this.currentPage++
      this.currentY = this.margin
      pageMap.actionPlan = this.currentPage
      this.generate90DayActionPlanSection(results)

      // === PAGE 7: RECOMMENDED LEARNING PATH ===
      this.doc.addPage()
      this.currentPage++
      this.currentY = this.margin
      pageMap.learningPath = this.currentPage
      this.generateLearningPath(results)

      // === PAGE 8+: Q&A ANALYSIS (always starts on its own page) ===
      this.doc.addPage()
      this.currentPage++
      this.currentY = this.margin
      pageMap.qa = this.currentPage
      this.generateQuestionAnalysis(results)

      // === FINAL PAGE: INSPIRATION & NEXT STEPS ===
      this.doc.addPage()
      this.currentPage++
      this.currentY = this.margin
      pageMap.quote = this.currentPage
      this.generateQuotePage(results)

      // === FOOTERS: loop all pages ===
      const totalPages = this.currentPage
      for (let i = 1; i <= totalPages; i++) {
        this.doc.setPage(i)
        if (i > 1) this.addFooter(assessmentId, i, totalPages)
      }

      // === TOC: go back to page 2 and render with real page numbers ===
      this.doc.setPage(2)
      this.currentY = this.margin
      this.currentPage = 2
      this.generateTOC(pageMap)

      return this.doc.output('datauristring')

    } catch (error: unknown) {
      console.error('PDF generation failed:', error)
      const msg = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`PDF generation failed: ${msg}`)
    }
  }

  // ================================================================
  // PAGE 1: COVER
  // ================================================================

  private generateCover(results: AssessmentResults, assessmentId: string): void {
    const p = this.pageWidth
    const h = this.pageHeight

    // Full-bleed black header band
    this.doc.setFillColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
    this.doc.rect(0, 0, p, 280, 'F')

    // Yellow left accent bar
    this.doc.setFillColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
    this.doc.rect(0, 0, 6, 280, 'F')

    // Logo top-left in header
    this.drawLogo(this.margin + 24, 54, 24)

    // Brand name
    this.addText('KAIZEN ACADEMY', this.margin + 60, 60, FONTS.h3, BRAND_COLORS.white)

    // Yellow divider
    this.doc.setFillColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
    this.doc.rect(this.margin, 76, 120, 2, 'F')

    // Report title
    this.addText('LEAN ASSESSMENT REPORT', this.margin, 106, FONTS.h2, BRAND_COLORS.yellow)

    // Prepared for
    this.addText('PREPARED FOR', this.margin, 136, FONTS.small, BRAND_COLORS.mediumGrey)
    this.addText(results.name.toUpperCase(), this.margin, 158, FONTS.h1, BRAND_COLORS.white)

    // Company | Role
    const meta: string[] = []
    if (results.company) meta.push(results.company)
    if (results.role) meta.push(results.role)
    if (meta.length) this.addText(meta.join('  |  '), this.margin, 180, FONTS.body, BRAND_COLORS.mediumGrey)

    // Date
    const dateStr = results.created_at?.toDate?.().toLocaleDateString() || new Date().toLocaleDateString()
    this.addText(dateStr, this.margin, 200, FONTS.small, BRAND_COLORS.mediumGrey)

    // Yellow stripe transition
    this.doc.setFillColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
    this.doc.rect(0, 280, p, 8, 'F')

    // Readiness pill badge
    const rc = this.getReadinessColor(results.readiness_level)
    this.drawRoundedRect(this.margin, 306, 200, 36, 18, rc.bg, rc.bg, 0)
    this.addText(results.readiness_level.toUpperCase() + ' LEVEL', this.margin + 100, 329, FONTS.body, rc.text, 'center')

    // 3 stat cards
    const cardW = (this.contentWidth - 20) / 3
    const cardY = 360
    const stats = [
      { label: 'Score', value: `${results.score}/${results.total_questions}` },
      { label: 'Percentage', value: `${Math.round(results.percentage)}%` },
      { label: 'Assessment ID', value: assessmentId },
    ]
    stats.forEach((s, i) => {
      const cx = this.margin + i * (cardW + 10)
      this.drawRoundedRect(cx, cardY, cardW, 60, 6, BRAND_COLORS.lightGrey, BRAND_COLORS.lightGrey, 0)
      this.addText(s.value, cx + cardW / 2, cardY + 24, FONTS.h3, BRAND_COLORS.black, 'center')
      this.addText(s.label, cx + cardW / 2, cardY + 44, FONTS.small, BRAND_COLORS.mediumGrey, 'center')
    })

    // Info grid 2-col
    const infoY = 460
    const col1 = this.margin
    const col2 = this.margin + this.contentWidth / 2
    const infoItems = [
      { label: 'Name', value: results.name },
      { label: 'Email', value: results.email },
      { label: 'Company', value: results.company || '-' },
      { label: 'Role', value: results.role || '-' },
      { label: 'Country', value: results.country || '-' },
      { label: 'Date', value: dateStr },
    ]
    infoItems.forEach((item, i) => {
      const col = i % 2 === 0 ? col1 : col2
      const row = Math.floor(i / 2)
      const y = infoY + row * 44
      this.addText(item.label.toUpperCase(), col, y, FONTS.caption, BRAND_COLORS.mediumGrey)
      this.addText(item.value, col, y + 16, FONTS.body, BRAND_COLORS.black)
    })

    this.currentY = h - 80
  }

  // ================================================================
  // PAGE 2: TABLE OF CONTENTS
  // ================================================================

  private generateTOC(pageMap: PageMap): void {
    // Logo + brand
    this.drawLogo(this.margin + 20, this.margin + 20, 18)
    this.addText('Kaizen Academy', this.margin + 46, this.margin + 26, FONTS.body, BRAND_COLORS.black)

    // Heading
    const headY = this.margin + 70
    this.addText('TABLE OF CONTENTS', this.margin, headY, FONTS.h1, BRAND_COLORS.black)
    // Yellow underline
    this.doc.setFillColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
    this.doc.rect(this.margin, headY + 8, 200, 3, 'F')

    const tocItems = [
      { num: '01', title: 'Assessment Results & Analytics', page: pageMap.results },
      { num: '02', title: 'Strengths vs. Gap Areas',        page: pageMap.strengths },
      { num: '03', title: 'Personalised Recommendations',   page: pageMap.recommendations },
      { num: '04', title: '90-Day Action Plan',             page: pageMap.actionPlan },
      { num: '05', title: 'Recommended Learning Path',      page: pageMap.learningPath },
      { num: '06', title: 'Q&A Analysis',                   page: pageMap.qa },
      { num: '07', title: 'Inspiration & Next Steps',       page: pageMap.quote },
    ]

    let y = headY + 40
    tocItems.forEach((item) => {
      // Number badge
      this.drawRoundedRect(this.margin, y, 30, 26, 4, BRAND_COLORS.yellow, BRAND_COLORS.yellow, 0)
      this.addText(item.num, this.margin + 15, y + 18, FONTS.small, BRAND_COLORS.black, 'center')

      // Title
      this.addText(item.title, this.margin + 42, y + 18, FONTS.body, BRAND_COLORS.darkGrey)

      // Dot leaders
      const titleEnd = this.margin + 42 + this.doc.getTextWidth(item.title) + 6
      const pageNumX = this.pageWidth - this.margin - 24
      this.doc.setTextColor(BRAND_COLORS.lightGrey[0], BRAND_COLORS.lightGrey[1], BRAND_COLORS.lightGrey[2])
      this.doc.setFontSize(FONTS.small)
      let dotX = titleEnd
      while (dotX + 6 < pageNumX) {
        this.doc.text('.', dotX, y + 18)
        dotX += 6
      }

      // Page number
      this.addText(String(item.page), pageNumX, y + 18, FONTS.body, BRAND_COLORS.black, 'right')

      y += 44
    })
  }

  // ================================================================
  // PAGE 3: ASSESSMENT RESULTS + ANALYTICS (merged)
  // ================================================================

  private generateAssessmentResults(results: AssessmentResults): void {
    this.addSectionTitle('Assessment Results & Analytics', 'Your performance at a glance')

    // 3 stat cards
    const cardW = (this.contentWidth - 20) / 3
    const cardY = this.currentY + 8
    const stats = [
      { label: 'Score', value: `${results.score}/${results.total_questions}`, color: BRAND_COLORS.blue },
      { label: 'Percentage', value: `${Math.round(results.percentage)}%`, color: BRAND_COLORS.green },
      { label: 'Readiness', value: results.readiness_level, color: this.getReadinessColor(results.readiness_level).bg },
    ]
    stats.forEach((s, i) => {
      const cx = this.margin + i * (cardW + 10)
      this.drawRoundedRect(cx, cardY, cardW, 60, 6, BRAND_COLORS.lightGrey, BRAND_COLORS.lightGrey, 0)
      this.addText(s.value, cx + cardW / 2, cardY + 24, FONTS.h3, s.color, 'center')
      this.addText(s.label, cx + cardW / 2, cardY + 44, FONTS.small, BRAND_COLORS.mediumGrey, 'center')
    })
    this.currentY = cardY + 80

    // Readiness level pill strip
    const levels = ['Beginner', 'Developing', 'Intermediate', 'Advanced']
    const pillW = this.contentWidth / levels.length - 4
    levels.forEach((l, i) => {
      const active = l === results.readiness_level
      const rc = this.getReadinessColor(l)
      const px = this.margin + i * (pillW + 4)
      this.drawRoundedRect(px, this.currentY, pillW, 24, 4,
        active ? rc.bg : BRAND_COLORS.lightGrey,
        active ? rc.bg : BRAND_COLORS.lightGrey, 0)
      this.addText(l, px + pillW / 2, this.currentY + 16, FONTS.small,
        active ? rc.text : BRAND_COLORS.mediumGrey, 'center')
    })
    this.currentY += 44

    // Donut ring + metric cards side by side
    const donutCx = this.margin + 80
    const donutCy = this.currentY + 70
    const donutR  = 50

    // Background ring
    this.doc.setDrawColor(BRAND_COLORS.lightGrey[0], BRAND_COLORS.lightGrey[1], BRAND_COLORS.lightGrey[2])
    this.doc.setLineWidth(12)
    this.doc.circle(donutCx, donutCy, donutR, 'S')

    // Progress arc
    if (results.percentage > 0) {
      this.drawProgressArc(donutCx, donutCy, donutR, 0, results.percentage * 3.6, BRAND_COLORS.green, 12)
    }

    // Centre text
    this.addText(`${Math.round(results.percentage)}%`, donutCx, donutCy + 6, FONTS.h2, BRAND_COLORS.green, 'center')
    this.addText('Score', donutCx, donutCy + 22, FONTS.small, BRAND_COLORS.mediumGrey, 'center')

    // Metric cards to the right of donut
    const mcX = this.margin + 185
    const mcW = this.contentWidth - 185 + this.margin - this.margin
    const metrics = [
      { label: 'Correct', value: results.score, color: BRAND_COLORS.green },
      { label: 'Incorrect', value: results.total_questions - results.score, color: BRAND_COLORS.red },
      { label: 'Total', value: results.total_questions, color: BRAND_COLORS.blue },
    ]
    metrics.forEach((m, i) => {
      const my = this.currentY + i * 48
      this.drawRoundedRect(mcX, my, this.contentWidth - 185, 40, 4, BRAND_COLORS.lightGrey, BRAND_COLORS.lightGrey, 0)
      this.addText(String(m.value), mcX + 16, my + 24, FONTS.h3, m.color)
      this.addText(m.label, mcX + 58, my + 24, FONTS.body, BRAND_COLORS.darkGrey)
      // Mini bar
      const barW = this.contentWidth - 185 - 110
      const fill = (m.value / results.total_questions) * barW
      this.drawRoundedRect(mcX + 100, my + 14, barW, 10, 5, BRAND_COLORS.lightGrey)
      if (fill > 0) this.drawRoundedRect(mcX + 100, my + 14, fill, 10, 5, m.color)
    })

    this.currentY = donutCy + donutR + 30
  }

  // ================================================================
  // PAGE 4: STRENGTHS VS. GAP AREAS
  // ================================================================

  private generateStrengthsVsGaps(results: AssessmentResults): void {
    this.addSectionTitle('Strengths vs. Gap Areas', 'Performance breakdown by Lean topic category')

    const cats = this.getCategoryAnalysis(results)
    Object.entries(cats).forEach(([cat, data]) => {
      this.checkPageBreak(90)

      const pct = Math.round((data.correct / data.total) * 100)
      const cardH = 72
      this.drawRoundedRect(this.margin, this.currentY, this.contentWidth, cardH, 6,
        BRAND_COLORS.white, BRAND_COLORS.lightGrey, 1)

      // Shadow effect (thin dark rect behind)
      this.doc.setFillColor(220, 220, 220)
      this.doc.rect(this.margin + 2, this.currentY + 2, this.contentWidth, cardH, 'F')
      this.drawRoundedRect(this.margin, this.currentY, this.contentWidth, cardH, 6,
        BRAND_COLORS.white, BRAND_COLORS.lightGrey, 1)

      // Score % badge
      const badgeColor = pct >= 60 ? BRAND_COLORS.green : BRAND_COLORS.red
      this.drawRoundedRect(this.pageWidth - this.margin - 52, this.currentY + 10, 44, 22, 4,
        badgeColor, badgeColor, 0)
      this.addText(`${pct}%`, this.pageWidth - this.margin - 30, this.currentY + 25,
        FONTS.body, BRAND_COLORS.white, 'center')

      // Category name
      this.addText(cat, this.margin + 12, this.currentY + 22, FONTS.h4, BRAND_COLORS.black)

      // Combined green+red bar
      const barY = this.currentY + 36
      const totalBarW = this.contentWidth - 80
      const gW = data.total > 0 ? (data.correct / data.total) * totalBarW : 0
      const rW = data.total > 0 ? (data.incorrect / data.total) * totalBarW : 0
      this.drawRoundedRect(this.margin + 12, barY, totalBarW, 10, 5, BRAND_COLORS.lightGrey)
      if (gW > 0) this.drawRoundedRect(this.margin + 12, barY, gW, 10, 5, BRAND_COLORS.green)
      if (rW > 0) this.drawRoundedRect(this.margin + 12 + gW, barY, rW, 10, 5, BRAND_COLORS.red)

      // Count labels
      this.addText(`[OK] ${data.correct}`, this.margin + 12, barY + 24, FONTS.small, BRAND_COLORS.green)
      this.addText(`[X] ${data.incorrect}`, this.margin + 70, barY + 24, FONTS.small, BRAND_COLORS.red)

      this.currentY += cardH + 14
    })
  }

  // ================================================================
  // PAGE 5: PERSONALISED RECOMMENDATIONS
  // ================================================================

  private generateRecommendations(results: AssessmentResults): void {
    const content = this.getRecommendationContent(results.readiness_level)
    this.addSectionTitle('Personalised Recommendations', `Based on your ${results.readiness_level} readiness level`)

    const rc = this.getReadinessColor(results.readiness_level)
    const descH = this.textHeight(content.description, FONTS.body, this.contentWidth - 40)
    const boxH = Math.max(90, descH + 50)
    this.checkPageBreak(boxH + 20)

    this.drawRoundedRect(this.margin, this.currentY, this.contentWidth, boxH, 8, rc.bg, rc.bg, 0)
    this.addText(content.title, this.margin + 20, this.currentY + 26, FONTS.h3, rc.text)
    const h = this.addWrappedText(content.description, this.margin + 20, this.currentY + 48,
      FONTS.body, rc.text, this.contentWidth - 40)
    this.currentY += boxH + 20

    this.addText('Recommended Next Steps', this.margin, this.currentY, FONTS.h3, BRAND_COLORS.black)
    this.currentY += 20

    content.nextSteps.forEach((step, i) => {
      this.checkPageBreak(28)
      const stepH = this.textHeight(step, FONTS.body, this.contentWidth - 52)
      const sh = Math.max(32, stepH + 12)
      this.drawRoundedRect(this.margin, this.currentY, this.contentWidth, sh, 4,
        BRAND_COLORS.lightGrey, BRAND_COLORS.lightGrey, 0)
      // Number circle
      this.doc.setFillColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
      this.doc.circle(this.margin + 16, this.currentY + sh / 2, 10, 'F')
      this.addText(String(i + 1), this.margin + 16, this.currentY + sh / 2 + 4,
        FONTS.small, BRAND_COLORS.black, 'center')
      this.addWrappedText(step, this.margin + 34, this.currentY + 18,
        FONTS.body, BRAND_COLORS.darkGrey, this.contentWidth - 52)
      this.currentY += sh + 8
    })
  }

  // ================================================================
  // PAGE 6: 90-DAY ACTION PLAN
  // ================================================================

  private generate90DayActionPlanSection(results: AssessmentResults): void {
    this.addSectionTitle('90-Day Action Plan', 'Your personalised roadmap to Lean excellence')

    const months = this.generate90DayActionPlan(results)
    months.forEach((month, mi) => {
      this.checkPageBreak(120)

      // Month header bar
      this.drawRoundedRect(this.margin, this.currentY, this.contentWidth, 32, 4,
        BRAND_COLORS.black, BRAND_COLORS.black, 0)
      this.addText(month.month, this.margin + 16, this.currentY + 22, FONTS.h4, BRAND_COLORS.yellow)
      this.currentY += 42

      month.actions.forEach((action) => {
        this.checkPageBreak(30)
        const ah = this.textHeight(action, FONTS.body, this.contentWidth - 30)
        const lineH = Math.max(24, ah + 8)
        // Bullet dot
        this.doc.setFillColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
        this.doc.circle(this.margin + 8, this.currentY + lineH / 2, 4, 'F')
        this.addWrappedText(action, this.margin + 20, this.currentY + 14,
          FONTS.body, BRAND_COLORS.darkGrey, this.contentWidth - 30)
        this.currentY += lineH + 4
      })
      this.currentY += 16
    })
  }

  // ================================================================
  // PAGE 7: RECOMMENDED LEARNING PATH
  // ================================================================

  private generateLearningPath(results: AssessmentResults): void {
    const rec = this.getCourseRecommendations(results.readiness_level)
    this.addSectionTitle('Recommended Learning Path', 'Personalised course recommendations')

    // Readiness track badge
    const rc = this.getReadinessColor(results.readiness_level)
    this.drawRoundedRect(this.margin, this.currentY, 160, 26, 4, rc.bg, rc.bg, 0)
    this.addText(`${results.readiness_level} Track`, this.margin + 80, this.currentY + 17,
      FONTS.small, rc.text, 'center')
    this.currentY += 42

    if ('courses' in rec) {
      // Beginner / Developing: multi-course layout
      this.addText(rec.title, this.margin, this.currentY, FONTS.h3, BRAND_COLORS.black)
      this.currentY += 16
      const descH = this.addWrappedText(rec.description, this.margin, this.currentY,
        FONTS.body, BRAND_COLORS.mediumGrey, this.contentWidth)
      this.currentY += descH + 20

      rec.courses.forEach((course: any, i: number) => {
        this.checkPageBreak(120)
        const courseDescH = this.textHeight(course.description, FONTS.small, this.contentWidth - 40)
        const cardH = Math.max(110, courseDescH + 80)
        this.drawRoundedRect(this.margin, this.currentY, this.contentWidth, cardH, 6,
          BRAND_COLORS.white, BRAND_COLORS.lightGrey, 1)

        // Step circle
        this.doc.setFillColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
        this.doc.circle(this.margin + 22, this.currentY + 28, 16, 'F')
        this.addText(String(i + 1), this.margin + 22, this.currentY + 33,
          FONTS.body, BRAND_COLORS.black, 'center')

        // Course name
        this.addText(course.name, this.margin + 48, this.currentY + 24, FONTS.h4, BRAND_COLORS.black)

        // Pricing
        this.addText(course.originalPrice, this.pageWidth - this.margin - 60,
          this.currentY + 20, FONTS.small, BRAND_COLORS.mediumGrey)
        this.doc.setDrawColor(BRAND_COLORS.mediumGrey[0], BRAND_COLORS.mediumGrey[1], BRAND_COLORS.mediumGrey[2])
        const opW = this.doc.getTextWidth(course.originalPrice)
        this.doc.line(this.pageWidth - this.margin - 60,
          this.currentY + 16,
          this.pageWidth - this.margin - 60 + opW,
          this.currentY + 16)

        // Discount badge
        this.drawRoundedRect(this.pageWidth - this.margin - 62, this.currentY + 26, 54, 20, 4,
          BRAND_COLORS.yellow, BRAND_COLORS.yellow, 0)
        this.addText('20% OFF', this.pageWidth - this.margin - 35, this.currentY + 39,
          FONTS.caption, BRAND_COLORS.black, 'center')

        // Discounted price
        this.addText(course.price, this.pageWidth - this.margin - 62,
          this.currentY + 60, FONTS.h3, BRAND_COLORS.green)

        // Description
        const dh = this.addWrappedText(course.description, this.margin + 48, this.currentY + 44,
          FONTS.small, BRAND_COLORS.darkGrey, this.contentWidth - 130)

        // Enrol link
        const linkY = this.currentY + cardH - 22
        this.addLinkText('Enrol Now ->', this.margin + 48, linkY,
          FONTS.small, BRAND_COLORS.blue, course.url)

        this.currentY += cardH + 12
      })

    } else {
      // Intermediate / Advanced: single premium card
      this.checkPageBreak(200)
      const cardH = 240
      this.drawRoundedRect(this.margin, this.currentY, this.contentWidth, cardH, 8,
        BRAND_COLORS.white, BRAND_COLORS.yellow, 2)

      this.addText(rec.title, this.margin + 20, this.currentY + 30, FONTS.h3, BRAND_COLORS.black)
      const dh = this.addWrappedText(rec.description, this.margin + 20, this.currentY + 52,
        FONTS.body, BRAND_COLORS.darkGrey, this.contentWidth - 200)

      // Pricing column
      const priceX = this.pageWidth - this.margin - 120
      this.addText(rec.price, priceX, this.currentY + 36, FONTS.body, BRAND_COLORS.mediumGrey)
      this.doc.setDrawColor(BRAND_COLORS.mediumGrey[0], BRAND_COLORS.mediumGrey[1], BRAND_COLORS.mediumGrey[2])
      const pw = this.doc.getTextWidth(rec.price)
      this.doc.line(priceX, this.currentY + 32, priceX + pw, this.currentY + 32)

      this.addText(rec.discountedPrice, priceX, this.currentY + 60, FONTS.h2, BRAND_COLORS.green)

      this.drawRoundedRect(priceX, this.currentY + 68, 110, 24, 4,
        BRAND_COLORS.red, BRAND_COLORS.red, 0)
      this.addText('60% OFF', priceX + 55, this.currentY + 83, FONTS.small, BRAND_COLORS.white, 'center')

      // Feature grid 2-col
      const feats = rec.features || []
      const fY = this.currentY + 110
      feats.forEach((f: string, fi: number) => {
        const col = fi % 2 === 0 ? this.margin + 20 : this.margin + this.contentWidth / 2
        const row = Math.floor(fi / 2)
        this.addText('[+] ' + f, col, fY + row * 20, FONTS.small, BRAND_COLORS.darkGrey)
      })

      // CTA link
      this.addLinkText('>> Enrol Now', this.margin + 20, this.currentY + cardH - 18,
        FONTS.body, BRAND_COLORS.blue, rec.url)

      this.currentY += cardH + 20
    }
  }

  // ================================================================
  // PAGE 8+: Q&A ANALYSIS
  // ================================================================

  private generateQuestionAnalysis(results: AssessmentResults): void {
    this.addSectionTitle('Q&A Analysis', 'Review your answers and learn from each question')

    results.questions.forEach((q, idx) => {
      const userAnswer = this.getAnswer(results, q.id)
      const isCorrect  = userAnswer === q.correctAnswer

      const expText = isCorrect
        ? `[OK] ${q.explanation || 'Correct — strong understanding demonstrated.'}`
        : `[!] ${q.explanation || 'Review this area to strengthen your knowledge.'}`

      const expH = this.textHeight(expText, FONTS.small, this.contentWidth - 52)
      const cardH = Math.max(90, expH + 64)
      this.checkPageBreak(cardH + 12)

      const fillColor: [number,number,number] = isCorrect ? [235, 255, 235] : [255, 235, 235]
      const borderColor = isCorrect ? BRAND_COLORS.green : BRAND_COLORS.red
      this.drawRoundedRect(this.margin, this.currentY, this.contentWidth, cardH, 6,
        fillColor, borderColor, 1)

      // Status badge
      const badge = isCorrect ? '[OK]' : '[X]'
      this.drawRoundedRect(this.margin + 8, this.currentY + 8, 36, 22, 4,
        borderColor, borderColor, 0)
      this.addText(badge, this.margin + 26, this.currentY + 22, FONTS.caption, BRAND_COLORS.white, 'center')

      // Question number + text
      this.addText(`Q${idx + 1}:`, this.margin + 52, this.currentY + 20, FONTS.small, BRAND_COLORS.black)
      const qH = this.addWrappedText(q.question, this.margin + 72, this.currentY + 20,
        FONTS.small, BRAND_COLORS.black, this.contentWidth - 82)

      // Answer line
      const ansY = this.currentY + Math.max(36, qH + 24)
      this.addText(
        `Your answer: ${userAnswer}${isCorrect ? '' : '  |  Correct: ' + q.correctAnswer}`,
        this.margin + 52, ansY, FONTS.small,
        isCorrect ? BRAND_COLORS.green : BRAND_COLORS.red
      )

      // Explanation
      this.addWrappedText(expText, this.margin + 52, ansY + 18,
        FONTS.small, BRAND_COLORS.mediumGrey, this.contentWidth - 62)

      this.currentY += cardH + 10
    })
  }

  // ================================================================
  // FINAL PAGE: INSPIRATION & NEXT STEPS
  // ================================================================

  private generateQuotePage(results: AssessmentResults): void {
    // Dark background
    this.doc.setFillColor(BRAND_COLORS.black[0], BRAND_COLORS.black[1], BRAND_COLORS.black[2])
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F')

    const cx = this.pageWidth / 2
    this.drawLogo(cx, 120, 36)

    this.addText('"The journey of a thousand miles begins with a single step."',
      cx, 210, FONTS.h3, BRAND_COLORS.yellow, 'center')
    this.addText('— Lao Tzu', cx, 238, FONTS.body, BRAND_COLORS.mediumGrey, 'center')

    this.doc.setFillColor(BRAND_COLORS.yellow[0], BRAND_COLORS.yellow[1], BRAND_COLORS.yellow[2])
    this.doc.rect(cx - 60, 258, 120, 2, 'F')

    this.addText('Your next step:', cx, 296, FONTS.h3, BRAND_COLORS.white, 'center')
    this.addText(
      results.readiness_level === 'Advanced' || results.readiness_level === 'Intermediate'
        ? 'Enrol in the Certified Lean Practitioner Bundle and lead transformation.'
        : 'Start with the foundational courses and build your Lean expertise.',
      cx, 322, FONTS.body, BRAND_COLORS.lightGrey, 'center')

    this.addText('academy.continuousimprovement.education',
      cx, 380, FONTS.body, BRAND_COLORS.yellow, 'center')
    this.doc.link(cx - 140, 362, 280, 22,
      { url: 'https://academy.continuousimprovement.education' })

    this.addText(`(c) ${this.getCurrentYear()} Kaizen Academy — Empowering Operational Excellence Worldwide`,
      cx, this.pageHeight - 40, FONTS.caption, BRAND_COLORS.mediumGrey, 'center')
  }

  // ================================================================
  // FOOTER
  // ================================================================

  private addFooter(assessmentId: string, page: number, totalPages: number): void {
    const fy = this.pageHeight - 30
    this.doc.setDrawColor(BRAND_COLORS.lightGrey[0], BRAND_COLORS.lightGrey[1], BRAND_COLORS.lightGrey[2])
    this.doc.setLineWidth(1)
    this.doc.line(this.margin, fy - 10, this.pageWidth - this.margin, fy - 10)
    this.addText('Kaizen Academy', this.margin, fy, FONTS.caption, BRAND_COLORS.black)
    this.addText(`Page ${page} of ${totalPages}`, this.pageWidth / 2, fy, FONTS.caption, BRAND_COLORS.mediumGrey, 'center')
    this.addText(`ID: ${assessmentId}`, this.pageWidth - this.margin, fy, FONTS.caption, BRAND_COLORS.mediumGrey, 'right')
  }
}

// ================================================================
// EXPORT
// ================================================================

export const createUnifiedPDF = async (results: AssessmentResults): Promise<string> => {
  const gen = new UnifiedPDFGenerator()
  const url = await gen.generateReport(results)
  if (!url.startsWith('data:application/pdf')) throw new Error('Invalid PDF output')
  console.log('PDF generated, size:', url.length)
  return url
}

export default createUnifiedPDF
