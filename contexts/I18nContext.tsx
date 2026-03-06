"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { translations, Translation, supportedLanguages, defaultLanguage } from "@/lib/i18n/translations"

interface I18nContextType {
  language: string
  setLanguage: (lang: string) => void
  t: Translation
  supportedLanguages: typeof supportedLanguages
  isRTL: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<string>(defaultLanguage)

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage)
    } else {
      // Detect browser language
      const browserLanguage = navigator.language.split('-')[0]
      if (translations[browserLanguage]) {
        setLanguageState(browserLanguage)
      }
    }
  }, [])

  const setLanguage = (lang: string) => {
    if (translations[lang]) {
      setLanguageState(lang)
      localStorage.setItem('language', lang)
      // Update HTML lang attribute
      document.documentElement.lang = lang
    }
  }

  // Check if current language is RTL (right-to-left)
  const isRTL = ['ar', 'he', 'fa', 'ur'].includes(language)

  const t = translations[language] || translations[defaultLanguage]

  const value: I18nContextType = {
    language,
    setLanguage,
    t,
    supportedLanguages,
    isRTL
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Helper function for translation interpolation
export function translateWithParams(text: string, params: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match
  })
}
