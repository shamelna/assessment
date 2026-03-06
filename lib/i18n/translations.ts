export interface Translation {
  // Nav
  signIn: string
  signOut: string
  myHistory: string
  newAssessment: string
  startAssessment: string
  // Hero
  heroTitle: string
  heroDescription: string
  // Assessment
  assessmentTitle: string
  question: string
  of: string
  next: string
  previous: string
  submit: string
  // Results
  yourScore: string
  readinessLevel: string
  downloadPDF: string
  sendEmail: string
  // General
  loading: string
  error: string
  back: string
}

const en: Translation = {
  signIn: 'Sign In',
  signOut: 'Sign Out',
  myHistory: 'My History',
  newAssessment: 'New Assessment',
  startAssessment: 'Start Assessment',
  heroTitle: 'Lean & Operational Excellence Assessment',
  heroDescription: 'Discover your current level of Lean knowledge and get a personalised learning path to advance your career.',
  assessmentTitle: 'Operational Excellence Assessment',
  question: 'Question',
  of: 'of',
  next: 'Next',
  previous: 'Previous',
  submit: 'Submit',
  yourScore: 'Your Score',
  readinessLevel: 'Readiness Level',
  downloadPDF: 'Download PDF Report',
  sendEmail: 'Send Results to Email',
  loading: 'Loading...',
  error: 'An error occurred',
  back: 'Back',
}

const ar: Translation = {
  signIn: 'تسجيل الدخول',
  signOut: 'تسجيل الخروج',
  myHistory: 'سجلاتي',
  newAssessment: 'تقييم جديد',
  startAssessment: 'ابدأ التقييم',
  heroTitle: 'تقييم اللين والتميز التشغيلي',
  heroDescription: 'اكتشف مستواك الحالي في معرفة اللين واحصل على مسار تعلم مخصص للتقدم في مسيرتك المهنية.',
  assessmentTitle: 'تقييم التميز التشغيلي',
  question: 'سؤال',
  of: 'من',
  next: 'التالي',
  previous: 'السابق',
  submit: 'إرسال',
  yourScore: 'درجتك',
  readinessLevel: 'مستوى الاستعداد',
  downloadPDF: 'تحميل تقرير PDF',
  sendEmail: 'إرسال النتائج بالبريد الإلكتروني',
  loading: 'جاري التحميل...',
  error: 'حدث خطأ',
  back: 'رجوع',
}

export const translations: Record<string, Translation> = { en, ar }

export const supportedLanguages = [
  { code: 'en', name: 'English', flag: 'EN' },
  { code: 'ar', name: 'العربية', flag: 'AR' },
]

export const defaultLanguage = 'en'
